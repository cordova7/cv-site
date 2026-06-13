/**
 * PeppleOS Debug Tools
 * A comprehensive set of debugging utilities for PeppleOS
 */

// Define PeppleDebug as a global variable
var PeppleDebug = {};

// Private state
let state = {
  isInitialized: false,
  isActive: false,
  visualDebugMode: false,
  consoleDebugMode: true,
  inspectedElement: null,
  overlayVisible: false,
  moduleStates: {}
};

/**
 * Initialize the Debug Toolkit
 */
function init() {
  if (state.isInitialized) {
    console.log('[PeppleDebug] Debug tools already initialized');
    return PeppleDebug;
  }
  
  console.log('[PeppleDebug] Initializing debug tools');
  
  // Create debug UI
  createDebugUI();
  
  // Set up keyboard shortcuts
  setupKeyboardShortcuts();
  
  // Collect all module states
  collectModuleStates();
  
  // Mark as initialized
  state.isInitialized = true;
  
  console.log('[PeppleDebug] Debug tools initialized');
  console.log('[PeppleDebug] Press Ctrl+Shift+D to toggle debug panel');
  return PeppleDebug;
}

/**
 * Create debug UI elements
 */
function createDebugUI() {
  // Debug panel container
  const debugPanel = document.createElement('div');
  debugPanel.id = 'pepple-debug-panel';
  debugPanel.style.position = 'fixed';
  debugPanel.style.bottom = '0';
  debugPanel.style.right = '0';
  debugPanel.style.width = '300px';
  debugPanel.style.height = '400px';
  debugPanel.style.background = 'rgba(0, 0, 0, 0.8)';
  debugPanel.style.color = 'white';
  debugPanel.style.fontFamily = 'monospace';
  debugPanel.style.fontSize = '12px';
  debugPanel.style.padding = '10px';
  debugPanel.style.zIndex = '99999';
  debugPanel.style.overflow = 'auto';
  debugPanel.style.borderTop = '2px solid #666';
  debugPanel.style.borderLeft = '2px solid #666';
  debugPanel.style.display = 'none';
  
  // Header
  const header = document.createElement('div');
  header.innerHTML = '<h3 style="margin: 0; color: #7fc5f8;">PeppleOS Debug</h3>';
  header.style.borderBottom = '1px solid #666';
  header.style.paddingBottom = '5px';
  header.style.marginBottom = '10px';
  debugPanel.appendChild(header);
  
  // Controls
  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.flexWrap = 'wrap';
  controls.style.gap = '5px';
  controls.style.marginBottom = '10px';
  
  // Visual debug toggle
  const visualDebugBtn = document.createElement('button');
  visualDebugBtn.id = 'pepple-debug-visual-toggle';
  visualDebugBtn.textContent = 'Visual Debug';
  visualDebugBtn.style.background = '#333';
  visualDebugBtn.style.color = 'white';
  visualDebugBtn.style.border = '1px solid #666';
  visualDebugBtn.style.padding = '3px 8px';
  visualDebugBtn.style.cursor = 'pointer';
  visualDebugBtn.style.borderRadius = '3px';
  visualDebugBtn.addEventListener('click', toggleVisualDebug);
  controls.appendChild(visualDebugBtn);
  
  // Console debug toggle
  const consoleDebugBtn = document.createElement('button');
  consoleDebugBtn.id = 'pepple-debug-console-toggle';
  consoleDebugBtn.textContent = 'Console Debug';
  consoleDebugBtn.style.background = '#007bff';
  consoleDebugBtn.style.color = 'white';
  consoleDebugBtn.style.border = '1px solid #0056b3';
  consoleDebugBtn.style.padding = '3px 8px';
  consoleDebugBtn.style.cursor = 'pointer';
  consoleDebugBtn.style.borderRadius = '3px';
  consoleDebugBtn.addEventListener('click', toggleConsoleLog);
  controls.appendChild(consoleDebugBtn);
  
  // Modules state button
  const modulesBtn = document.createElement('button');
  modulesBtn.id = 'pepple-debug-modules';
  modulesBtn.textContent = 'Show Modules';
  modulesBtn.style.background = '#333';
  modulesBtn.style.color = 'white';
  modulesBtn.style.border = '1px solid #666';
  modulesBtn.style.padding = '3px 8px';
  modulesBtn.style.cursor = 'pointer';
  modulesBtn.style.borderRadius = '3px';
  modulesBtn.addEventListener('click', showModuleStates);
  controls.appendChild(modulesBtn);
  
  // Inspector button
  const inspectorBtn = document.createElement('button');
  inspectorBtn.id = 'pepple-debug-inspector';
  inspectorBtn.textContent = 'Element Inspector';
  inspectorBtn.style.background = '#333';
  inspectorBtn.style.color = 'white';
  inspectorBtn.style.border = '1px solid #666';
  inspectorBtn.style.padding = '3px 8px';
  inspectorBtn.style.cursor = 'pointer';
  inspectorBtn.style.borderRadius = '3px';
  inspectorBtn.addEventListener('click', toggleInspector);
  controls.appendChild(inspectorBtn);
  
  debugPanel.appendChild(controls);
  
  // Content area
  const content = document.createElement('div');
  content.id = 'pepple-debug-content';
  content.style.fontFamily = 'monospace';
  content.style.fontSize = '11px';
  content.style.color = '#ccc';
  content.style.height = 'calc(100% - 80px)';
  content.style.overflowY = 'auto';
  content.style.backgroundColor = '#222';
  content.style.padding = '5px';
  content.style.borderRadius = '3px';
  content.innerHTML = '<p>Debug information will appear here</p>';
  debugPanel.appendChild(content);
  
  // Footer with credits
  const footer = document.createElement('div');
  footer.style.fontSize = '10px';
  footer.style.color = '#999';
  footer.style.marginTop = '10px';
  footer.style.textAlign = 'right';
  footer.innerHTML = 'PeppleOS Debug Tools v1.0';
  debugPanel.appendChild(footer);
  
  // Highlight overlay for element inspection
  const highlightOverlay = document.createElement('div');
  highlightOverlay.id = 'pepple-debug-highlight';
  highlightOverlay.style.position = 'absolute';
  highlightOverlay.style.pointerEvents = 'none';
  highlightOverlay.style.border = '2px solid #f00';
  highlightOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
  highlightOverlay.style.zIndex = '99998';
  highlightOverlay.style.display = 'none';
  
  // Info tooltip
  const infoTooltip = document.createElement('div');
  infoTooltip.id = 'pepple-debug-tooltip';
  infoTooltip.style.position = 'absolute';
  infoTooltip.style.background = 'rgba(0, 0, 0, 0.8)';
  infoTooltip.style.color = 'white';
  infoTooltip.style.padding = '5px';
  infoTooltip.style.borderRadius = '3px';
  infoTooltip.style.fontSize = '11px';
  infoTooltip.style.fontFamily = 'monospace';
  infoTooltip.style.zIndex = '99999';
  infoTooltip.style.display = 'none';
  
  // Append to document
  document.body.appendChild(debugPanel);
  document.body.appendChild(highlightOverlay);
  document.body.appendChild(infoTooltip);
}

