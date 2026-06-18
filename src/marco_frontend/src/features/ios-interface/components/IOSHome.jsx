import React, { useState, useEffect, useRef } from 'react';
import Dock from './Dock';
import IOSIcon from './IOSIcon';

const FROGCHAN_UNLOCK_AT_KEY = 'marco.frogchan.unlockAt.v1';

const WALLPAPERS = ['yosemite.jpg', 'yosemite2.png', 'yosemite3.jpg', 'yosemite4.jpg'];

// Staking app component with downloading effect
const StakingAppIcon = () => {
  return (
    <div 
      className="staking-icon-wrapper"
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <img 
        src="/assets/staking-icon.png" 
        alt="Staking" 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
};

const IOSHome = ({ onAppSwitch }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    typeof document !== 'undefined' ? document.body.classList.contains('dark-mode') : false
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 767 : false
  );
  const [currentBackground, setCurrentBackground] = useState('yosemite.jpg');
  const toastTimerRef = useRef(0);
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [frogchanUnlockAt, setFrogchanUnlockAt] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const rawValue = window.localStorage.getItem(FROGCHAN_UNLOCK_AT_KEY);
    const parsed = Number.parseInt(rawValue ?? '', 10);
    return Number.isFinite(parsed) ? parsed : 0;
  });
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    currentX: 0,
    startY: 0,
    currentY: 0,
    isTouch: false
  });
  
  const homeRef = useRef(null);
  const animationRef = useRef(null);
  const backgroundTapCandidateRef = useRef(false);
  const backgroundTapMovedRef = useRef(false);
 
  const showToast = (message) => {
    window.clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    setToastOpen(true);
    toastTimerRef.current = window.setTimeout(() => setToastOpen(false), 1700);
  };

  const formatRemaining = (msRemaining) => {
    const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours <= 0 && minutes <= 0) return 'a moment';
    if (hours <= 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };
  
  // Listen for dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.body.classList.contains('dark-mode'));
    };

    checkDarkMode();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (frogchanUnlockAt === 0) { // Only set the unlock time if it hasn't been set before
      const storedUnlockAt = window.localStorage.getItem(FROGCHAN_UNLOCK_AT_KEY);
      if (storedUnlockAt) {
        // Use the previously stored unlock time
        const parsedUnlockAt = Number.parseInt(storedUnlockAt, 10);
        if (Number.isFinite(parsedUnlockAt)) {
          setFrogchanUnlockAt(parsedUnlockAt);
        } else {
          // If stored value is invalid, set a new 24-hour lock from now
          const unlockAt = Date.now() + 24 * 60 * 60 * 1000;
          window.localStorage.setItem(FROGCHAN_UNLOCK_AT_KEY, String(unlockAt));
          setFrogchanUnlockAt(unlockAt);
        }
      } else {
        // First time access - set 24-hour lock from now
        const unlockAt = Date.now() + 24 * 60 * 60 * 1000;
        window.localStorage.setItem(FROGCHAN_UNLOCK_AT_KEY, String(unlockAt));
        setFrogchanUnlockAt(unlockAt);
      }
    }
    return () => window.clearTimeout(toastTimerRef.current);
  }, []);

  // Routing is no longer used; keep the UI fully home-screen driven.

  useEffect(() => {
    try {
      const storedIndex = Number.parseInt(window.localStorage.getItem('marco.wallpaperIndex.v1') ?? '', 10);
      if (Number.isFinite(storedIndex) && storedIndex >= 0 && storedIndex < WALLPAPERS.length) {
        setCurrentBackground(WALLPAPERS[storedIndex]);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handler = (event) => {
      const detail = event?.detail || {};
      const url = detail.url || detail.background;
      if (!url) return;
      const filename = String(url).split('/').pop();
      if (WALLPAPERS.includes(filename)) {
        setCurrentBackground(filename);
      }
    };

    window.addEventListener('marco:wallpaper-changed', handler);
    return () => window.removeEventListener('marco:wallpaper-changed', handler);
  }, []);

  const handleTouchStart = (e) => {
    // Only proceed if we clicked on the background (not an app or dock)
    if (e.target.closest('.ios-app-icon:not(.empty)') === null && 
        e.target.closest('.ios-dock') === null &&
        e.target.closest('.ios-page-dots') === null &&
        e.target.closest('.ios-home-widgets') === null) {
      backgroundTapCandidateRef.current = true;
      backgroundTapMovedRef.current = false;
      setDragState({
        isDragging: true,
        startX: e.touches[0].clientX,
        currentX: 0,
        startY: e.touches[0].clientY,
        currentY: 0,
        isTouch: true
      });
      if (homeRef.current) {
        homeRef.current.setAttribute('data-dragging', 'true');
      }
    }
  };

  const handleMouseDown = (e) => {
    // Only proceed if we clicked on the background (not an app or dock)
    if (e.target.closest('.ios-app-icon:not(.empty)') === null && 
        e.target.closest('.ios-dock') === null &&
        e.target.closest('.ios-page-dots') === null &&
        e.target.closest('.ios-home-widgets') === null) {
      backgroundTapCandidateRef.current = true;
      backgroundTapMovedRef.current = false;
      setDragState({
        isDragging: true,
        startX: e.clientX,
        currentX: 0,
        startY: e.clientY,
        currentY: 0,
        isTouch: false
      });
      if (homeRef.current) {
        homeRef.current.setAttribute('data-dragging', 'true');
      }
    }
  };

  const handleTouchMove = (e) => {
    if (!dragState.isDragging || !dragState.isTouch) return;

    // Calculate the distance moved with resistance
    const deltaX = (e.touches[0].clientX - dragState.startX) * 0.5;
    const deltaY = (e.touches[0].clientY - dragState.startY) * 0.5;

    if (backgroundTapCandidateRef.current && Math.abs(deltaX) + Math.abs(deltaY) > 12) {
      backgroundTapMovedRef.current = true;
    }

    applyDragEffect(deltaX, deltaY);
  };

  const handleMouseMove = (e) => {
    if (!dragState.isDragging || dragState.isTouch) return;

    // Calculate the distance moved with resistance
    const deltaX = (e.clientX - dragState.startX) * 0.5;
    const deltaY = (e.clientY - dragState.startY) * 0.5;

    if (backgroundTapCandidateRef.current && Math.abs(deltaX) + Math.abs(deltaY) > 12) {
      backgroundTapMovedRef.current = true;
    }

    applyDragEffect(deltaX, deltaY);
  };

  const applyDragEffect = (deltaX, deltaY) => {
    // Add resistance as we drag further
    const resistance = Math.min(1, 1 / (Math.abs(deltaX) / 100 + 1));
    
    setDragState(prev => ({
      ...prev,
      currentX: deltaX * resistance,
      currentY: deltaY * resistance
    }));

    // Apply the transform with a subtle rotation effect
    if (homeRef.current) {
      const rotate = (deltaX * 0.02) * resistance;
      const scale = 1 - (Math.abs(deltaX) * 0.0005);
      homeRef.current.style.transform = 
        `translate3d(${deltaX * resistance}px, ${deltaY * resistance}px, 0) 
         rotate(${rotate}deg) scale(${scale})`;
    }
  };

  const handleDragEnd = (endEvent) => {
    if (!dragState.isDragging) return;

    setDragState(prev => ({ ...prev, isDragging: false }));

    if (backgroundTapCandidateRef.current && !backgroundTapMovedRef.current && endEvent?.target?.closest) {
      const endTarget = endEvent.target;
      const endedOnRealIcon = endTarget.closest('.ios-app-icon:not(.empty)');
      const endedOnDock = endTarget.closest('.ios-dock');
      const endedOnDots = endTarget.closest('.ios-page-dots');
      const endedOnWidget = endTarget.closest('.ios-home-widgets');

      if (!endedOnRealIcon && !endedOnDock && !endedOnDots && !endedOnWidget) {
      handleBackgroundSwitch();
      }
    }
    backgroundTapCandidateRef.current = false;
    backgroundTapMovedRef.current = false;

    // Spring back animation
    if (homeRef.current) {
      homeRef.current.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      homeRef.current.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
      homeRef.current.setAttribute('data-dragging', 'false');

      // Clear the transition after animation
      setTimeout(() => {
        if (homeRef.current) {
          homeRef.current.style.transition = '';
        }
      }, 500);
    }
  };

  // Add event listener cleanup
  useEffect(() => {
    const cleanup = (event) => {
      handleDragEnd(event);
    };

    window.addEventListener('mouseup', cleanup);
    window.addEventListener('touchend', cleanup);
    return () => {
      window.removeEventListener('mouseup', cleanup);
      window.removeEventListener('touchend', cleanup);
    };
  }, []);
  
  const DynamicCalendarIcon = () => {
    const date = new Date();
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    const dayNumber = date.getDate();

    return (
      <div className="calendar-icon">
        <div className="calendar-day">{dayName}</div>
        <div className="calendar-date">{dayNumber}</div>
      </div>
    );
  };
  
  const handleBackgroundSwitch = () => {
    const currentIndex = WALLPAPERS.indexOf(currentBackground);
    const nextBackground = WALLPAPERS[(currentIndex + 1) % WALLPAPERS.length];
    setCurrentBackground(nextBackground);
    window.dispatchEvent(new CustomEvent('marco:shuffle-wallpaper', { detail: { background: nextBackground } }));
  };

  // Social-link apps (LinkedIn / Mail / Github) are wired up in
  // MarcoIosHomeShell.onAppSwitch so they open external resources
  // while keeping the iOS shell intact.

  const handleAppLaunch = (appId) => {
    if (appId === 'switch-background') {
      handleBackgroundSwitch();
      return;
    }
    onAppSwitch(appId);
  };
  
  // Sample app data for home screen (including our functional apps)
  const apps = [
    //{
    //  id: 'fund',
    //  name: 'Fair Sale',
    //  icon: '/assets/fund-logo.png',
    //  color: '#5BAA6F',
    //  component: FundApp
    //},
    //{
    //  id: 'fstracker',
    //  name: 'F.S. Tracker',
    //  icon: '/assets/cryptotracker-icon.png', 
    //  color: '#4A7C59', // Different shade of green to distinguish from Fund app
    //  component: FSTracker
    //},
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '/assets/linkedin-icon.png',
      color: '#0A66C2',
    },
    {
      id: 'mail',
      name: 'Mail',
      icon: '/assets/gmail-icon.png',
      color: 'transparent',
      noGlass: true,
    },
    {
      id: 'github',
      name: 'Github',
      icon: '/assets/github-icon.png',
      color: 'transparent',
      noGlass: true,
    },
    //{
      //id: 'oldfund',
      //name: 'Old Fair Sale',
      //icon: '/assets/old-fund-logo.png',
      //color: '#AA6F5B', // Different color to distinguish from the regular Fund app
    //},
    //{ id: 'calculator', name: 'Kekulator', icon: '/assets/calculator-icon.png', color: '#FF9500' },
   // { 
     // id: 'calendar', 
      //name: 'Calendar', 
      //customIcon: <DynamicCalendarIcon />,
      //color: '#FFFFFF'
    //},
    //{ id: 'weather', name: 'Weather', icon: '/assets/weather-icon.png', color: '#1BADF8' },
    //{ id: 'clock', name: 'Clock', icon: '/assets/clock-icon.png', color: '#000000' },
    //{ id: 'maps', name: 'Maps', icon: '/assets/maps-icon.png', color: '#63DA38' },
    //{ id: 'camera', name: 'Camera', icon: '/assets/camera-icon.png', color: '#5E5CE6' },
    
  ];
  
  // Dock apps (using our implemented apps)
  const dockApps = [
    { id: 'finder', name: 'Finder', icon: '/assets/finder-icon.png', color: 'transparent', noGlass: true },
    { id: 'memes', name: 'Portfolio', icon: '/assets/portfolio-icon.png', color: 'transparent', noGlass: true },

    //{ id: 'safari', name: 'Safari', icon: '/assets/safari-icon.png', color: '#FFFFFF' },
    { id: 'notes', name: 'CV', iconName: 'file-text', iconTint: '#111827', color: '#FBBF24' },
    {
      id: 'switch-background',
      name: 'Wallpaper',
      iconName: 'sparkles',
      iconTint: '#FFFFFF',
      color: 'transparent',
      noGlass: true,
      onClick: handleBackgroundSwitch
    },
    //{ id: 'settings', name: 'Settings', icon: '/assets/system-preferences-icon.png', color: '#8E8E93' }
  ];
  
  // Handle page change with dots indicator
  const changePage = (index) => {
    setCurrentPage(index);
  };
  
  // Render app icon for grid
  const renderAppIcon = (app) => {
    const isFrogchan = app.id === 'messages';
    const now = Date.now();
    const isLocked = isFrogchan && frogchanUnlockAt > now;
    // Special handling for Staking app with custom click behavior
    if (app.id === 'staking') {
      return (
        <div 
          key={app.id} 
          className="ios-app-icon"
          data-app-id={app.id}
          onClick={() => handleAppLaunch(app.id)}
        >
          <div 
            className="ios-app-icon-img"
            style={{ backgroundColor: app.color || '#E5E5EA' }}
          >
            {app.customIcon}
          </div>
          <div className="ios-app-icon-name">
            {app.name.split(' ').map((word, index) => (
              <span key={index} className="app-name-word">{word}</span>
            ))}
          </div>
        </div>
      );
    }
    
    // If the app has a component that should be rendered differently in the home screen
    if (app.component && app.id === 'fund') {
      return (
        <div 
          key={app.id} 
          className="ios-app-icon"
          data-app-id={app.id}
          onClick={() => handleAppLaunch(app.id)}
        >
          <div 
            className="ios-app-icon-img"
            style={{ backgroundColor: app.color || '#E5E5EA' }}
          >
            {app.customIcon || 
              <img 
                src={app.icon} 
                alt={app.name} 
              />
            }
          </div>
          <div className="ios-app-icon-name">
            {app.name.split(' ').map((word, index) => (
              <span key={index} className="app-name-word">{word}</span>
            ))}
          </div>
        </div>
      );
    }
    
    // Standard icon rendering
    return (
      <div 
        key={app.id} 
        className="ios-app-icon"
        data-app-id={app.id}
        data-locked={isLocked ? 'true' : 'false'}
        onClick={() => handleAppLaunch(app.id)}
      >
        <div
          className={`ios-app-icon-img${app.noGlass ? ' ios-icon-plain' : app.iconName ? ' ios-icon-glass' : ''}`}
          style={{
            backgroundColor: app.color || '#E5E5EA',
            '--icon-tint': app.color || '#111827',
            color: app.iconTint || 'rgba(255, 255, 255, 0.92)',
          }}
        >
          {isLocked && (
            <div className="ios-icon-liquid-lock" aria-hidden="true">
              <div className="ios-icon-liquid-lock__label">Locked</div>
            </div>
          )}
          {app.customIcon || (app.iconName ? <IOSIcon name={app.iconName} /> : (
            <img
              src={app.icon}
              alt={app.name}
              style={app.id === 'messages' ? { transform: 'scale(1.2)', maxWidth: '90%', maxHeight: '90%' } : {}}
            />
          ))}
        </div>
        <div className="ios-app-icon-name">
          {app.name.split(' ').map((word, index) => (
            <span key={index} className="app-name-word">{word}</span>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div 
      ref={homeRef}
      className="ios-home-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <div className="ios-home-toast-layer" aria-hidden="true">
        <div className="liquid-toast" data-state={toastOpen ? 'open' : 'closed'}>
          {toastMessage}
        </div>
      </div>
      {/* Home screen content */}
      <div className="ios-home-content">
        {/* Page 1 */}
        {currentPage === 0 && (
          <>
            <div className="ios-app-grid">
              {apps.slice(0, 12).map(app => renderAppIcon(app))}
              {/* Fill remaining grid with blank spots if needed */}
              {Array(Math.max(0, 12 - apps.slice(0, 12).length)).fill().map((_, i) => (
                <div key={`empty-${i}`} className="ios-app-icon empty"></div>
              ))}
            </div>
          </>
        )}
        
        {/* Page 2 */}
        {currentPage === 1 && (
          <div className="ios-app-grid">
            {apps.slice(12).map(app => renderAppIcon(app))}
            {/* Fill remaining grid with blank spots if needed */}
            {Array(Math.max(0, 12 - apps.slice(12).length)).fill().map((_, i) => (
              <div key={`empty-${i}`} className="ios-app-icon empty"></div>
            ))}
          </div>
        )}
      </div>
      
      {/* Page indicator dots */}
      <div className="ios-page-dots">
        <div 
          className={`ios-page-dot ${currentPage === 0 ? 'active' : ''}`}
          onClick={() => changePage(0)}
        ></div>
        <div 
          className={`ios-page-dot ${currentPage === 1 ? 'active' : ''}`}
          onClick={() => changePage(1)}
        ></div>
      </div>
      
      {/* Dock */}
      <Dock apps={dockApps} onAppLaunch={handleAppLaunch} />
    </div>
  );
};

export default IOSHome; 
