import React from 'react';

const IOSStatusBar = ({ time, title }) => {
  return (
    <div className="ios-status-bar">
      <div className="ios-status-bar-left">
        <div className="ios-status-bar-time">{time || '12:30'}</div>
      </div>
      
      {title && (
        <div className="ios-status-bar-title">
          {title}
        </div>
      )}
      
      <div className="ios-status-bar-right">
        <div className="ios-status-bar-signal">
          <div className="ios-signal-bar"></div>
          <div className="ios-signal-bar"></div>
          <div className="ios-signal-bar"></div>
          <div className="ios-signal-bar"></div>
        </div>
        
        <img className="ios-status-bar-solana" src="/assets/mc-logo-white.png" alt="MC" />

        <div className="ios-status-bar-battery">
          <div className="ios-status-bar-battery-level"></div>
        </div>
      </div>
    </div>
  );
};

export default IOSStatusBar; 