/**
 * Set up keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Ctrl+Shift+D - Toggle Debug Panel
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      toggle();
    }
    
    // Ctrl+Shift+I - Toggle Inspector
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      toggleInspector();
    }
    
    // Ctrl+Shift+V - Toggle Visual Debug
    if (e.ctrlKey && e.shiftKey && e.key === 'V') {
      e.preventDefault();
      toggleVisualDebug();
    }
    
    // Ctrl+Shift+C - Toggle Console Debug
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      toggleConsoleLog();
    }
    
    // Escape - Close Inspector
    if (e.key === 'Escape' && state.inspectedElement) {
      clearInspector();
    }
  });
}

/**
 * Toggle the debug panel
 */
function toggle() {
  const debugPanel = document.getElementById('pepple-debug-panel');
  if (!debugPanel) return;
  
  state.isActive = !state.isActive;
  debugPanel.style.display = state.isActive ? 'block' : 'none';
  
  // Collect updated module states when opened
  if (state.isActive) {
    collectModuleStates();
    
    // Show module states in content area
    showModuleStates();
  }
  
  console.log(`[PeppleDebug] Debug panel ${state.isActive ? 'opened' : 'closed'}`);
  return state.isActive;
}

/**
 * Toggle the element inspector
 */
function toggleInspector() {
  if (state.inspectedElement) {
    clearInspector();
    return;
  }
  
  // Enable inspector mode
  document.body.style.cursor = 'crosshair';
  
  // Add inspector event listener
  document.addEventListener('mousemove', handleInspectorMouseMove);
  document.addEventListener('click', handleInspectorClick);
  
  console.log('[PeppleDebug] Inspector activated - click on an element to inspect');
}

/**
 * Handle inspector mouse move
 */
