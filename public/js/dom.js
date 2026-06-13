import { config } from './config.js';

// Helper functions
const getText = (path) => {
  const parts = path.split('.');
  let value = config.text;
  for (const part of parts) {
    value = value[part];
    if (value === undefined) return '';
  }
  return value;
};

const getImage = (name) => {
  return config.images[name] || '';
};

// Update viewport meta tag
const viewport = document.querySelector('meta[name="viewport"]');
viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover');

// Mobile detection and handling
function setMobileClass() {
  const isMobile = window.innerWidth <= 429;
  const isSmallMobile = window.innerWidth <= 320;
  document.documentElement.classList.toggle('mobile', isMobile);
  document.documentElement.classList.toggle('small-mobile', isSmallMobile);
  
  // Force mobile layout on small screens
  if (isSmallMobile) {
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.top = '0';
    document.body.style.left = '0';
  }
  
  // Update window container styles
  const windowsContainer = document.querySelector('.windows-container');
  if (windowsContainer) {
    if (isSmallMobile) {
      windowsContainer.style.position = 'fixed';
      windowsContainer.style.top = '44px';
      windowsContainer.style.bottom = '50px';
      windowsContainer.style.left = '0';
      windowsContainer.style.right = '0';
      windowsContainer.style.width = '100%';
      windowsContainer.style.height = 'calc(100vh - 44px - 50px)';
      windowsContainer.style.transform = 'none';
      windowsContainer.style.overflow = 'hidden';
    } else if (isMobile) {
      windowsContainer.style.position = 'fixed';
      windowsContainer.style.top = 'calc(var(--header-height) + var(--safe-area-inset-top))';
      windowsContainer.style.bottom = 'calc(var(--footer-height) + var(--safe-area-inset-bottom))';
      windowsContainer.style.left = '0';
      windowsContainer.style.right = '0';
      windowsContainer.style.width = '100%';
      windowsContainer.style.transform = 'none';
    } else {
      windowsContainer.style.position = 'absolute';
      windowsContainer.style.inset = '0';
      windowsContainer.style.width = '100%';
      windowsContainer.style.transform = 'none';
    }
  }

  // Update all visible windows
  const windows = document.querySelectorAll('.app-window');
  windows.forEach(window => {
    if (isSmallMobile) {
      window.style.position = 'fixed';
      window.style.top = '44px';
      window.style.left = '0';
      window.style.right = '0';
      window.style.bottom = '50px';
      window.style.width = '100%';
      window.style.height = 'calc(100vh - 44px - 50px)';
      window.style.transform = 'none';
      window.style.margin = '0';
      window.style.padding = '0';
      window.style.zIndex = '1050';
      window.style.overflowY = 'auto';
      window.style.WebkitOverflowScrolling = 'touch';
      
      // Update window content height
      const windowContent = window.querySelector('.app-window-grid');
      if (windowContent) {
        windowContent.style.height = 'calc(100vh - 44px - 50px - 44px)';
        windowContent.style.overflowY = 'auto';
        windowContent.style.width = '100%';
      }
    } else if (isMobile) {
      window.style.position = 'fixed';
      window.style.top = 'calc(var(--header-height) + var(--safe-area-inset-top))';
      window.style.left = '0';
      window.style.right = '0';
      window.style.bottom = 'calc(var(--footer-height) + var(--safe-area-inset-bottom))';
      window.style.width = '100%';
      window.style.transform = 'none';
      window.style.margin = '0';
      window.style.padding = '0';
      window.style.zIndex = '1050';
      window.style.overflowY = 'auto';
      window.style.WebkitOverflowScrolling = 'touch';
    } else {
      window.style.position = 'absolute';
      window.style.top = '50%';
      window.style.left = '50%';
      window.style.width = 'min(800px, 90vw)';
      window.style.height = 'min(600px, 90vh)';
      window.style.transform = 'translate(-50%, -50%)';
      window.style.margin = 'auto';
      window.style.zIndex = '1020';
    }
  });
}

