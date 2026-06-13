import React from 'react';
import IOSIcon from './IOSIcon';

const GlassDock = ({ apps, onAppLaunch }) => {
  const renderAppIcon = (app) => (
    <div 
      key={app.id} 
      className="glass-dock-app-icon"
      data-app-id={app.id}
      onClick={() => {
        if (app.onClick) {
          app.onClick();
        } else {
          onAppLaunch(app.id);
        }
      }}
    >
      <div
        className={`glass-dock-app-icon-img${app.noGlass ? ' ios-icon-plain' : app.iconName ? ' ios-icon-glass' : ''}`}
        style={{
          backgroundColor: app.color || '#E5E5EA',
          '--icon-tint': app.color || '#111827',
          color: app.iconTint || 'rgba(255, 255, 255, 0.92)',
        }}
      >
        {app.customIcon || (app.iconName ? <IOSIcon name={app.iconName} /> : <img src={app.icon} alt={app.name} />)}
        <div className="glass-dock-icon-glow"></div>
      </div>
      <span className="glass-dock-app-icon-name">
        {app.name}
      </span>
    </div>
  );

  return (
    <div className="glass-dock">
      <div className="glass-dock-container">
        <div className="glass-dock-inner">
          {apps.map(app => renderAppIcon(app))}
        </div>
      </div>
    </div>
  );
};

export default GlassDock;