function handleInspectorMouseMove(e) {
  const highlightOverlay = document.getElementById('pepple-debug-highlight');
  const infoTooltip = document.getElementById('pepple-debug-tooltip');
  if (!highlightOverlay || !infoTooltip) return;
  
  // Skip if mouse is over debug panel
  if (e.target.closest('#pepple-debug-panel')) {
    highlightOverlay.style.display = 'none';
    infoTooltip.style.display = 'none';
    return;
  }
  
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (!element) return;
  
  // Get element bounds
  const rect = element.getBoundingClientRect();
  
  // Update highlight
  highlightOverlay.style.left = rect.left + 'px';
  highlightOverlay.style.top = rect.top + 'px';
  highlightOverlay.style.width = rect.width + 'px';
  highlightOverlay.style.height = rect.height + 'px';
  highlightOverlay.style.display = 'block';
  
  // Update tooltip
  infoTooltip.innerHTML = `
    <div><strong>Element:</strong> ${element.tagName.toLowerCase()}</div>
    <div><strong>ID:</strong> ${element.id || 'none'}</div>
    <div><strong>Class:</strong> ${element.className || 'none'}</div>
    <div><strong>Size:</strong> ${Math.round(rect.width)} × ${Math.round(rect.height)}</div>
  `;
  
  infoTooltip.style.left = (e.clientX + 10) + 'px';
  infoTooltip.style.top = (e.clientY + 10) + 'px';
  infoTooltip.style.display = 'block';
}

/**
 * Handle inspector click
 */
function handleInspectorClick(e) {
  // Skip if click is on debug panel
  if (e.target.closest('#pepple-debug-panel')) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (!element) return;
  
  // Set inspected element
  state.inspectedElement = element;
  
  // Show element details in debug panel
  inspect(element);
  
  // Clean up inspector mode
  document.body.style.cursor = '';
  document.removeEventListener('mousemove', handleInspectorMouseMove);
  document.removeEventListener('click', handleInspectorClick);
  
  // Keep highlight visible
  state.overlayVisible = true;
}

/**
 * Clear inspector
 */
function clearInspector() {
  // Reset inspected element
  state.inspectedElement = null;
  
  // Hide highlight
  const highlightOverlay = document.getElementById('pepple-debug-highlight');
  const infoTooltip = document.getElementById('pepple-debug-tooltip');
  if (highlightOverlay) highlightOverlay.style.display = 'none';
  if (infoTooltip) infoTooltip.style.display = 'none';
  
  // Reset cursor
  document.body.style.cursor = '';
  
  // Clean up event listeners
  document.removeEventListener('mousemove', handleInspectorMouseMove);
  document.removeEventListener('click', handleInspectorClick);
  
  state.overlayVisible = false;
  
  console.log('[PeppleDebug] Inspector deactivated');
}

/**
 * Inspect a DOM element
 */
function inspect(element) {
  if (!element) {
    console.error('[PeppleDebug] No element provided for inspection');
    return;
  }
  
  const content = document.getElementById('pepple-debug-content');
  if (!content) return;
  
  // Get element details
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  
  // Format element info
  let info = `<h4 style="color: #7fc5f8; margin: 0 0 5px 0;">Element Inspector</h4>`;
  info += `<div style="margin-bottom: 10px;">`;
  info += `<div><strong>Tag:</strong> ${element.tagName.toLowerCase()}</div>`;
  info += `<div><strong>ID:</strong> ${element.id || 'none'}</div>`;
  info += `<div><strong>Classes:</strong> ${element.className || 'none'}</div>`;
  info += `<div><strong>Size:</strong> ${Math.round(rect.width)} × ${Math.round(rect.height)}</div>`;
  info += `<div><strong>Position:</strong> (${Math.round(rect.left)}, ${Math.round(rect.top)})</div>`;
  info += `<div><strong>z-index:</strong> ${styles.zIndex}</div>`;
  info += `<div><strong>Visibility:</strong> ${styles.display} / ${styles.visibility}</div>`;
  info += `</div>`;
  
  // Add important computed styles
  info += `<h4 style="color: #7fc5f8; margin: 5px 0;">Computed Styles</h4>`;
  info += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; margin-bottom: 10px;">`;
  info += `<div><strong>display:</strong> ${styles.display}</div>`;
  info += `<div><strong>position:</strong> ${styles.position}</div>`;
  info += `<div><strong>width:</strong> ${styles.width}</div>`;
  info += `<div><strong>height:</strong> ${styles.height}</div>`;
  info += `<div><strong>margin:</strong> ${styles.margin}</div>`;
  info += `<div><strong>padding:</strong> ${styles.padding}</div>`;
  info += `<div><strong>border:</strong> ${styles.border}</div>`;
  info += `<div><strong>background:</strong> ${styles.background.substring(0, 15)}...</div>`;
  info += `<div><strong>color:</strong> ${styles.color}</div>`;
  info += `<div><strong>font-size:</strong> ${styles.fontSize}</div>`;
  info += `</div>`;
  
  // Add DOM path
  info += `<h4 style="color: #7fc5f8; margin: 5px 0;">DOM Path</h4>`;
  info += `<div style="font-family: monospace; word-break: break-all; margin-bottom: 10px; font-size: 10px;">`;
  info += getDOMPath(element);
  info += `</div>`;
  
  // Add event listeners
  info += `<h4 style="color: #7fc5f8; margin: 5px 0;">Event Listeners</h4>`;
  info += `<div style="margin-bottom: 10px; font-size: 10px;">`;
  info += `<em>Note: Only shows jQuery and directly attached listeners</em><br>`;
  
  // Try to get jQuery events if jQuery is available
  if (window.jQuery) {
    const $el = window.jQuery(element);
    const events = window.jQuery._data($el[0], 'events');
    if (events) {
      Object.keys(events).forEach(event => {
        info += `<div>${event}: ${events[event].length} handler(s)</div>`;
      });
    } else {
      info += `<div>No jQuery events found</div>`;
    }
  } else {
    info += `<div>jQuery not available</div>`;
  }
  
  info += `</div>`;
  
  // Update content
  content.innerHTML = info;
  
  // Highlight the element
  highlight(element);
  
  return element;
}