// Mobile-first window management
function showWindow(windowId) {
  // Hide all windows first
  document.querySelectorAll('.app-window').forEach(window => {
    window.classList.remove('active');
    window.style.display = 'none';
  });

  // Show target window
  const targetWindow = document.getElementById(windowId);
  if (targetWindow) {
    // Reset scroll position
    targetWindow.scrollTop = 0;
    
    // Force full width on mobile
    if (window.innerWidth <= 428) {
      targetWindow.style.width = '100vw';
      targetWindow.style.minWidth = '100vw';
      targetWindow.style.maxWidth = '100vw';
      targetWindow.style.left = '0';
      targetWindow.style.right = '0';
      targetWindow.style.margin = '0';
      targetWindow.style.padding = '0';
      targetWindow.style.borderRadius = '0';
      targetWindow.style.position = 'fixed';
      targetWindow.style.top = '44px';
      targetWindow.style.bottom = '50px';
      targetWindow.style.transform = 'none';
      targetWindow.style.display = 'flex';
      targetWindow.style.flexDirection = 'column';
      targetWindow.style.zIndex = '1000';
      targetWindow.style.background = '#fff';
      
      // Handle window content
      const windowContent = targetWindow.querySelector('.app-window-grid');
      if (windowContent) {
        windowContent.style.width = '100%';
        windowContent.style.maxWidth = '100%';
        windowContent.style.flex = '1';
        windowContent.style.overflowY = 'auto';
        windowContent.style.WebkitOverflowScrolling = 'touch';
      }
    }

    // Show window
    targetWindow.classList.add('active');

    // Lock body scroll on mobile
    if (window.innerWidth <= 428) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    }
  }
}

function hideWindow(windowId) {
  const targetWindow = document.getElementById(windowId);
  if (targetWindow) {
    targetWindow.classList.remove('active');
    targetWindow.style.display = 'none';
    
    // Restore body scroll
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
  }
}

// Update window positions on resize
function updateWindowPositions() {
  const isMobile = window.innerWidth <= 428;
  const activeWindow = document.querySelector('.app-window.active');
  
  if (activeWindow && isMobile) {
    activeWindow.style.width = '100vw';
    activeWindow.style.minWidth = '100vw';
    activeWindow.style.maxWidth = '100vw';
    activeWindow.style.left = '0';
    activeWindow.style.right = '0';
    activeWindow.style.margin = '0';
    activeWindow.style.padding = '0';
    activeWindow.style.borderRadius = '0';
    activeWindow.style.position = 'fixed';
    activeWindow.style.top = '44px';
    activeWindow.style.bottom = '50px';
    activeWindow.style.transform = 'none';
    
    const windowContent = activeWindow.querySelector('.app-window-grid');
    if (windowContent) {
      windowContent.style.width = '100%';
      windowContent.style.maxWidth = '100%';
    }
  }
}

// Initialize mobile handling
window.addEventListener('resize', () => {
  clearTimeout(window.resizeTimer);
  window.resizeTimer = setTimeout(updateWindowPositions, 250);
});

// Touch event handling
function handleTouchEvents() {
  const touchElements = document.querySelectorAll('.app-window, .footer-app, .menu-item');
  
  touchElements.forEach(element => {
    // Add touch feedback
    element.addEventListener('touchstart', () => {
      element.style.opacity = '0.7';
    }, { passive: true });
    
    element.addEventListener('touchend', () => {
      element.style.opacity = '1';
    }, { passive: true });

    // Add touch feedback for small screens
    if (window.innerWidth <= 320) {
      element.style.minHeight = '44px'; // Minimum touch target size
      element.style.padding = '8px';
    }
  });
}

// Initialize mobile handling
setMobileClass();
handleTouchEvents();

// Update on resize with debounce
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    setMobileClass();
    handleTouchEvents();
  }, 250);
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const menuItems = document.querySelector('.menu-items');

if (mobileMenuToggle && menuItems) {
  mobileMenuToggle.addEventListener('click', () => {
    menuItems.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuItems.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
      menuItems.classList.remove('active');
      mobileMenuToggle.classList.remove('active');
    }
  });
}

// Mobile detection and handling
function handleMobileLayout() {
  const isMobile = window.innerWidth < 1024;
  document.documentElement.classList.toggle('is-mobile', isMobile);
  
  // Update menu visibility
  if (menuItems) {
    menuItems.style.display = isMobile ? 'none' : 'flex';
  }
  if (mobileMenuToggle) {
    mobileMenuToggle.style.display = isMobile ? 'block' : 'none';
  }

  // Update window container
  const windowsContainer = document.querySelector('.windows-container');
  if (windowsContainer) {
    if (isMobile) {
      windowsContainer.style.position = 'fixed';
      windowsContainer.style.top = 'var(--header-height)';
      windowsContainer.style.bottom = 'var(--footer-height)';
      windowsContainer.style.left = '0';
      windowsContainer.style.right = '0';
      windowsContainer.style.width = '100%';
      windowsContainer.style.transform = 'none';
    } else {
      windowsContainer.style.position = 'absolute';
      windowsContainer.style.inset = '0';
      windowsContainer.style.width = '100%';
      windowsContainer.style.transform = 'none';
    }
  }
}

// Initialize mobile handling
handleMobileLayout();

// Update on resize
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(handleMobileLayout, 250);
});

