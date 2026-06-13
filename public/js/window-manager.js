/**
 * PeppleOS Window Manager
 * Central system for managing all application windows
 */

const PeppleWindowManager = (() => {
  // Private state
  let state = {
    isInitialized: false,
    activeWindow: null,
    windows: {},
    zIndexCounter: 10000,
    debug: true
  };
  
  // Cache DOM elements
  let elements = {
    windowsContainer: null,
    windows: {}
  };
  
  // Module interface
  const api = {
    init,
    register,
    open,
    close,
    closeAll,
    focus,
    getActiveWindow,
    getState,
    enableDebug,
    disableDebug
  };
  
  /**
   * Initialize the Window Manager
   */
  function init() {
    if (state.isInitialized) {
      log('Window Manager already initialized, skipping');
      return api;
    }
    
    log('Initializing Window Manager');
    
    // Cache DOM references
    cacheElements();
    
    // Register existing windows
    registerExistingWindows();
    
    // Attach event handlers
    attachEventHandlers();
    
    // Mark as initialized
    state.isInitialized = true;
    
    log('Window Manager initialization complete');
    return api;
  }
  
  /**
   * Cache DOM element references
   */
  function cacheElements() {
    log('Caching DOM elements');
    elements.windowsContainer = document.querySelector('.windows-container');
    
    if (!elements.windowsContainer) {
      error('Windows container not found');
    } else {
      log('Windows container found');
    }
  }
  
  /**
   * Register existing windows in the DOM
   */
  function registerExistingWindows() {
    log('Registering existing windows');
    
    const windowElements = document.querySelectorAll('.app-window');
    windowElements.forEach(windowEl => {
      const id = windowEl.id;
      if (id) {
        register(id, windowEl);
      } else {
        warn('Found window element without ID, skipping');
      }
    });
    
    log(`Registered ${Object.keys(elements.windows).length} existing windows`);
  }
  
  /**
   * Attach event handlers for window management
   */
  function attachEventHandlers() {
    log('Attaching window manager event handlers');
    
    // Global ESC key handler for closing active window
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && state.activeWindow) {
        close(state.activeWindow);
      }
    });
    
    // Window resize handler
    window.addEventListener('resize', function() {
      // Adjust window positions for mobile/desktop
      const isMobile = window.innerWidth <= 428;
      
      Object.entries(elements.windows).forEach(([id, windowEl]) => {
        if (windowEl.style.display === 'block') {
          if (isMobile) {
            applyMobileWindowStyle(windowEl);
          } else {
            // Only reposition if not manually positioned
            if (!windowEl.dataset.manualPosition) {
              centerWindow(windowEl);
            }
          }
        }
      });
    });
  }
  
  /**
   * Register a window with the manager
   */
  function register(id, windowElement) {
    log(`Registering window: ${id}`);
    
    // If window element not provided, try to find it
    if (!windowElement) {
      windowElement = document.getElementById(id);
      if (!windowElement) {
        error(`Window element with ID ${id} not found`);
        return false;
      }
    }
    
    // Add to registry
    state.windows[id] = {
      id,
      isOpen: windowElement.style.display === 'block',
      zIndex: parseInt(windowElement.style.zIndex) || 1000,
      position: {
        x: parseInt(windowElement.style.left) || null,
        y: parseInt(windowElement.style.top) || null
      }
    };
    
    elements.windows[id] = windowElement;
    
    // Make window draggable
    makeWindowDraggable(windowElement);
    
    // Attach close button handler
    const closeButton = windowElement.querySelector('.dots-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => close(id));
      log(`Attached close button handler for ${id}`);
    }
    
    // Window click handler to bring to front
    windowElement.addEventListener('mousedown', () => focus(id));
    
    return true;
  }
  
  /**
   * Make a window draggable
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
      
      // Focus window
      const id = windowElement.id;
      if (id) focus(id);
      
      // Mark as manually positioned
      windowElement.dataset.manualPosition = 'true';
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
      
      // Update state
      const id = windowElement.id;
      if (id && state.windows[id]) {
        state.windows[id].position = { x: boundedX, y: boundedY };
      }
    }
    
    function endDrag() {
      isDragging = false;
    }
  }
  
  /**
   * Open a window by ID
   */
  function open(id) {
    log(`Opening window: ${id}`);
    
    const windowEl = elements.windows[id];
    if (!windowEl) {
      error(`Window not found: ${id}`);
      return false;
    }
    
    // Position window if needed
    const windowState = state.windows[id];
    const isMobile = window.innerWidth <= 428;
    
    if (isMobile) {
      applyMobileWindowStyle(windowEl);
    } else if (!windowState.position.x || !windowState.position.y) {
      centerWindow(windowEl);
    }
    
    // Show window
    windowEl.style.display = 'block';
    windowState.isOpen = true;
    
    // Focus window
    focus(id);
    
    return true;
  }
  
  /**
   * Close a window by ID
   */
  function close(id) {
    log(`Closing window: ${id}`);
    
    const windowEl = elements.windows[id];
    if (!windowEl) {
      error(`Window not found: ${id}`);
      return false;
    }
    
    // Hide window
    windowEl.style.display = 'none';
    windowEl.classList.remove('active');
    
    // Update state
    if (state.windows[id]) {
      state.windows[id].isOpen = false;
    }
    
    // If this was the active window, clear active window
    if (state.activeWindow === id) {
      state.activeWindow = null;
      
      // Find next highest window to focus
      const openWindows = Object.entries(state.windows)
        .filter(([_, w]) => w.isOpen)
        .sort((a, b) => b[1].zIndex - a[1].zIndex);
      
      if (openWindows.length > 0) {
        focus(openWindows[0][0]);
      }
    }
    
    return true;
  }
  
  /**
   * Close all windows
   */
  function closeAll() {
    log('Closing all windows');
    
    Object.keys(elements.windows).forEach(id => {
      close(id);
    });
    
    state.activeWindow = null;
    
    return true;
  }
  
  /**
   * Focus a window (bring to front)
   */
  function focus(id) {
    log(`Focusing window: ${id}`);
    
    const windowEl = elements.windows[id];
    if (!windowEl) {
      error(`Window not found: ${id}`);
      return false;
    }
    
    // Increment z-index counter
    state.zIndexCounter += 10;
    
    // Set as active window
    state.activeWindow = id;
    
    // Update z-index
    windowEl.style.zIndex = state.zIndexCounter;
    if (state.windows[id]) {
      state.windows[id].zIndex = state.zIndexCounter;
    }
    
    // Add active class
    windowEl.classList.add('active');
    
    // Remove active class from other windows
    Object.entries(elements.windows).forEach(([windowId, el]) => {
      if (windowId !== id) {
        el.classList.remove('active');
      }
    });
    
    return true;
  }
  
  /**
   * Get the currently active window ID
   */
  function getActiveWindow() {
    return state.activeWindow;
  }
  
  /**
   * Apply mobile-specific styling to a window
   */
  function applyMobileWindowStyle(windowEl) {
    windowEl.style.position = 'fixed';
    windowEl.style.top = '44px';
    windowEl.style.left = '0';
    windowEl.style.right = '0';
    windowEl.style.bottom = '50px';
    windowEl.style.width = '100%';
    windowEl.style.height = 'calc(100% - 94px)';
    windowEl.style.transform = 'none';
    windowEl.style.borderRadius = '0';
    windowEl.style.margin = '0';
    windowEl.style.maxWidth = 'none';
    
    // Remove manual position flag
    delete windowEl.dataset.manualPosition;
  }
  
  /**
   * Center a window on the screen
   */
  function centerWindow(windowEl) {
    const windowWidth = windowEl.offsetWidth || 600;
    const windowHeight = windowEl.offsetHeight || 400;
    
    const left = Math.max(0, (window.innerWidth - windowWidth) / 2);
    const top = Math.max(0, (window.innerHeight - windowHeight) / 2);
    
    windowEl.style.left = left + 'px';
    windowEl.style.top = top + 'px';
    
    // Update position in state
    const id = windowEl.id;
    if (id && state.windows[id]) {
      state.windows[id].position = { x: left, y: top };
    }
  }
  
  /**
   * Return current state for debugging
   */
  function getState() {
    return {
      ...state,
      elements: {
        windowsContainerFound: !!elements.windowsContainer,
        registeredWindows: Object.keys(elements.windows)
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
      console.log(`[WindowManager] ${message}`);
    }
  }
  
  /**
   * Log warning to console
   */
  function warn(message) {
    console.warn(`[WindowManager] ${message}`);
  }
  
  /**
   * Log error to console
   */
  function error(message) {
    console.error(`[WindowManager] ERROR: ${message}`);
  }
  
  // Return public API
  return api;
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for other modules to initialize first
  setTimeout(() => {
    // Initialize the Window Manager
    PeppleWindowManager.init();
    
    // Expose to global scope for debugging
    window.PeppleWindowManager = PeppleWindowManager;
    
    console.log('[WindowManager] Window Manager loaded and ready');
    console.log('[WindowManager] Try: PeppleWindowManager.getState() or PeppleWindowManager.open("finder-app") in console');
  }, 300);
}); 