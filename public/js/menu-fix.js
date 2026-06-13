/**
 * Modular Menu System for PeppleOS
 * Provides better structure, debugging, and mobile/desktop compatibility
 */

// Create self-contained module
const PeppleMenu = (() => {
  // Private state
  let state = {
    menuActive: false,
    activeMenuItem: null,
    isInitialized: false,
    isMobile: window.innerWidth <= 428,
    debug: true, // Set to true to enable debug logs
    visualDebug: false // Visual debugging mode
  };
  
  // Cache DOM elements
  let elements = {
    menuBar: null,
    menuItems: null,
    submenus: null,
    appWindows: null
  };
  
  // Module interface
  const api = {
    init,
    toggle,
    closeAll,
    getState,
    enableDebug,
    disableDebug,
    toggleVisualDebug,
    enableVisualDebug,
    disableVisualDebug,
    handleMenuAction
  };
  
  /**
   * Initialize the menu system
   */
  function init() {
    if (state.isInitialized) {
      log('Menu already initialized, skipping');
      return api;
    }
    
    log('Initializing PeppleMenu');
    
    // Cache DOM references
    cacheElements();
    
    // Apply base styles
    applyBaseStyles();
    
    // Attach event handlers
    attachEventHandlers();
    
    // Mark as initialized
    state.isInitialized = true;
    
    // Check if mobile and adjust accordingly
    checkAndAdjustForMobile();
    
    log('PeppleMenu initialization complete');
    return api;
  }
  
  /**
   * Cache DOM element references
   */
  function cacheElements() {
    log('Caching DOM elements');
    elements.menuBar = document.querySelector('.menu-bar');
    elements.menuItems = document.querySelectorAll('.menu-left > ul > li');
    elements.submenus = document.querySelectorAll('.menu-left > ul > li > ul');
    elements.appWindows = document.querySelectorAll('.app-window');
    
    if (!elements.menuBar) {
      error('Menu bar not found');
    } else {
      log(`Found ${elements.menuItems.length} menu items and ${elements.submenus.length} submenus`);
    }
  }
  
  /**
   * Apply base styles required for proper menu function
   */
  function applyBaseStyles() {
    log('Applying base styles');
    if (elements.menuBar) {
      elements.menuBar.style.zIndex = '10000';
    }
    
    // Force proper z-index on menu elements
    elements.submenus.forEach((submenu, index) => {
      submenu.style.zIndex = '10004'; 
      log(`Set z-index for submenu ${index}`);
    });
  }
  
  /**
   * Attach all event handlers
   */
  function attachEventHandlers() {
    log('Attaching event handlers');
    
    // Only attach if not already attached by dom.js
    // Check if elements have event listeners before replacing
    const hasClickListener = (el) => {
      try {
        // This is not a perfect check, but it avoids duplicate handlers
        return el.onclick !== null || el._hasMenuClickHandler === true;
      } catch (e) {
        return false;
      }
    };
    
    // Replace menu items to clear existing listeners
    elements.menuItems.forEach((item, index) => {
      if (!hasClickListener(item)) {
        const newItem = item.cloneNode(true);
        newItem._hasMenuClickHandler = true;
        item.parentNode.replaceChild(newItem, item);
        
        // Add click handler
        newItem.addEventListener('click', handleMenuItemClick);
        log(`Added click handler to menu item ${index}`);
      } else {
        log(`Menu item ${index} already has click handlers, skipping`);
      }
    });
    
    // Refresh elements after DOM changes
    elements.menuItems = document.querySelectorAll('.menu-left > ul > li');
    
    // Handle submenu items
    const submenuItems = document.querySelectorAll('.menu-left > ul > li > ul > li');
    submenuItems.forEach((submenuItem, index) => {
      if (!hasClickListener(submenuItem)) {
        const newSubmenuItem = submenuItem.cloneNode(true);
        newSubmenuItem._hasMenuClickHandler = true;
        submenuItem.parentNode.replaceChild(newSubmenuItem, submenuItem);
        
        // Add click handler
        newSubmenuItem.addEventListener('click', handleSubmenuItemClick);
        log(`Added click handler to submenu item ${index}`);
      } else {
        log(`Submenu item ${index} already has click handlers, skipping`);
      }
    });
    
    // Document click handler to close menus
    document.addEventListener('click', handleDocumentClick);
    
    // Window resize handler
    window.addEventListener('resize', handleWindowResize);
    
    // Add touch support
    attachTouchHandlers();
    
    // Add keyboard shortcut for toggling debug mode
    document.addEventListener('keydown', function(e) {
      // Ctrl+D (or Cmd+D) toggles visual debug mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleVisualDebug();
      }
      
      // Ctrl+M (or Cmd+M) toggles menu
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        toggle('menu-finder');
      }
    });
    
    // Log event handler conflicts for debugging
    const checkEventConflicts = () => {
      // Check for any dom.js event handlers that might conflict
      const domEventHandlers = {
        'finder': 'displayFinder',
        'menu-finder-about': 'displayIntro',
        'menu-finder-open': 'displayFinder'
      };
      
      Object.entries(domEventHandlers).forEach(([id, handlerName]) => {
        const element = document.getElementById(id);
        if (element && element.onclick !== null) {
          log(`Potential event handler conflict: ${id} has onclick handler from dom.js (${handlerName})`);
        }
      });
    };
    
    // Call after a small delay to ensure dom.js has initialized
    setTimeout(checkEventConflicts, 1000);
  }
  
  /**
   * Handle click on a main menu item
   */
  function handleMenuItemClick(e) {
    e.stopPropagation();
    log(`Menu item clicked: ${this.textContent.trim()}`);
    
    const submenu = this.querySelector('ul');
    if (!submenu) return;
    
    const isVisible = submenu.style.display === 'block';
    
    // First hide all submenus
    elements.submenus.forEach(menu => {
      menu.style.display = 'none';
    });
    
    // Toggle this one
    if (!isVisible) {
      // Show this submenu
      submenu.style.display = 'block';
      state.menuActive = true;
      state.activeMenuItem = this;
      
      log(`Showing submenu for ${this.textContent.trim()}`);
      
      // Disable window clicks
      elements.appWindows.forEach(win => {
        win.style.pointerEvents = 'none';
      });
    } else {
      // Hide and cleanup
      state.menuActive = false;
      state.activeMenuItem = null;
      
      log(`Hiding submenu for ${this.textContent.trim()}`);
      
      // Re-enable window clicks
      elements.appWindows.forEach(win => {
        win.style.pointerEvents = 'auto';
      });
    }
  }
  
  /**
   * Handle click on a submenu item
   */
  function handleSubmenuItemClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const id = this.id;
    log(`Submenu item clicked: ${id}`);
    
    // Handle specific actions
    handleMenuAction(id);
    
    // Hide all menus
    closeAll();
  }
  
  /**
   * Handle click anywhere in the document
   */
  function handleDocumentClick(e) {
    // Skip if clicking on menu
    if (e.target.closest('.menu-left')) return;
    
    if (state.menuActive) {
      log('Document clicked, closing menus');
      closeAll();
    }
  }
  
  /**
   * Handle window resize
   */
  function handleWindowResize() {
    log('Window resized');
    
    // Check if we crossed the mobile threshold
    const wasMobile = state.isMobile;
    state.isMobile = window.innerWidth <= 428;
    
    if (wasMobile !== state.isMobile) {
      log(`Device type changed: ${state.isMobile ? 'mobile' : 'desktop'}`);
      checkAndAdjustForMobile();
    }
    
    // Reset menu state
    closeAll();
  }
  
  /**
   * Attach touch-specific event handlers
   */
  function attachTouchHandlers() {
    log('Attaching touch handlers');
    
    // Prevent default on menu touch to avoid scroll interference
    document.body.addEventListener('touchstart', function(e) {
      // Prevent default only if touching a menu item to avoid breaking scroll
      if (e.target.closest('.menu-left > ul > li')) {
        // Don't prevent default on the whole document to allow scrolling
        if (e.target.closest('.menu-left > ul > li > ul')) {
          // Allow submenu scrolling if needed
          const submenu = e.target.closest('.menu-left > ul > li > ul');
          if (submenu.scrollHeight > submenu.clientHeight) {
            return;
          }
        }
        e.preventDefault();
        log('Touch prevented default on menu');
      }
    }, { passive: false });
    
    // Handle touchend on submenu items
    document.body.addEventListener('touchend', function(e) {
      if (e.target.closest('.menu-left > ul > li > ul > li')) {
        // Trigger click on menu items
        setTimeout(() => {
          e.target.click();
          log('Touch triggered click on submenu item');
        }, 10);
      }
    }, { passive: true });
  }
  
  /**
   * Check if we're on mobile and make adjustments
   */
  function checkAndAdjustForMobile() {
    if (state.isMobile) {
      log('Applying mobile optimizations');
      document.body.classList.add('mobile-view');
      
      // Higher menu z-indices on mobile
      if (elements.menuBar) elements.menuBar.style.zIndex = '10000';
    } else {
      log('Applying desktop optimizations');
      document.body.classList.remove('mobile-view');
    }
    
    // Re-apply visual debug if needed
    if (state.visualDebug) {
      enableVisualDebug();
    }
  }
  
  /**
   * Close all menus
   */
  function closeAll() {
    log('Closing all menus');
    
    elements.submenus.forEach(menu => {
      menu.style.display = 'none';
    });
    
    state.menuActive = false;
    state.activeMenuItem = null;
    
    // Re-enable window interaction
    elements.appWindows.forEach(win => {
      win.style.pointerEvents = 'auto';
    });
  }
  
  /**
   * Toggle a specific menu programmatically
   */
  function toggle(menuId) {
    const menuItem = document.getElementById(menuId);
    if (menuItem) {
      log(`Programmatically toggling menu: ${menuId}`);
      menuItem.click();
      return true;
    }
    
    error(`Menu item not found: ${menuId}`);
    return false;
  }
  
  /**
   * Handle a specific menu action
   */
  function handleMenuAction(id) {
    log(`Handling menu action: ${id}`);
    
    // First try to find existing functions in global scope (dom.js)
    const actionMap = {
      'menu-finder-about': 'displayIntro',
      'menu-finder-open': 'displayFinder',
      'menu-finder-launch': 'displayLaunchpad',
      'menu-go-open': 'displaySafari',
      'menu-window-close': 'closeAllWindows',
      'menu-file-close': 'closeCurrentWindow',
      'menu-view-about': 'displayIntro',
      'menu-help-debug': 'toggleVisualDebug'
    };
    
    const actionFunction = actionMap[id];
    
    if (actionFunction && typeof window[actionFunction] === 'function') {
      log(`Calling existing DOM function: ${actionFunction}`);
      try {
        window[actionFunction]();
        return;
      } catch (e) {
        error(`Error calling ${actionFunction}: ${e.message}`);
      }
    }
    
    // Fallback to our internal implementation
    switch(id) {
      case 'menu-finder-about':
        showWindow('intro-window');
        break;
      case 'menu-finder-open':
        showWindow('finder-app');
        break;
      case 'menu-go-open':
        showWindow('internet-window');
        break;
      case 'menu-window-close':
        closeAllWindows();
        break;
      case 'menu-file-close':
        closeCurrentWindow();
        break;
      case 'menu-help-debug':
        toggleVisualDebug();
        break;
      default:
        log(`No action defined for: ${id}`);
    }
  }
  
  /**
   * Show a specific window
   */
  function showWindow(id) {
    log(`Showing window: ${id}`);
    
    const windowToShow = document.getElementById(id);
    if (windowToShow) {
      // Hide all other windows first
      elements.appWindows.forEach(win => {
        win.style.display = 'none';
        win.classList.remove('active');
      });
      
      // Show this window
      windowToShow.style.display = 'block';
      windowToShow.classList.add('active');
      log(`Window ${id} is now visible`);
    } else {
      error(`Window not found: ${id}`);
    }
  }
  
  /**
   * Close all windows
   */
  function closeAllWindows() {
    log('Closing all windows');
    
    elements.appWindows.forEach(win => {
      win.style.display = 'none';
      win.classList.remove('active');
    });
  }
  
  /**
   * Close current active window
   */
  function closeCurrentWindow() {
    log('Closing current window');
    
    const activeWindow = document.querySelector('.app-window.active');
    if (activeWindow) {
      activeWindow.style.display = 'none';
      activeWindow.classList.remove('active');
      log(`Closed window: ${activeWindow.id}`);
    } else {
      log('No active window to close');
    }
  }
  
  /**
   * Return current state for debugging
   */
  function getState() {
    return {
      ...state,
      elements: {
        menuBarFound: !!elements.menuBar,
        menuItemCount: elements.menuItems?.length || 0,
        submenuCount: elements.submenus?.length || 0, 
        windowCount: elements.appWindows?.length || 0
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
   * Toggle visual debug mode
   */
  function toggleVisualDebug() {
    if (state.visualDebug) {
      disableVisualDebug();
    } else {
      enableVisualDebug();
    }
  }
  
  /**
   * Enable visual debug mode
   */
  function enableVisualDebug() {
    log('Enabling visual debug mode');
    document.body.classList.add('debug-mode');
    state.visualDebug = true;
    
    // Show debugging message
    const debugMessage = document.createElement('div');
    debugMessage.id = 'debug-message';
    debugMessage.style.position = 'fixed';
    debugMessage.style.bottom = '70px';
    debugMessage.style.left = '10px';
    debugMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugMessage.style.color = 'white';
    debugMessage.style.padding = '5px 10px';
    debugMessage.style.borderRadius = '4px';
    debugMessage.style.fontSize = '12px';
    debugMessage.style.zIndex = '10010';
    debugMessage.textContent = 'Debug Mode Active - Press Ctrl+D to toggle';
    
    // Remove any existing debug message
    const existingMessage = document.getElementById('debug-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    document.body.appendChild(debugMessage);
    
    // Hide message after 5 seconds
    setTimeout(() => {
      const msg = document.getElementById('debug-message');
      if (msg) {
        msg.style.opacity = '0';
        msg.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          if (msg && msg.parentNode) {
            msg.parentNode.removeChild(msg);
          }
        }, 500);
      }
    }, 5000);
  }
  
  /**
   * Disable visual debug mode
   */
  function disableVisualDebug() {
    log('Disabling visual debug mode');
    document.body.classList.remove('debug-mode');
    state.visualDebug = false;
    
    // Remove debug message if exists
    const debugMessage = document.getElementById('debug-message');
    if (debugMessage) {
      debugMessage.remove();
    }
  }
  
  /**
   * Log to console if debug is enabled
   */
  function log(message) {
    if (state.debug) {
      console.log(`[PeppleMenu] ${message}`);
    }
  }
  
  /**
   * Log error to console
   */
  function error(message) {
    console.error(`[PeppleMenu] ERROR: ${message}`);
  }
  
  // Return public API
  return api;
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Make sure we don't initialize before dom.js
  setTimeout(() => {
    // Initialize the menu system
    PeppleMenu.init();
    
    // Expose menu to global scope for debugging
    window.PeppleMenu = PeppleMenu;
    
    console.log('[PeppleMenu] Menu system loaded and ready for debugging');
    console.log('[PeppleMenu] Try: PeppleMenu.getState() or PeppleMenu.toggleVisualDebug() in console');
  }, 500);
}); 