/**
 * Get DOM path for an element
 */
function getDOMPath(element) {
  const path = [];
  let currentNode = element;
  
  while (currentNode && currentNode !== document.body) {
    let selector = currentNode.tagName.toLowerCase();
    
    if (currentNode.id) {
      selector += `#${currentNode.id}`;
    } else if (currentNode.className) {
      const classes = Array.from(currentNode.classList).join('.');
      if (classes) {
        selector += `.${classes}`;
      }
    }
    
    const siblings = Array.from(currentNode.parentNode?.children || []);
    if (siblings.length > 1) {
      const index = siblings.indexOf(currentNode) + 1;
      selector += `:nth-child(${index})`;
    }
    
    path.unshift(selector);
    currentNode = currentNode.parentNode;
  }
  
  return path.join(' > ');
}

/**
 * Highlight an element
 */
function highlight(element) {
  if (!element) return;
  
  const highlightOverlay = document.getElementById('pepple-debug-highlight');
  if (!highlightOverlay) return;
  
  const rect = element.getBoundingClientRect();
  
  highlightOverlay.style.left = rect.left + 'px';
  highlightOverlay.style.top = rect.top + 'px';
  highlightOverlay.style.width = rect.width + 'px';
  highlightOverlay.style.height = rect.height + 'px';
  highlightOverlay.style.display = 'block';
}

/**
 * Clear highlights
 */
function clear() {
  const highlightOverlay = document.getElementById('pepple-debug-highlight');
  const infoTooltip = document.getElementById('pepple-debug-tooltip');
  
  if (highlightOverlay) highlightOverlay.style.display = 'none';
  if (infoTooltip) infoTooltip.style.display = 'none';
  
  state.overlayVisible = false;
}

/**
 * Collect module states from all Pepple modules
 */
function collectModuleStates() {
  state.moduleStates = {};
  
  // Check for modules in window object
  ['PeppleAbout', 'PeppleFinder', 'PeppleDock', 'WindowManager', 'SystemSettings'].forEach(moduleName => {
    if (window[moduleName]) {
      try {
        if (typeof window[moduleName].getState === 'function') {
          state.moduleStates[moduleName] = window[moduleName].getState();
        } else {
          state.moduleStates[moduleName] = { active: true, note: 'No getState method' };
        }
      } catch (e) {
        state.moduleStates[moduleName] = { error: e.message };
      }
    } else {
      state.moduleStates[moduleName] = { active: false, note: 'Not loaded' };
    }
  });
  
  return state.moduleStates;
}

/**
 * Show module states in the debug panel
 */