// Initialize DOM elements and attach event listeners
function initializeDom() {
  /* Top Menu */
  const menuFinder = document.getElementById("menu-finder");
  const menuFile = document.getElementById("file");
  const menuEdit = document.getElementById("edit");
  const menuView = document.getElementById("view");
  const menuGo = document.getElementById("go");
  const menuWindow = document.getElementById("window");
  const menuHelp = document.getElementById("help");
  const finderList = document.getElementById("finder-list");
  const fileList = document.getElementById("file-list");
  const editList = document.getElementById("edit-list");
  const viewList = document.getElementById("view-list");
  const goList = document.getElementById("go-list");
  const windowList = document.getElementById("window-list");
  const helpApp = document.getElementById("help-app");
  const logo = document.getElementById("logo"); // Added missing logo reference
  
  // Constants
  const transparent = "rgba(255, 255, 255, 0)";
  
  // Update image sources
  const updateImageSource = (id, imageName) => {
    const element = document.getElementById(id);
    if (element) {
      if (id === "battery" || id === "wifi") {
        element.querySelector('img').src = getImage(imageName);
      } else {
        element.src = getImage(imageName);
      }
    }
  };

  // Update all image sources
  const imageMappings = {
    "logo": "logo",
    "battery": "battery",
    "wifi": "wifi",
    "finder": "finder",
    "launchpad": "launchpad",
    "safari": "safari",
    "contacts": "contacts",
    "calendar": "calendar",
    "stickies": "notes",
    "reminders": "reminders",
    "facetime": "facetime",
    "settings": "systemPreferences",
    "trash": "trash",
    "harddisk": "harddisk",
    "intro-image": "introLogo",
    "calendar-image": "calendarFull",
    "facetime-image": "office"
  };

  Object.entries(imageMappings).forEach(([id, imageName]) => {
    updateImageSource(id, imageName);
  });
  
  // Update text content
  const updateTextContent = (selector, textPath) => {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = getText(textPath);
    }
  };

  // Update intro text content
  updateTextContent("#intro-title", 'intro.title');
  updateTextContent("#intro-description", 'intro.description');
  updateTextContent("#intro-info1", 'intro.additionalInfo.0');
  updateTextContent("#intro-info2", 'intro.additionalInfo.1');
  
  // Populate help content
  const helpTitle = document.querySelector("#help-title");
  const helpContent = document.querySelector("#help-content");
  if (helpTitle) {
    helpTitle.textContent = getText('help.title');
  }
  if (helpContent) {
    getText('help.content').forEach(text => {
      const p = document.createElement('p');
      p.textContent = text;
      helpContent.appendChild(p);
    });
  }
  
  const finderText = document.querySelector(".finder-text");
  if (finderText) {
    finderText.textContent = getText('finder.welcome');
  }

  let activeMenu = null;
  let hideTimeout = null;

  const closeAllMenu = () => {
    [finderList, fileList, editList, viewList, goList, windowList].forEach(menu => {
      if (menu) menu.style.display = "none";
    });
    if (activeMenu) {
      activeMenu.style.backgroundColor = transparent;
      activeMenu = null;
    }
  };

  const showMenu = (menuElement, menuList) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    
    if (activeMenu !== menuElement) {
      closeAllMenu();
      if (menuElement && menuList) {
        menuElement.style.backgroundColor = "#ddddff";
        menuList.style.display = "block";
        activeMenu = menuElement;
      }
    }
  };

  const hideMenu = () => {
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(closeAllMenu, 100);
  };

  // Menu event listeners
  const addMenuListeners = (menuElement, menuList) => {
    if (menuElement && menuList) {
      menuElement.addEventListener("mouseover", () => showMenu(menuElement, menuList));
      menuElement.addEventListener("mouseleave", hideMenu);
      menuList.addEventListener("mouseover", () => {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
      });
      menuList.addEventListener("mouseleave", hideMenu);
    }
  };

  addMenuListeners(menuFinder, finderList);
  addMenuListeners(menuFile, fileList);
  addMenuListeners(menuEdit, editList);
  addMenuListeners(menuView, viewList);
  addMenuListeners(menuGo, goList);
  addMenuListeners(menuWindow, windowList);
  addMenuListeners(menuHelp, helpApp);

  /* Help App */
  const helpDot = document.getElementById("help-dot");
  const helpClose = document.getElementById("help-close");

  const toggleHelpClose = (event) => {
    if (helpClose) {
      helpClose.style.display = event.type === "mouseover" ? "block" : "none";
    }
  };

  const closeHelp = () => {
    if (helpApp) helpApp.style.display = "none";
  };

  if (helpDot) {
    helpDot.addEventListener("mouseover", toggleHelpClose);
    helpDot.addEventListener("mouseleave", toggleHelpClose);
  }
  if (helpClose) {
    helpClose.addEventListener("click", closeHelp);
  }

  /* For Logo */
  const introWindow = document.getElementById("intro-window");

  const toggleIntroLogo = (clicked) => {
    if (logo && introWindow) {
      if (clicked) {
        logo.style.backgroundColor = "#ddddff";
        introWindow.style.display = "block";
      } else {
        logo.style.backgroundColor = transparent;
      }
    }
  };

  if (logo) {
    logo.addEventListener("click", () => toggleIntroLogo(true));
    logo.addEventListener("mouseleave", () => toggleIntroLogo(false));
  }

  /* Draggable Items */
  const collision = (rect1, rect2) =>
    !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );

  const draggableElements = document.querySelectorAll(".draggable, .app-image");
  const trashElement = document.querySelector("#trash");

  draggableElements.forEach((item) => {
    let isDragging = false;
    let initialX;
    let initialY;
    let currentPosition = {};
    let initialPosition = {};

    const startDrag = (event) => {
      isDragging = true;
      initialPosition = {
        x: item.offsetLeft,
        y: item.offsetTop,
      };

      initialX = event.clientX || (event.targetTouches && event.targetTouches[0].clientX);
      initialY = event.clientY || (event.targetTouches && event.targetTouches[0].clientY);
    };

    const drag = (event) => {
      if (!isDragging) return;
      event.preventDefault();

      const clientX = event.clientX || (event.targetTouches && event.targetTouches[0].clientX);
      const clientY = event.clientY || (event.targetTouches && event.targetTouches[0].clientY);

      if (clientX && clientY) {
        currentPosition = {
          x: clientX,
          y: clientY,
        };

        let diffX = currentPosition.x - initialX;
        let diffY = currentPosition.y - initialY;

        item.style.left = initialPosition.x + diffX + "px";
        item.style.top = initialPosition.y + diffY + "px";
      }
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;

      if (item.classList.contains("app-image") && trashElement) {
        let draggedRect = item.getBoundingClientRect();
        let targetRect = trashElement.getBoundingClientRect();
        if (collision(draggedRect, targetRect)) {
          item.remove();
          trashElement.style.transform = "scale(1.3)";
          trashElement.style.zIndex = "110";
        }
      }
    };

    item.addEventListener("mousedown", startDrag);
    item.addEventListener("touchstart", startDrag, { passive: false });
    
    // Move these to document level to handle dragging outside the element
    document.addEventListener("mousemove", drag);
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);
  });

  /* For Intro App */
  const introDot = document.getElementById("intro-dot");
  const settings = document.getElementById("settings");
  const introClose = document.getElementById("close");

  const toggleClose = (event) => {
    if (introClose) {
      introClose.style.display = event.type === "mouseover" ? "block" : "none";
    }
  };

  // Global window management
  const closeAllWindows = () => {
    const windows = document.querySelectorAll('.app-window');
    windows.forEach(window => {
      window.style.display = "none";
      window.classList.remove("active");
    });
    console.log('[PeppleOS] Closed all windows');
  };

  const closeIntro = () => {
    if (introWindow) introWindow.style.display = "none";
  };

  const displayIntro = () => {
    if (introWindow) introWindow.style.display = "block";
  };

  if (introDot) {
    introDot.addEventListener("mouseover", toggleClose);
    introDot.addEventListener("mouseleave", toggleClose);
  }
  if (introClose) {
    introClose.addEventListener("click", closeIntro);
  }
  if (settings) {
    settings.addEventListener("click", displayIntro);
  }

  /* For Finder App */
  const finderDot = document.getElementById("finder-dot");
  const finderClose = document.getElementById("finder-close");
  const finderApp = document.getElementById("finder-app");
  const finder = document.getElementById("finder");
  const recents = document.getElementById("recents");
  const desktop = document.getElementById("desktop");
  const documents = document.getElementById("documents");
  const downloads = document.getElementById("downloads");
  const yourMac = document.getElementById("your-mac");

  const finderRecentsContainer = document.getElementById("finder-recents-container");
  const finderDesktopContainer = document.getElementById("finder-desktop-container");
  const finderDocumentsContainer = document.getElementById("finder-documents-container");
  const finderMacContainer = document.getElementById("finder-mac-container");

  const toggleFinderClose = (event) => {
    if (finderClose) {
      finderClose.style.display = event.type === "mouseover" ? "block" : "none";
    }
  };

  const closeAllFinder = () => {
    [finderDesktopContainer, finderRecentsContainer, finderDocumentsContainer, finderMacContainer].forEach(container => {
      if (container) container.style.display = "none";
    });
  };

  const closeFinder = () => {
    if (finderApp) {
      hideWindow('finder-app');
    }
    closeAllFinder();
    if (finderText) {
      finderText.innerHTML = getText('finder.welcome');
    }
  };

  // Finder event listeners
  if (finderDot) {
    finderDot.addEventListener("mouseover", toggleFinderClose);
    finderDot.addEventListener("mouseleave", toggleFinderClose);
  }
  
  // Define the missing displayFinder function
  const displayFinder = () => {
    if (finderApp) {
      // Hide all other windows first for clean UI
      closeAllWindows();
      // Display the finder window
      finderApp.style.display = "block";
      finderApp.classList.add("active");
      console.log('[PeppleOS] Finder window opened');
    } else {
      console.error('[PeppleOS] Finder app element not found');
    }
  };
  
  // Define Finder section display functions
  const displayRecents = () => {
    // First ensure finder is open
    if (finderApp && finderApp.style.display !== "block") {
      displayFinder();
    }
    
    closeAllFinder();
    if (finderRecentsContainer) {
      finderRecentsContainer.style.display = "block";
      console.log('[PeppleOS] Finder - Recents section displayed');
    } else {
      console.error('[PeppleOS] Finder - Recents container not found');
    }
  };
  
  const displayDesktop = () => {
    // First ensure finder is open
    if (finderApp && finderApp.style.display !== "block") {
      displayFinder();
    }
    
    closeAllFinder();
    if (finderDesktopContainer) {
      finderDesktopContainer.style.display = "block";
      console.log('[PeppleOS] Finder - Desktop section displayed');
    } else {
      console.error('[PeppleOS] Finder - Desktop container not found');
    }
  };
  
  const displayDocuments = () => {
    // First ensure finder is open
    if (finderApp && finderApp.style.display !== "block") {
      displayFinder();
    }
    
    closeAllFinder();
    if (finderDocumentsContainer) {
      finderDocumentsContainer.style.display = "block";
      console.log('[PeppleOS] Finder - Documents section displayed');
    } else {
      console.error('[PeppleOS] Finder - Documents container not found');
    }
  };
  
  const displayDownloads = () => {
    // First ensure finder is open
    if (finderApp && finderApp.style.display !== "block") {
      displayFinder();
    }
    
    closeAllFinder();
    // For now, just display a message in the finder text area
    if (finderText) {
      finderText.innerHTML = getText('finder.downloads') || "Downloads folder is empty.";
      console.log('[PeppleOS] Finder - Downloads section displayed');
    }
  };
  
  const displayMac = () => {
    // First ensure finder is open
    if (finderApp && finderApp.style.display !== "block") {
      displayFinder();
    }
    
    closeAllFinder();
    if (finderMacContainer) {
      finderMacContainer.style.display = "block";
      console.log('[PeppleOS] Finder - Mac section displayed');
    } else {
      // For now, just display a message in the finder text area
      if (finderText) {
        finderText.innerHTML = getText('finder.device') || "Your device storage information.";
        console.log('[PeppleOS] Finder - Device section displayed');
      }
    }
  };
  
  if (finderClose) finderClose.addEventListener("click", closeFinder);
  if (finder) finder.addEventListener("click", displayFinder);
  if (recents) recents.addEventListener("click", displayRecents);
  if (desktop) desktop.addEventListener("click", displayDesktop);
  if (documents) documents.addEventListener("click", displayDocuments);
  if (downloads) downloads.addEventListener("click", displayDownloads);
  if (yourMac) yourMac.addEventListener("click", displayMac);

  /* For Contacts App */
  const contacts = document.getElementById("contacts");
  const contactsApp = document.getElementById("contacts-app");
  const contactsClose = document.getElementById("contacts-close");
  const contactsDot = document.getElementById("contacts-dot");

  const toggleContactsClose = (event) => {
    if (contactsClose) {
      contactsClose.style.display = event.type === "mouseover" ? "block" : "none";
    }
  };

  const displayContacts = () => {
    if (contactsApp) contactsApp.style.display = "block";
  };

  const closeContacts = () => {
    if (contactsApp) contactsApp.style.display = "none";
  };

  if (contacts) contacts.addEventListener("click", displayContacts);
  if (contactsClose) contactsClose.addEventListener("click", closeContacts);
  if (contactsDot) {
    contactsDot.addEventListener("mouseover", toggleContactsClose);
    contactsDot.addEventListener("mouseleave", toggleContactsClose);
  }

  /* For Stickies App */
  const stickiesClose = document.getElementById("stickies-close");
  const stickies = document.getElementById("stickies");
  const stickiesNote = document.getElementById("stickies-note");

  const closeStickies = () => {
    if (stickiesNote) stickiesNote.style.display = "none";
  };

  const displayStickies = () => {
    if (stickiesNote) stickiesNote.style.display = "block";
  };

  if (stickiesClose) stickiesClose.addEventListener("click", closeStickies);
  if (stickies) stickies.addEventListener("click", displayStickies);

  /* Internet Window */
  const internetWindow = document.getElementById("internet-window");
  const internetDot = document.getElementById("internet-dot");
  const internetClose = document.getElementById("internet-close");
  const safariIframe = document.getElementById("safari-iframe");

  const toggleInternetClose = (event) => {
    if (internetClose) {
      internetClose.style.display = event.type === "mouseover" ? "block" : "none";
    }
  };

  const closeInternetWindow = () => {
    if (safariIframe) safariIframe.style.display = "none";
    if (internetWindow) internetWindow.style.display = "none";
  };

  const displaySafari = () => {
    if (internetWindow) internetWindow.style.display = "block";
    if (safariIframe) {
      try {
        // Update to use the current canister ID
        safariIframe.src = window.location.origin;
        safariIframe.style.display = "block";
        safariIframe.onerror = (error) => {
          console.error('Failed to load iframe:', error);
          // Fallback content if iframe fails to load
          safariIframe.style.display = "none";
          if (internetWindow) {
            internetWindow.innerHTML += '<div class="error-message">Failed to load content. Please try again later.</div>';
          }
        };
      } catch (error) {
        console.error('Error displaying Safari:', error);
      }
    }
  };

  if (internetDot) {
    internetDot.addEventListener("click", closeInternetWindow);
    internetDot.addEventListener("mouseover", toggleInternetClose);
    internetDot.addEventListener("mouseleave", toggleInternetClose);
  }

  /* Safari App */
  const safari = document.getElementById("safari");
  if (safari) safari.addEventListener("click", displaySafari);

  /* Launchpad App */
  const launchpadClose = document.getElementById("launchpad-close");
  const launchpad = document.getElementById("launchpad");
  const launchpadApp = document.getElementById("launchpad-app");

  const closeLaunchpad = () => {
    if (launchpadApp) launchpadApp.style.display = "none";
  };

  const displayLaunchpad = () => {
    if (launchpadApp) launchpadApp.style.display = "block";
  };

  if (launchpadClose) launchpadClose.addEventListener("click", closeLaunchpad);
  if (launchpad) launchpad.addEventListener("click", displayLaunchpad);

  /* Calendar App */
  const calendarDot = document.getElementById("calendar-dot");
  const calendarClose = document.getElementById("calendar-close");
  const calendarApp = document.getElementById("calendar-app");
  const calendar = document.getElementById("calendar");

  const toggleCalendarClose = (event) => {
    if (calendarClose) {
      calendarClose.style.display = event.type === "mouseover" ? "block" : "none";
    }
  };

  const closeCalendar = () => {
    if (calendarApp) calendarApp.style.display = "none";
  };

  const displayCalendar = () => {
    if (calendarApp) calendarApp.style.display = "block";
  };

  if (calendar) calendar.addEventListener("click", displayCalendar);
  if (calendarClose) calendarClose.addEventListener("click", closeCalendar);
  if (calendarDot) {
    calendarDot.addEventListener("mouseover", toggleCalendarClose);
    calendarDot.addEventListener("mouseleave", toggleCalendarClose);
  }

  /* Facetime App */
  const facetime = document.getElementById("facetime");
  const facetimeDot = document.getElementById("facetime-dot");
  const facetimeClose = document.getElementById("facetime-close");
  const facetimeApp = document.getElementById("facetime-app");
  const webcam = document.getElementById("webcam");
  const facetimeImage = document.getElementById("facetime-image");
  const available = document.getElementsByClassName("available-text")[2];

  const toggleFacetimeClose = (event) => {
    if (facetimeClose) {
      facetimeClose.style.display = event.type === "mouseover" ? "block" : "none";
    }
  };

  const displayFacetime = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (webcam) webcam.srcObject = stream;
        if (facetimeApp) facetimeApp.style.display = "block";
        if (facetimeImage) facetimeImage.style.display = "block";
      });

      if (facetimeClose) {
        facetimeClose.addEventListener("click", () => {
          if (webcam && webcam.srcObject) {
            const tracks = webcam.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            webcam.srcObject = null;
          }
          if (facetimeImage) facetimeImage.style.display = "none";
          if (facetimeApp) facetimeApp.style.display = "none";
        });
      }
    }
  };

  if (facetimeDot) {
    facetimeDot.addEventListener("mouseover", toggleFacetimeClose);
    facetimeDot.addEventListener("mouseleave", toggleFacetimeClose);
  }
  if (facetime) facetime.addEventListener("click", displayFacetime);
  if (available) available.addEventListener("click", displayFacetime);

  /* Reminders App */
  const remindersDot = document.getElementById("reminders-dot");
  const remindersClose = document.getElementById("reminders-close");
  const remindersApp = document.getElementById("reminders-app");
  const reminders = document.getElementById("reminders");
  const lastTextarea = document.querySelector("#reminders-last-textarea");
  const ul = document.querySelector("#reminders-list");

  const toggleRemindersClose = (event) => {
    if (remindersClose) {
      remindersClose.style.display = event.type === "mouseover" ? "block" : "none";
    }
  };

  const addList = (event) => {
    if (event.key === "Enter" && ul && ul.children.length < 7) {
      const newLi = document.createElement("li");
      const newDiv = document.createElement("div");
      const newTextarea = document.createElement("textarea");

      newDiv.setAttribute("class", "reminders-textarea-container");
      newTextarea.setAttribute("maxlength", "30");
      newTextarea.setAttribute("rows", "1");
      newTextarea.setAttribute("id", "reminders-last-textarea");

      newLi.appendChild(newDiv);
      newDiv.appendChild(newTextarea);
      ul.appendChild(newLi);
    }
  };

  const closeReminders = () => {
    if (remindersApp) remindersApp.style.display = "none";
  };

  const displayReminders = () => {
    if (remindersApp) remindersApp.style.display = "block";
  };

  if (remindersDot) {
    remindersDot.addEventListener("mouseover", toggleRemindersClose);
    remindersDot.addEventListener("mouseleave", toggleRemindersClose);
  }
  if (remindersClose) remindersClose.addEventListener("click", closeReminders);
  if (reminders) reminders.addEventListener("click", displayReminders);
  if (lastTextarea) lastTextarea.addEventListener("keydown", addList);

  /* Trash App */
  const trashDot = document.getElementById("trash-dot");
  const trashClose = document.getElementById("trash-close");
  const trashApp = document.getElementById("trash-app");
  const trash = document.getElementById("trash");

  const toggleTrashClose = (event) => {
    if (trashClose) {
      trashClose.style.display = event.type === "mouseover" ? "block" : "none";
    }
  };

  const closeTrash = () => {
    if (trashApp) trashApp.style.display = "none";
  };

  const displayTrash = () => {
    if (trashApp) trashApp.style.display = "block";
  };

  if (trashDot) {
    trashDot.addEventListener("mouseover", toggleTrashClose);
    trashDot.addEventListener("mouseleave", toggleTrashClose);
  }
  if (trashClose) trashClose.addEventListener("click", closeTrash);
  if (trash) trash.addEventListener("dblclick", displayTrash);

  /* Desktop Apps */
  const harddisk = document.getElementById("harddisk");
  const desktopStickies = document.getElementById("desktop-stickies");

  if (window.matchMedia("(min-width: 1300px)").matches) {
    if (harddisk) harddisk.addEventListener("dblclick", displayMac);
    if (desktopStickies) desktopStickies.addEventListener("dblclick", displayStickies);
  } else {
    if (harddisk) harddisk.addEventListener("click", displayMac);
    if (desktopStickies) desktopStickies.addEventListener("click", displayStickies);
  }

  /* Finder Apps */
  const finderHarddisk = document.getElementById("finder-harddisk");
  const finderStickies = document.getElementById("finder-stickies");

  if (finderHarddisk) finderHarddisk.addEventListener("click", displayMac);
  if (finderStickies) finderStickies.addEventListener("click", displayStickies);

  /* Top Menu List Functions */
  const menuFileClose = document.getElementById("menu-file-close");
  const menuWindowClose = document.getElementById("menu-window-close");
  const menuFinderAbout = document.getElementById("menu-finder-about");
  const menuFinderOpen = document.getElementById("menu-finder-open");
  const menuFinderLaunch = document.getElementById("menu-finder-launch");
  const menuViewAbout = document.getElementById("menu-view-about");
  const menuGoOpen = document.getElementById("menu-go-open");

  const closeEverything = () => {
    const apps = [
      calendarApp, remindersApp, launchpadApp, introWindow,
      internetWindow, stickiesNote, contactsApp, finderApp,
      facetimeApp, helpApp, trashApp
    ];
    apps.forEach(app => {
      if (app) app.style.display = "none";
    });
  };

  if (menuWindowClose) menuWindowClose.addEventListener("click", closeEverything);
  if (menuFileClose) menuFileClose.addEventListener("click", closeEverything);
  if (menuFinderAbout) menuFinderAbout.addEventListener("click", displayIntro);
  if (menuFinderOpen) menuFinderOpen.addEventListener("click", displayFinder);
  if (menuFinderLaunch) menuFinderLaunch.addEventListener("click", displayLaunchpad);
  if (menuViewAbout) menuViewAbout.addEventListener("click", displayIntro);
  if (menuGoOpen) {
    menuGoOpen.addEventListener("click", () => {
      displaySafari();
      closeAllMenu(); // Close the menu after clicking
    });
  }

  /* Mobile Apps */
  const mobileSafari = document.getElementById("mobile-safari");
  const mobileStickies = document.getElementById("mobile-stickies");

  if (mobileSafari) mobileSafari.addEventListener("click", displaySafari);
  if (mobileStickies) mobileStickies.addEventListener("click", displayStickies);
}

