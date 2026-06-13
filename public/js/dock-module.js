/**
 * Modular Dock System for PeppleOS
 * This module handles the dock (bottom menu) functionality
 */

const PeppleDock = (() => {
  // Private state
  let state = {
    isInitialized: false,
    isMobile: window.innerWidth <= 428,
    activeAppId: null,
    debug: true
  };
  
  // Cache DOM elements
  let elements = {
    desktopDock: null,
    mobileDock: null,
    appIcons: {}
  };
  
  // App handlers mapping
  const appHandlers = {
    'finder': openFinder,
    'safari': openSafari,
    'stickies': openStickies,
    'contacts': openContacts,
    'calendar': openCalendar,
    'reminders': openReminders,
    'launchpad': openLaunchpad,
    'facetime': openFacetime,
    'settings': openSettings,
    'trash': openTrash,
    'harddisk': openHarddisk,
    'mobile-safari': openSafari,
    'mobile-stickies': openStickies
  };
  
  // Module interface
  const api = {
    init,
    launchApp,
    highlightApp,
    resetHighlights,
    getState,
    enableDebug,
    disableDebug
  };
  
  /**
   * Initialize the Dock module
   */
  function init() {
    if (state.isInitialized) {
      log('Dock already initialized, skipping');
      return api;
    }
    
    log('Initializing PeppleDock module');
    
    // Cache DOM references
    cacheElements();
    
    // Apply base styles
    applyBaseStyles();
    
    // Attach event handlers
    attachEventHandlers();
    
    // Mark as initialized
    state.isInitialized = true;
    
    log('PeppleDock initialization complete');
    return api;
  }
  
  /**
   * Cache DOM element references
   */
  function cacheElements() {
    log('Caching DOM elements');
    elements.desktopDock = document.getElementById('desktop-dock');
    elements.mobileDock = document.getElementById('mobile-dock');
    
    // Cache app icons
    const appIconIds = [
      'finder', 'safari', 'stickies', 'contacts', 'calendar', 
      'reminders', 'launchpad', 'facetime', 'settings', 'trash',
      'harddisk', 'mobile-safari', 'mobile-stickies'
    ];
    
    appIconIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        elements.appIcons[id] = element;
        log(`Cached app icon: ${id}`);
      }
    });
    
    if (!elements.desktopDock && !elements.mobileDock) {
      error('No dock elements found');
    } else {
      const totalIcons = Object.keys(elements.appIcons).length;
      log(`Found ${totalIcons} app icons`);
    }
  }
  
  /**
   * Apply base styles to dock elements
   */
  function applyBaseStyles() {
    log('Applying base styles to dock');
    
    // Show appropriate dock based on device
    updateDockVisibility();
    
    // Add transition effects for dock icons
    Object.values(elements.appIcons).forEach(icon => {
      if (icon) {
        icon.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
      }
    });
  }
  
  /**
   * Update dock visibility based on device type
   */
  function updateDockVisibility() {
    if (elements.desktopDock && elements.mobileDock) {
      if (state.isMobile) {
        elements.desktopDock.style.display = 'none';
        elements.mobileDock.style.display = 'flex';
        log('Mobile dock activated');
      } else {
        elements.desktopDock.style.display = 'flex';
        elements.mobileDock.style.display = 'none';
        log('Desktop dock activated');
      }
    }
  }
  
  /**
   * Attach event handlers to dock elements
   */
  function attachEventHandlers() {
    log('Attaching dock event handlers');
    
    // Attach click handlers to app icons
    Object.entries(elements.appIcons).forEach(([id, element]) => {
      // Skip icons that have href attributes (they're external links)
      if (element.hasAttribute('href') || element.parentElement?.hasAttribute('href')) {
        log(`Skipping external link icon: ${id}`);
        return;
      }
      
      // Handle existing event handlers
      const hasClickHandler = element.onclick !== null;
      if (hasClickHandler) {
        log(`Icon ${id} already has a click handler, coordinating`);
        
        // Save the original handler
        const originalHandler = element.onclick;
        
        // Replace with our handler that also calls the original
        element.addEventListener('click', function(e) {
          log(`Delegating click for ${id} to original handler`);
          const result = originalHandler.call(this, e);
          
          // If original handler returns false or calls preventDefault, we respect that
          if (result === false || e.defaultPrevented) {
            return false;
          }
          
          // Otherwise also run our handler
          return launchApp(id);
        });
      } else {
        // No existing handler, add ours
        element.addEventListener('click', function() {
          launchApp(id);
        });
        log(`Added click handler to app icon: ${id}`);
      }
      
      // Add hover effects
      element.addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.1)';
        this.style.opacity = '1';
      });
      
      element.addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
        this.style.opacity = '0.9';
      });
    });
    
    // Add window resize handler
    window.addEventListener('resize', handleWindowResize);
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
      updateDockVisibility();
    }
  }
  
  /**
   * Launch an app by ID
   */
  function launchApp(appId) {
    log(`Launching app: ${appId}`);
    
    // Set as active app
    state.activeAppId = appId;
    
    // Highlight icon
    highlightApp(appId);
    
    // Find and call the appropriate handler
    const handler = appHandlers[appId];
    if (typeof handler === 'function') {
      handler();
      return true;
    } else {
      // Try to find a module for this app
      const moduleMap = {
        'finder': () => window.PeppleFinder?.open(),
        'settings': () => window.PeppleAbout?.open(),
        'stickies': () => window.PeppleNotes?.open(),
        'mobile-stickies': () => window.PeppleNotes?.open()
      };
      
      const moduleHandler = moduleMap[appId];
      if (moduleHandler) {
        log(`Using module handler for ${appId}`);
        moduleHandler();
        return true;
      }
      
      // Try to find a DOM function with a conventional name
      const domFunctionMap = {
        'finder': 'displayFinder',
        'safari': 'displaySafari',
        'stickies': 'displayStickies',
        'contacts': 'displayContacts',
        'calendar': 'displayCalendar',
        'reminders': 'displayReminders',
        'launchpad': 'displayLaunchpad',
        'facetime': 'displayFacetime',
        'settings': 'displayIntro'
      };
      
      const functionName = domFunctionMap[appId];
      if (functionName && typeof window[functionName] === 'function') {
        log(`Using DOM function ${functionName} for ${appId}`);
        window[functionName]();
        return true;
      }
      
      error(`No handler found for app: ${appId}`);
      return false;
    }
  }
  
  /**
   * Highlight an app icon
   */
  function highlightApp(appId) {
    log(`Highlighting app icon: ${appId}`);
    
    // Reset all icons first
    resetHighlights();
    
    // Highlight the specified icon
    const icon = elements.appIcons[appId];
    if (icon) {
      icon.classList.add('active');
      icon.style.transform = 'scale(1.1)';
      icon.style.opacity = '1';
    }
  }
  
  /**
   * Reset all icon highlights
   */
  function resetHighlights() {
    Object.values(elements.appIcons).forEach(icon => {
      if (icon) {
        icon.classList.remove('active');
        icon.style.transform = 'scale(1)';
        icon.style.opacity = '0.9';
      }
    });
  }
  
  /**
   * Open Finder app
   */
  function openFinder() {
    log('Opening Finder');
    
    // Try module first
    if (window.PeppleFinder && typeof window.PeppleFinder.open === 'function') {
      window.PeppleFinder.open();
      return true;
    }
    
    // Fallback to DOM function
    if (typeof window.displayFinder === 'function') {
      window.displayFinder();
      return true;
    }
    
    // Manual fallback
    const finderApp = document.getElementById('finder-app');
    if (finderApp) {
      // Hide other windows
      document.querySelectorAll('.app-window').forEach(win => {
        win.style.display = 'none';
        win.classList.remove('active');
      });
      
      // Show finder
      finderApp.style.display = 'block';
      finderApp.classList.add('active');
      return true;
    }
    
    error('Failed to open Finder');
    return false;
  }
  
  /**
   * Open Safari app
   */
  function openSafari() {
    log('Opening Safari');
    if (typeof window.displaySafari === 'function') {
      window.displaySafari();
      return true;
    }
    
    const safariWindow = document.getElementById('internet-window');
    if (safariWindow) {
      // Hide other windows
      document.querySelectorAll('.app-window').forEach(win => {
        win.style.display = 'none';
      });
      
      // Show safari
      safariWindow.style.display = 'block';
      return true;
    }
    
    error('Failed to open Safari');
    return false;
  }
  
  /**
   * Open Stickies app
   */
  function openStickies() {
    log('Opening Stickies');
    if (typeof window.displayStickies === 'function') {
      window.displayStickies();
      return true;
    }
    
    const stickiesWindow = document.getElementById('stickies-note');
    if (stickiesWindow) {
      stickiesWindow.style.display = 'block';
      return true;
    }
    
    error('Failed to open Stickies');
    return false;
  }
  
  /**
   * Open Contacts app
   */
  function openContacts() {
    log('Opening Contacts');
    if (typeof window.displayContacts === 'function') {
      window.displayContacts();
      return true;
    }
    
    const contactsWindow = document.getElementById('contacts-app');
    if (contactsWindow) {
      contactsWindow.style.display = 'block';
      return true;
    }
    
    error('Failed to open Contacts');
    return false;
  }
  
  /**
   * Open Calendar app
   */
  function openCalendar() {
    log('Opening Calendar');
    if (typeof window.displayCalendar === 'function') {
      window.displayCalendar();
      return true;
    }
    
    const calendarWindow = document.getElementById('calendar-app');
    if (calendarWindow) {
      calendarWindow.style.display = 'block';
      return true;
    }
    
    error('Failed to open Calendar');
    return false;
  }
  
  /**
   * Open Reminders app
   */
  function openReminders() {
    log('Opening Reminders');
    if (typeof window.displayReminders === 'function') {
      window.displayReminders();
      return true;
    }
    
    const remindersWindow = document.getElementById('reminders-app');
    if (remindersWindow) {
      remindersWindow.style.display = 'block';
      return true;
    }
    
    error('Failed to open Reminders');
    return false;
  }
  
  /**
   * Open Launchpad app
   */
  function openLaunchpad() {
    log('Opening Launchpad');
    if (typeof window.displayLaunchpad === 'function') {
      window.displayLaunchpad();
      return true;
    }
    
    const launchpadWindow = document.getElementById('launchpad-app');
    if (launchpadWindow) {
      launchpadWindow.style.display = 'block';
      return true;
    }
    
    error('Failed to open Launchpad');
    return false;
  }
  
  /**
   * Open Facetime app
   */
  function openFacetime() {
    log('Opening Facetime');
    if (typeof window.displayFacetime === 'function') {
      window.displayFacetime();
      return true;
    }
    
    const facetimeWindow = document.getElementById('facetime-app');
    if (facetimeWindow) {
      facetimeWindow.style.display = 'block';
      return true;
    }
    
    error('Failed to open Facetime');
    return false;
  }
  
  /**
   * Open Settings app
   */
  function openSettings() {
    log('Opening Settings (About)');
    
    // Try module first
    if (window.PeppleAbout && typeof window.PeppleAbout.open === 'function') {
      window.PeppleAbout.open();
      return true;
    }
    
    // Fallback to DOM function
    if (typeof window.displayIntro === 'function') {
      window.displayIntro();
      return true;
    }
    
    // Manual fallback
    const introWindow = document.getElementById('intro-window');
    if (introWindow) {
      // Hide other windows
      document.querySelectorAll('.app-window').forEach(win => {
        win.style.display = 'none';
      });
      
      // Show settings/about
      introWindow.style.display = 'block';
      return true;
    }
    
    error('Failed to open Settings');
    return false;
  }
  
  /**
   * Open Trash
   */
  function openTrash() {
    log('Opening Trash (not implemented)');
    // Trash usually just shows a bounce effect
    const trashIcon = elements.appIcons['trash'];
    if (trashIcon) {
      trashIcon.style.transform = 'scale(1.2)';
      setTimeout(() => {
        trashIcon.style.transform = 'scale(1)';
      }, 300);
    }
    return true;
  }
  
  /**
   * Open hard disk
   */
  function openHarddisk() {
    log('Opening Hard Disk (Finder)');
    return openFinder();
  }
  
  /**
   * Return current state for debugging
   */
  function getState() {
    return {
      ...state,
      elements: {
        desktopDockFound: !!elements.desktopDock,
        mobileDockFound: !!elements.mobileDock,
        iconCount: Object.keys(elements.appIcons).length
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
      console.log(`[PeppleDock] ${message}`);
    }
  }
  
  /**
   * Log error to console
   */
  function error(message) {
    console.error(`[PeppleDock] ERROR: ${message}`);
  }
  
  // Return public API
  return api;
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for other modules to initialize
  setTimeout(() => {
    // Initialize the Dock module
    PeppleDock.init();
    
    // Expose module to global scope for debugging
    window.PeppleDock = PeppleDock;
    
    console.log('[PeppleDock] Dock module loaded and ready');
    console.log('[PeppleDock] Try: PeppleDock.launchApp("finder") in console');
  }, 800);
}); 