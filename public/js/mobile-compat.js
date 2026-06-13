/**
 * Mobile compatibility script to ensure our responsive design works with existing JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Skip initialization of the old site - we're using React components only
  return;
  
  const isMobile = window.innerWidth <= 428;
  const isSmallMobile = window.innerWidth <= 320;
  
  // Add detection classes to the body
  document.body.classList.toggle('mobile', isMobile);
  document.body.classList.toggle('small-mobile', isSmallMobile);
  
  // Fix app windows to work with our new mobile layout
  function fixAppWindows() {
    // Get all windows
    const appWindows = document.querySelectorAll('.app-window');
    
    appWindows.forEach(window => {
      // Get close button
      const closeBtn = window.querySelector('.dots-close');
      if (closeBtn) {
        // Ensure close buttons are clickable on mobile
        closeBtn.addEventListener('touchstart', (e) => {
          e.stopPropagation();
        });
      }
      
      // Make sure window displays properly when opened
      // by preserving the display styles from JS
      const originalDisplay = window.style.display;
      
      if (isMobile) {
        if (window.classList.contains('active')) {
          window.style.display = 'block';
        } else {
          window.style.display = 'none';
        }
      } else {
        window.style.display = originalDisplay;
      }
    });
  }
  
  // Fix dock icons to ensure they're clickable
  function fixDockIcons() {
    // Mobile dock icons
    const mobileIcons = document.querySelectorAll('#mobile-dock .icon img');
    mobileIcons.forEach(icon => {
      icon.style.pointerEvents = 'auto';
      
      // Map mobile icon clicks to desktop equivalents
      if (icon.id === 'mobile-safari') {
        icon.addEventListener('click', () => {
          const safariIcon = document.getElementById('safari');
          if (safariIcon) {
            safariIcon.click();
          }
        });
      }
      
      if (icon.id === 'mobile-stickies') {
        icon.addEventListener('click', () => {
          const stickiesIcon = document.getElementById('stickies');
          if (stickiesIcon) {
            stickiesIcon.click();
          }
        });
      }
    });
  }
  
  // Fix top menu functionality
  function fixMenuFunctionality() {
    // Fix menu item clicks
    const menuItems = document.querySelectorAll('.menu-left > ul > li');
    
    menuItems.forEach(item => {
      // For desktop menus, use hover instead of click for primary menu items
      if (!isMobile) {
        // Clear any existing event listeners that might interfere
        item.removeEventListener('mouseenter', desktopMenuEnterHandler);
        item.removeEventListener('mouseleave', desktopMenuLeaveHandler);
        
        // Add enhanced hover behavior for desktop
        item.addEventListener('mouseenter', desktopMenuEnterHandler);
        item.addEventListener('mouseleave', desktopMenuLeaveHandler);
      }
      
      // Support both touch and mouse events
      item.addEventListener('click', (e) => {
        const submenu = item.querySelector('ul');
        if (submenu) {
          // Toggle submenu visibility
          if (getComputedStyle(submenu).display === 'block') {
            submenu.style.display = 'none';
          } else {
            // Hide all other submenus first
            document.querySelectorAll('.menu-left > ul > li > ul').forEach(menu => {
              menu.style.display = 'none';
            });
            submenu.style.display = 'block';
            e.stopPropagation(); // Stop bubbling to keep menu open
          }
        }
      });
    });
    
    // Handle submenu item clicks
    const submenuItems = document.querySelectorAll('.menu-left > ul > li > ul > li');
    submenuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        // Prevent the event from bubbling up to parent menu items
        e.stopPropagation();
      });
    });
    
    // Support specific menu items
    const menuFinderAbout = document.getElementById('menu-finder-about');
    if (menuFinderAbout) {
      menuFinderAbout.addEventListener('click', () => {
        // Show the intro window
        const introWindow = document.getElementById('intro-window');
        if (introWindow) {
          introWindow.classList.add('active');
          introWindow.style.display = 'block';
          
          // Hide the menu after action
          const parentMenu = menuFinderAbout.closest('ul');
          if (parentMenu) parentMenu.style.display = 'none';
        }
      });
    }
    
    const menuFinderOpen = document.getElementById('menu-finder-open');
    if (menuFinderOpen) {
      menuFinderOpen.addEventListener('click', () => {
        // Show the finder window
        const finderWindow = document.getElementById('finder-app');
        if (finderWindow) {
          finderWindow.classList.add('active');
          finderWindow.style.display = 'block';
          
          // Hide the menu after action
          const parentMenu = menuFinderOpen.closest('ul');
          if (parentMenu) parentMenu.style.display = 'none';
        }
      });
    }
  }
  
  // Handle desktop menu enter
  function desktopMenuEnterHandler() {
    const submenu = this.querySelector('ul');
    if (submenu) {
      // Position the submenu properly to avoid clipping
      const rect = this.getBoundingClientRect();
      submenu.style.top = rect.height + 'px';
      submenu.style.left = '0';
      submenu.style.minWidth = '150px';
      
      // Ensure it's on top of everything
      submenu.style.zIndex = '9999';
      
      // Display it
      submenu.style.display = 'block';
    }
  }
  
  // Handle desktop menu leave
  function desktopMenuLeaveHandler() {
    const submenu = this.querySelector('ul');
    if (submenu) {
      // Don't hide immediately to allow moving cursor to submenu
      setTimeout(() => {
        // Only hide if cursor isn't over the submenu or the parent
        if (!submenu.matches(':hover') && !this.matches(':hover')) {
          submenu.style.display = 'none';
        }
      }, 100);
    }
  }
  
  // Fix any text overflow issues in the app windows
  function fixTextOverflow() {
    if (isSmallMobile) {
      const textContainers = document.querySelectorAll('.finder-text, #intro-text-container p');
      textContainers.forEach(container => {
        if (container.scrollWidth > container.clientWidth) {
          container.style.whiteSpace = 'normal';
        }
      });
    }
  }
  
  // Fix window z-index to ensure menus are always on top
  function fixWindowZIndex() {
    // Ensure all windows have a lower z-index than the menu
    const windows = document.querySelectorAll('.app-window');
    windows.forEach(window => {
      window.style.zIndex = '10'; // Lower than menu z-index
    });
    
    // Ensure menu is on top
    const menuBar = document.querySelector('.menu-bar');
    if (menuBar) {
      menuBar.style.zIndex = '2000';
    }
    
    // Extra handling for desktop
    if (!isMobile) {
      document.querySelectorAll('.menu-left > ul > li > ul').forEach(submenu => {
        submenu.style.zIndex = '2025';
      });
    }
  }
  
  // Hide any open submenus when clicking outside
  document.body.addEventListener('click', (e) => {
    // Don't hide if clicking inside a menu
    if (!e.target.closest('.menu-left')) {
      document.querySelectorAll('.menu-left > ul > li > ul').forEach(menu => {
        menu.style.display = 'none';
      });
    }
  });
  
  // Call our fixes
  fixAppWindows();
  fixDockIcons();
  fixMenuFunctionality();
  fixTextOverflow();
  fixWindowZIndex();
  
  // Reapply fixes on resize
  window.addEventListener('resize', () => {
    const newIsMobile = window.innerWidth <= 428;
    const newIsSmallMobile = window.innerWidth <= 320;
    
    // Update detection classes
    document.body.classList.toggle('mobile', newIsMobile);
    document.body.classList.toggle('small-mobile', newIsSmallMobile);
    
    // Reapply fixes
    fixAppWindows();
    fixDockIcons();
    fixMenuFunctionality();
    fixTextOverflow();
    fixWindowZIndex();
  });
}); 