// Export functions for external use
export const DomService = {
  getText,
  getImage,
  initializeDom
};

// Initialize when DOM is loaded
if (typeof window !== 'undefined') {
  window.addEventListener("DOMContentLoaded", initializeDom);
}

// Finder window management
const finderApp = document.getElementById('finder-app');
const finderSections = {
  recents: document.getElementById('finder-recents'),
  desktop: document.getElementById('finder-desktop'),
  documents: document.getElementById('finder-documents'),
  downloads: document.getElementById('finder-downloads')
};

// Show Finder window
function showFinder() {
  // Reset to initial state
  hideAllSections();
  
  // Show welcome message in finder
  const finderText = document.querySelector('.finder-text');
  if (finderText) {
    finderText.textContent = 'Welcome to Finder';
  }
  
  // Show the finder window
  showWindow('finder-app');
}

// Hide all finder sections
function hideAllSections() {
  Object.values(finderSections).forEach(section => {
    if (section) {
      section.style.display = 'none';
    }
  });
}

// Show specific finder section
function showFinderSection(sectionId) {
  // Ensure finder is open first
  if (!finderApp.classList.contains('active')) {
    showFinder();
  }
  
  // Hide all sections first
  hideAllSections();
  
  // Show requested section
  const section = finderSections[sectionId];
  if (section) {
    section.style.display = 'block';
    
    // Update finder text to section title
    const finderText = document.querySelector('.finder-text');
    if (finderText) {
      finderText.textContent = getSectionTitle(sectionId);
    }
  }
}

