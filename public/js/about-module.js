/**
 * Modular About Window System for PeppleOS
 * This module handles the "About PeppleOS" window functionality
 */

const PeppleAbout = (() => {
  // Private state
  let state = {
    isInitialized: false,
    isVisible: false,
    debug: true
  };
  
  // Cache DOM elements
  let elements = {
    aboutWindow: null,
    closeButton: null,
    introTitle: null,
    introDescription: null,
    introInfo1: null,
    introInfo2: null,
    introImage: null
  };
  
  // Module interface
  const api = {
    init,
    open,
    close,
    toggle,
    getState,
    enableDebug,
    disableDebug
  };
  
  /**
   * Initialize the About module
   */
  function init() {
    if (state.isInitialized) {
      log('About window already initialized, skipping');
      return api;
    }
    
    log('Initializing PeppleAbout module');
    
    // Cache DOM references
    cacheElements();
    
    // Load content
    loadContent();
    
    // Attach event handlers
    attachEventHandlers();
    
    // Mark as initialized
    state.isInitialized = true;
    
    log('PeppleAbout initialization complete');
    return api;
  }
  
  /**
   * Cache DOM element references
   */
  function cacheElements() {
    log('Caching DOM elements');
    elements.aboutWindow = document.getElementById('intro-window');
    elements.closeButton = document.getElementById('close');
    elements.introTitle = document.getElementById('intro-title');
    elements.introDescription = document.getElementById('intro-description');
    elements.introInfo1 = document.getElementById('intro-info1');
    elements.introInfo2 = document.getElementById('intro-info2');
    elements.introImage = document.getElementById('intro-image');
    
    if (!elements.aboutWindow) {
      error('About window element not found');
    } else {
      log('About window elements cached successfully');
    }
  }
  
  /**
   * Load about window content
   */
  function loadContent() {
    log('Loading About window content');
    try {
      // Get text from config if available
      const getConfigText = (key, fallback) => {
        if (window.config && window.config.text) {
          const parts = key.split('.');
          let value = window.config.text;
          for (const part of parts) {
            value = value[part];
            if (value === undefined) return fallback;
          }
          return value;
        }
        return fallback;
      };
      
      if (elements.introTitle) {
        elements.introTitle.textContent = getConfigText('intro.title', 'About PeppleOS');
      }
      
      if (elements.introDescription) {
        elements.introDescription.textContent = getConfigText('intro.description', 
          'PeppleOS is a web-based operating system interface.');
      }
      
      if (elements.introInfo1) {
        elements.introInfo1.textContent = getConfigText('intro.additionalInfo.0', 
          'Version: 1.0');
      }
      
      if (elements.introInfo2) {
        elements.introInfo2.textContent = getConfigText('intro.additionalInfo.1',
          'Created with ♥ by the Pepple team');
      }
      
      log('About window content loaded successfully');
    } catch (e) {
      error(`Error loading About window content: ${e.message}`);
    }
  }
  
  /**
   * Attach event handlers
   */
  function attachEventHandlers() {
    log('Attaching About window event handlers');
    
    // Close button handler
    if (elements.closeButton) {
      elements.closeButton.addEventListener('click', close);
      log('Close button handler attached');
    }
    
    // Window drag functionality
    if (elements.aboutWindow) {
      makeWindowDraggable(elements.aboutWindow);
      log('Window drag handler attached');
    }
    
    // Add keyboard shortcut (ESC to close)
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && state.isVisible) {
        close();
      }
    });
  }
  
  /**
   * Make the window draggable
   */
  function makeWindowDraggable(windowElement) {
    const header = windowElement.querySelector('.dots-wrapper');
    if (!header) return;
    
    let isDragging = false;
    let offsetX, offsetY;
    
    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    function startDrag(e) {
      // Skip if clicking on close button
      if (e.target.closest('.dots-close')) return;
      
      isDragging = true;
      offsetX = e.clientX - windowElement.getBoundingClientRect().left;
      offsetY = e.clientY - windowElement.getBoundingClientRect().top;
      windowElement.style.zIndex = '10000'; // Bring to front
    }
    
    function drag(e) {
      if (!isDragging) return;
      
      // Only on desktop - skip for mobile
      if (window.innerWidth <= 428) return;
      
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      
      // Stay within viewport
      const maxX = window.innerWidth - windowElement.offsetWidth;
      const maxY = window.innerHeight - windowElement.offsetHeight;
      
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));
      
      windowElement.style.left = boundedX + 'px';
      windowElement.style.top = boundedY + 'px';
    }
    
    function endDrag() {
      isDragging = false;
    }
  }
  
  /**
   * Open the About window
   */
  function open() {
    log('Opening About window');
    
    if (!elements.aboutWindow) {
      error('Cannot open About window: element not found');
      return false;
    }
    
    // Center window on screen if not already positioned
    if (!elements.aboutWindow.style.left) {
      centerWindow();
    }
    
    elements.aboutWindow.style.display = 'block';
    elements.aboutWindow.classList.add('active');
    state.isVisible = true;
    
    // Bring to front
    elements.aboutWindow.style.zIndex = '10000';
    
    return true;
  }
  
  /**
   * Center the window on screen
   */
  function centerWindow() {
    if (!elements.aboutWindow) return;
    
    // Only center on desktop
    if (window.innerWidth <= 428) {
      elements.aboutWindow.style.left = '0';
      elements.aboutWindow.style.top = '44px';
      elements.aboutWindow.style.width = '100%';
      elements.aboutWindow.style.height = 'calc(100% - 94px)';
      return;
    }
    
    const windowWidth = elements.aboutWindow.offsetWidth || 500;
    const windowHeight = elements.aboutWindow.offsetHeight || 300;
    
    const left = Math.max(0, (window.innerWidth - windowWidth) / 2);
    const top = Math.max(0, (window.innerHeight - windowHeight) / 2);
    
    elements.aboutWindow.style.left = left + 'px';
    elements.aboutWindow.style.top = top + 'px';
  }
  
  /**
   * Close the About window
   */
  function close() {
    log('Closing About window');
    
    if (!elements.aboutWindow) {
      error('Cannot close About window: element not found');
      return false;
    }
    
    elements.aboutWindow.style.display = 'none';
    elements.aboutWindow.classList.remove('active');
    state.isVisible = false;
    
    return true;
  }
  
  /**
   * Toggle the About window
   */
  function toggle() {
    if (state.isVisible) {
      return close();
    } else {
      return open();
    }
  }
  
  /**
   * Return current state for debugging
   */
  function getState() {
    return {
      ...state,
      elements: {
        windowFound: !!elements.aboutWindow,
        closeButtonFound: !!elements.closeButton
      }
    };
  }
  
  /**
   * Enable debug mode
   */
  function enableDebug() {
    state.debug = true;
    log('Debug mode enabled');
  }
  
  /**
   * Disable debug mode
   */
  function disableDebug() {
    log('Debug mode disabled');
    state.debug = false;
  }
  
  /**
   * Log to console if debug is enabled
   */
  function log(message) {
    if (state.debug) {
      console.log(`[PeppleAbout] ${message}`);
    }
  }
  
  /**
   * Log error to console
   */
  function error(message) {
    console.error(`[PeppleAbout] ERROR: ${message}`);
  }
  
  // Return public API
  return api;
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for other modules to initialize
  setTimeout(() => {
    // Initialize the About window module
    PeppleAbout.init();
    
    // Expose module to global scope for debugging
    window.PeppleAbout = PeppleAbout;
    
    console.log('[PeppleAbout] About window module loaded and ready');
    console.log('[PeppleAbout] Try: PeppleAbout.open() or PeppleAbout.toggle() in console');
  }, 600);
}); 