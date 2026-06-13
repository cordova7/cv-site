import { config } from './config.js';
import { getElement, addEventListener } from './dom.js';

// Authentication state
let authState = {
  isAuthenticated: false,
  identity: null,
  principalId: null
};

// Initialize authentication
export const initializeAuth = () => {
  const authRoot = getElement('auth-root');
  if (!authRoot) return;

  // Create auth UI
  const authButton = document.createElement('button');
  authButton.className = 'auth-button';
  authButton.textContent = 'Login with Internet Identity';
  authButton.addEventListener('click', handleAuthClick);
  authRoot.appendChild(authButton);

  // Check initial auth state
  checkAuthState();
};

// Handle auth button click
const handleAuthClick = async () => {
  try {
    if (authState.isAuthenticated) {
      await logout();
    } else {
      await login();
    }
  } catch (error) {
    console.error('Auth error:', error);
    updateAuthUI('Error: ' + error.message);
  }
};

// Login with Internet Identity
const login = async () => {
  try {
    // TODO: Implement Internet Identity login
    // This will be implemented when we integrate with the IC backend
    updateAuthUI('Login not implemented yet');
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Logout
const logout = async () => {
  try {
    // TODO: Implement Internet Identity logout
    // This will be implemented when we integrate with the IC backend
    authState = {
      isAuthenticated: false,
      identity: null,
      principalId: null
    };
    updateAuthUI('Logged out');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

// Check current auth state
const checkAuthState = async () => {
  try {
    // TODO: Implement auth state check
    // This will be implemented when we integrate with the IC backend
    updateAuthUI('Not authenticated');
  } catch (error) {
    console.error('Auth state check failed:', error);
    updateAuthUI('Error checking auth state');
  }
};

// Update auth UI
const updateAuthUI = (status) => {
  const authButton = document.querySelector('.auth-button');
  if (authButton) {
    if (authState.isAuthenticated) {
      authButton.textContent = `Logout (${authState.principalId})`;
      authButton.classList.add('connected');
    } else {
      authButton.textContent = 'Login with Internet Identity';
      authButton.classList.remove('connected');
    }
  }
};

// Export auth state
export const getAuthState = () => authState;

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeAuth);
