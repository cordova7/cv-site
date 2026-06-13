import React from 'react';
import IOSIcon from './IOSIcon';

const Dock = ({ apps, onAppLaunch }) => {
  const renderAppIcon = (app) => (
    <div 
      key={app.id} 
      className="ios-app-icon"
      data-app-id={app.id}
      onClick={() => {
        // If the app has its own onClick handler, use that directly
        if (app.onClick) {
          app.onClick();
        } else {
          // Otherwise use the general app launch function
          onAppLaunch(app.id);
        }
      }}
    >
      <div
        className={`ios-app-icon-img${app.noGlass ? ' ios-icon-plain' : app.iconName ? ' ios-icon-glass' : ''}`}
        style={{
          backgroundColor: app.color || '#E5E5EA',
          '--icon-tint': app.color || '#111827',
          color: app.iconTint || 'rgba(255, 255, 255, 0.92)',
        }}
      >
        {app.customIcon || (app.iconName ? <IOSIcon name={app.iconName} /> : <img src={app.icon} alt={app.name} />)}
      </div>
      <span className="ios-app-icon-name">
        {app.name}
      </span>
    </div>
  );

  return (
    <div className="ios-dock">
      <div className="ios-dock-apps">
        {apps.map(app => renderAppIcon(app))}
      </div>
    </div>
  );
};

export default Dock; 
