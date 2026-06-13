import React, { useEffect, useState } from 'react';

const IOSSplashScreen = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [splashImageLoaded, setSplashImageLoaded] = useState(false);
  const [logoImageLoaded, setLogoImageLoaded] = useState(false);
  
  // Image paths
  const splashImagePath = "/assets/splash-screen.png";
  const logoImagePath = "/assets/logo.png";

  // Preload both images before showing splash screen
  useEffect(() => {
    const splashImage = new Image();
    const logoImage = new Image();
    
    splashImage.onload = () => {
      setSplashImageLoaded(true);
    };
    
    logoImage.onload = () => {
      setLogoImageLoaded(true);
    };
    
    // Handle loading errors
    splashImage.onerror = () => {
      console.error("Failed to load splash image");
      setSplashImageLoaded(true); // Proceed anyway to avoid blocking the app
    };
    
    logoImage.onerror = () => {
      console.error("Failed to load logo image");
      setLogoImageLoaded(true); // Proceed anyway to avoid blocking the app
    };
    
    // Start loading images
    splashImage.src = splashImagePath;
    logoImage.src = logoImagePath;
    
    // If images are already in cache, the onload might not trigger
    if (splashImage.complete) setSplashImageLoaded(true);
    if (logoImage.complete) setLogoImageLoaded(true);
  }, []);
  
  // When both images are loaded, set images loaded state to true
  useEffect(() => {
    if (splashImageLoaded && logoImageLoaded) {
      setImagesLoaded(true);
    }
  }, [splashImageLoaded, logoImageLoaded]);

  // Start progress animation only after images are loaded
  useEffect(() => {
    if (!imagesLoaded) return;
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onLoadComplete();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [imagesLoaded, onLoadComplete]);

  // Always render a black screen, and only show content when images are loaded
  return (
    <div className="ios-splash-screen">
      {imagesLoaded ? (
        <>
          {/* Background splash image */}
          <div className="ios-splash-background">
            <img 
              src={splashImagePath} 
              alt="" 
              className="splash-image"
              style={{
                filter: `blur(${(() => {
                  const maxBlurPx = 5;
                  const unblurStart = 67;
                  if (progress <= unblurStart) return maxBlurPx;
                  const t = Math.min(1, Math.max(0, (progress - unblurStart) / (100 - unblurStart)));
                  return maxBlurPx * (1 - t);
                })()}px)`
              }}
            />
          </div>

          <div className="ios-splash-content">
            <div className="ios-splash-logo">
              <img 
                src={logoImagePath} 
                alt="Pepple Logo" 
                className="apple-logo" 
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  filter: 'none',
                  mixBlendMode: 'normal'
                }}
              />
            </div>
            <div className="ios-splash-loading-bar">
              <div 
                className="ios-splash-loading-progress" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default IOSSplashScreen; 