// Get section title
function getSectionTitle(sectionId) {
  const titles = {
    recents: 'Recent Items',
    desktop: 'Desktop',
    documents: 'Documents',
    downloads: 'Downloads'
  };
  return titles[sectionId] || 'Finder';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Finder open button
  const finderButton = document.querySelector('.finder-button');
  if (finderButton) {
    finderButton.addEventListener('click', showFinder);
  }
  
  // Section buttons
  const sectionButtons = {
    recents: document.querySelector('.recents-button'),
    desktop: document.querySelector('.desktop-button'),
    documents: document.querySelector('.documents-button'),
    downloads: document.querySelector('.downloads-button')
  };
  
  // Add click handlers for each section
  Object.entries(sectionButtons).forEach(([sectionId, button]) => {
    if (button) {
      button.addEventListener('click', () => showFinderSection(sectionId));
    }
  });
  
  // Close button
  const closeButton = document.querySelector('.finder-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => hideWindow('finder-app'));
  }
  
  // Handle back navigation in sections
  const backButton = document.querySelector('.finder-back');
  if (backButton) {
    backButton.addEventListener('click', () => {
      hideAllSections();
      const finderText = document.querySelector('.finder-text');
      if (finderText) {
        finderText.textContent = 'Welcome to Finder';
      }
    });
  }
});

// Touch event handling for items
function initializeFinderTouchEvents() {
  const touchItems = document.querySelectorAll('.finder-item');
  touchItems.forEach(item => {
    // Add touch feedback
    item.addEventListener('touchstart', () => {
      item.style.opacity = '0.7';
    }, { passive: true });
    
    item.addEventListener('touchend', () => {
      item.style.opacity = '1';
    }, { passive: true });
    
    // Handle item selection
    item.addEventListener('click', () => {
      const itemType = item.dataset.type;
      const itemPath = item.dataset.path;
      
      if (itemType === 'folder') {
        // Handle folder navigation
        showFinderSection(itemPath);
      } else {
        // Handle file selection
        handleFileSelection(itemPath);
      }
    });
  });
}

// Handle file selection
function handleFileSelection(filePath) {
  // Add visual feedback
  const selectedItem = document.querySelector(`[data-path="${filePath}"]`);
  if (selectedItem) {
    selectedItem.classList.add('selected');
    
    // Remove selection after short delay
    setTimeout(() => {
      selectedItem.classList.remove('selected');
    }, 200);
  }
  
  // Here you would handle the file action
  console.log(`Selected file: ${filePath}`);
}