function showModuleStates() {
  const content = document.getElementById('pepple-debug-content');
  if (!content) return;
  
  // Update module states
  collectModuleStates();
  
  let info = `<h4 style="color: #7fc5f8; margin: 0 0 5px 0;">Module States</h4>`;
  
  // Format module states
  Object.keys(state.moduleStates).forEach(moduleName => {
    const moduleState = state.moduleStates[moduleName];
    
    info += `<div style="margin-bottom: 10px;">`;
    info += `<div style="color: ${moduleState.active === false ? '#999' : '#fff'};">`;
    info += `<strong>${moduleName}:</strong> `;
    info += `<span style="color: ${moduleState.active === false ? '#f66' : '#6f6'};">`;
    info += `${moduleState.active === false ? 'Inactive' : 'Active'}`;
    info += `</span>`;
    info += `</div>`;
    
    if (moduleState.note) {
      info += `<div style="color: #999; font-size: 10px;">${moduleState.note}</div>`;
    }
    
    if (moduleState.error) {
      info += `<div style="color: #f66; font-size: 10px;">Error: ${moduleState.error}</div>`;
    }
    
    if (moduleState.active !== false && moduleState.note === undefined && moduleState.error === undefined) {
      info += `<div style="margin-left: 10px; font-size: 10px;">`;
      
      // Show module properties
      Object.keys(moduleState).forEach(key => {
        if (typeof moduleState[key] !== 'function') {
          let value = moduleState[key];
          
          // Format value based on type
          if (typeof value === 'object' && value !== null) {
            try {
              value = JSON.stringify(value).substring(0, 50);
              if (JSON.stringify(value).length > 50) value += '...';
            } catch (e) {
              value = '[Object]';
            }
          }
          
          info += `<div><em>${key}:</em> ${value}</div>`;
        }
      });
      
      info += `</div>`;
    }
    
    info += `</div>`;
  });
  
  // Update content
  content.innerHTML = info;
  
  return state.moduleStates;
}

/**
 * Toggle console logging
 */
function toggleConsoleLog() {
  state.consoleDebugMode = !state.consoleDebugMode;
  
  const consoleButton = document.getElementById('pepple-debug-console-toggle');
  if (consoleButton) {
    consoleButton.style.background = state.consoleDebugMode ? '#007bff' : '#333';
    consoleButton.style.border = state.consoleDebugMode ? '1px solid #0056b3' : '1px solid #666';
  }
  
  console.log(`[PeppleDebug] Console debug mode ${state.consoleDebugMode ? 'enabled' : 'disabled'}`);
  
  // Override console methods to add filtering if enabled
  if (state.consoleDebugMode) {
    // Keep original console methods
    if (!window._originalConsole) {
      window._originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug
      };
    }
  } else {
    // Restore original console methods
    if (window._originalConsole) {
      console.log = window._originalConsole.log;
      console.warn = window._originalConsole.warn;
      console.error = window._originalConsole.error;
      console.info = window._originalConsole.info;
      console.debug = window._originalConsole.debug;
    }
  }
  
  return state.consoleDebugMode;
}

/**
 * Toggle visual debugging
 */
function toggleVisualDebug() {
  state.visualDebugMode = !state.visualDebugMode;
  
  const visualButton = document.getElementById('pepple-debug-visual-toggle');
  if (visualButton) {
    visualButton.style.background = state.visualDebugMode ? '#007bff' : '#333';
    visualButton.style.border = state.visualDebugMode ? '1px solid #0056b3' : '1px solid #666';
  }
  
  console.log(`[PeppleDebug] Visual debug mode ${state.visualDebugMode ? 'enabled' : 'disabled'}`);
  
  // Add/remove debug styles
  const debugStyles = document.getElementById('pepple-debug-styles');
  if (state.visualDebugMode) {
    if (!debugStyles) {
      const style = document.createElement('style');
      style.id = 'pepple-debug-styles';
      style.textContent = `
        * { outline: 1px solid rgba(255, 0, 0, 0.1); }
        div, section, header, footer, nav, aside, main { outline: 1px solid rgba(255, 0, 0, 0.2); }
        h1, h2, h3, h4, h5, h6 { outline: 1px solid rgba(0, 255, 0, 0.2); }
        p, span, a, button, input { outline: 1px solid rgba(0, 0, 255, 0.2); }
        img { outline: 2px solid rgba(255, 255, 0, 0.5); }
        .app-window { outline: 2px dashed rgba(255, 0, 255, 0.5) !important; }
      `;
      document.head.appendChild(style);
    }
  } else {
    if (debugStyles) {
      debugStyles.remove();
    }
  }
  
  return state.visualDebugMode;
}

/**
 * Get the current state
 */
function getState() {
  return { ...state };
}

// Expose the module API
PeppleDebug = {
  init,
  toggle,
  inspect,
  highlight,
  clear,
  showModuleStates,
  toggleConsoleLog,
  toggleVisualDebug,
  getState
}; 