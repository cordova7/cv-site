/**
 * Modular Finder System for PeppleOS
 * This module handles the Finder window and file browsing functionality
 */

const PeppleFinder = (() => {
  // Private state
  let state = {
    isInitialized: false,
    isVisible: false,
    currentView: 'home', // home, recents, desktop, documents, downloads, device
    debug: true
  };
  
  // Cache DOM elements
  let elements = {
    finderWindow: null,
    closeButton: null,
    leftNav: null,
    rightContent: null,
    sections: {
      recents: null,
      desktop: null,
      documents: null,
      downloads: null,
      device: null,
      welcome: null
    },
    navItems: {
      recents: null,
      desktop: null,
      documents: null,
      downloads: null,
      device: null
    }
  };
  
  // Module interface
  const api = {
    init,
    open,
    close,
    toggle,
    navigate,
    getState,
    enableDebug,
    disableDebug
  };
  
  /**
   * Initialize the Finder module
   */
  function init() {
    if (state.isInitialized) {
      log('Finder already initialized, skipping');
      return api;
    }
    
    log('Initializing PeppleFinder module');
    
    // Cache DOM references
    cacheElements();
    
    // Load content
    loadContent();
    
    // Attach event handlers
    attachEventHandlers();
    
    // Mark as initialized
    state.isInitialized = true;
    
    log('PeppleFinder initialization complete');
    return api;
  }
  
  /**
   * Cache DOM element references
   */
  function cacheElements() {
    log('Caching DOM elements');
    // Main elements
    elements.finderWindow = document.getElementById('finder-app');
    elements.closeButton = document.getElementById('finder-close');
    elements.leftNav = document.getElementById('finder-left-col');
    elements.rightContent = document.getElementById('finder-right-col');
    
    // Content sections
    elements.sections.recents = document.getElementById('finder-recents-container');
    elements.sections.desktop = document.getElementById('finder-desktop-container');
    elements.sections.documents = document.getElementById('finder-documents-container');
    elements.sections.downloads = document.getElementById('finder-downloads-container');
    elements.sections.device = document.getElementById('finder-mac-container');
    elements.sections.welcome = document.getElementById('finder-text-container');
    
    // Navigation items
    elements.navItems.recents = document.getElementById('recents');
    elements.navItems.desktop = document.getElementById('desktop');
    elements.navItems.documents = document.getElementById('documents');
    elements.navItems.downloads = document.getElementById('downloads');
    elements.navItems.device = document.getElementById('your-mac');
    
    if (!elements.finderWindow) {
      error('Finder window element not found');
    } else {
      log('Finder elements cached successfully');
    }
    
    // Handle missing sections by creating them if needed
    createMissingSections();
  }
  
  /**
   * Create any missing content sections
   */
  function createMissingSections() {
    // Check and create each required section if missing
    const requiredSections = ['recents', 'desktop', 'documents', 'downloads', 'device', 'welcome'];
    
    requiredSections.forEach(section => {
      if (!elements.sections[section] && elements.rightContent) {
        log(`Creating missing section: ${section}`);
        
        const sectionElement = document.createElement('div');
        sectionElement.id = `finder-${section}-container`;
        sectionElement.classList.add('finder-content-section');
        sectionElement.style.display = 'none';
        
        // Add some placeholder content
        const placeholderText = getPlaceholderText(section);
        sectionElement.innerHTML = `<p class="finder-text">${placeholderText}</p>`;
        
        // Add to DOM
        elements.rightContent.appendChild(sectionElement);
        
        // Update reference
        elements.sections[section] = sectionElement;
      }
    });
  }
  
  /**
   * Get placeholder text for a section
   */
  function getPlaceholderText(section) {
    const placeholders = {
      recents: 'Recently accessed files will appear here.',
      desktop: 'Desktop files will appear here.',
      documents: 'Documents will appear here.',
      downloads: 'Downloaded files will appear here.',
      device: 'Device storage information will appear here.',
      welcome: 'Welcome to Finder. Select a category from the sidebar to get started.'
    };
    
    return placeholders[section] || 'No content available.';
  }
  
  /**
   * Load Finder content
   */
  function loadContent() {
    log('Loading Finder content');
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
      
      // Update welcome text
      const welcomeText = elements.sections.welcome?.querySelector('.finder-text');
      if (welcomeText) {
        welcomeText.textContent = getConfigText('finder.welcome', 'Welcome to Finder. Select a category from the sidebar to get started.');
      }
      
      log('Finder content loaded successfully');
    } catch (e) {
      error(`Error loading Finder content: ${e.message}`);
    }
  }
  
  /**
   * Attach event handlers
   */
  function attachEventHandlers() {
    log('Attaching Finder event handlers');
    
    // Close button handler
    if (elements.closeButton) {
      elements.closeButton.addEventListener('click', close);
      log('Close button handler attached');
    }
    
    // Navigation item handlers
    if (elements.navItems) {
      Object.entries(elements.navItems).forEach(([section, element]) => {
        if (element) {
          // Remove any existing click handlers
          const newElement = element.cloneNode(true);
          element.parentNode.replaceChild(newElement, element);
          
          // Update reference
          elements.navItems[section] = newElement;
          
          // Add new handler
          newElement.addEventListener('click', () => navigate(section));
          log(`Navigation handler attached for ${section}`);
        }
      });
    }
    
    // Window drag functionality
    if (elements.finderWindow) {
      makeWindowDraggable(elements.finderWindow);
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
   * Navigate to a specific section
   */
  function navigate(section) {
    log(`Navigating to Finder section: ${section}`);
    
    // Make sure finder is open
    if (!state.isVisible) {
      open();
    }
    
    // Hide all sections
    Object.values(elements.sections).forEach(sectionElement => {
      if (sectionElement) {
        sectionElement.style.display = 'none';
      }
    });
    
    // Deactivate all nav items
    Object.values(elements.navItems).forEach(navItem => {
      if (navItem) {
        navItem.classList.remove('active');
      }
    });
    
    // Show requested section
    const targetSection = elements.sections[section];
    if (targetSection) {
      targetSection.style.display = 'block';
      log(`Showing section: ${section}`);
    } else {
      // Fallback to welcome if section not found
      if (elements.sections.welcome) {
        elements.sections.welcome.style.display = 'block';
      }
      log(`Section not found: ${section}, showing welcome instead`);
    }
    
    // Activate nav item
    const navItem = elements.navItems[section];
    if (navItem) {
      navItem.classList.add('active');
    }
    
    // Update state
    state.currentView = section;
    
    return true;
  }
  
  /**
   * Open the Finder window
   */
  function open() {
    log('Opening Finder window');
    
    if (!elements.finderWindow) {
      error('Cannot open Finder window: element not found');
      return false;
    }
    
    // Center window on screen if not already positioned
    if (!elements.finderWindow.style.left) {
      centerWindow();
    }
    
    // Close other windows if needed (optional)
    if (typeof window.closeAllWindows === 'function') {
      window.closeAllWindows();
    }
    
    elements.finderWindow.style.display = 'block';
    elements.finderWindow.classList.add('active');
    state.isVisible = true;
    
    // Navigate to home or current view
    if (state.currentView === 'home') {
      // Show welcome section
      Object.values(elements.sections).forEach(sectionElement => {
        if (sectionElement) {
          sectionElement.style.display = 'none';
        }
      });
      
      if (elements.sections.welcome) {
        elements.sections.welcome.style.display = 'block';
      }
    } else {
      // Resume current view
      navigate(state.currentView);
    }
    
    // Bring to front
    elements.finderWindow.style.zIndex = '10000';
    
    return true;
  }
  
  /**
   * Center the window on screen
   */
  function centerWindow() {
    if (!elements.finderWindow) return;
    
    // Only center on desktop
    if (window.innerWidth <= 428) {
      elements.finderWindow.style.left = '0';
      elements.finderWindow.style.top = '44px';
      elements.finderWindow.style.width = '100%';
      elements.finderWindow.style.height = 'calc(100% - 94px)';
      return;
    }
    
    const windowWidth = elements.finderWindow.offsetWidth || 700;
    const windowHeight = elements.finderWindow.offsetHeight || 500;
    
    const left = Math.max(0, (window.innerWidth - windowWidth) / 2);
    const top = Math.max(0, (window.innerHeight - windowHeight) / 2);
    
    elements.finderWindow.style.left = left + 'px';
    elements.finderWindow.style.top = top + 'px';
  }
  
  /**
   * Close the Finder window
   */
  function close() {
    log('Closing Finder window');
    
    if (!elements.finderWindow) {
      error('Cannot close Finder window: element not found');
      return false;
    }
    
    elements.finderWindow.style.display = 'none';
    elements.finderWindow.classList.remove('active');
    state.isVisible = false;
    
    return true;
  }
  
  /**
   * Toggle the Finder window
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
        windowFound: !!elements.finderWindow,
        closeButtonFound: !!elements.closeButton,
        sectionsFound: Object.entries(elements.sections)
          .map(([key, val]) => `${key}: ${!!val}`)
          .join(', ')
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
      console.log(`[PeppleFinder] ${message}`);
    }
  }
  
  /**
   * Log error to console
   */
  function error(message) {
    console.error(`[PeppleFinder] ERROR: ${message}`);
  }
  
  // Return public API
  return api;
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for other modules to initialize
  setTimeout(() => {
    // Initialize the Finder module
    PeppleFinder.init();
    
    // Expose module to global scope for debugging
    window.PeppleFinder = PeppleFinder;
    
    console.log('[PeppleFinder] Finder module loaded and ready');
    console.log('[PeppleFinder] Try: PeppleFinder.open() or PeppleFinder.navigate("recents") in console');
  }, 700);
}); 