// ==UserScript==
// @name         VRCX-Extended Utilities
// @description  Utility functions for VRCX-Extended
// ==UserScript==

/**
 * Utility functions module for VRCX-Extended
 * Contains helper functions for common operations
 */
window.VRCXExtended = window.VRCXExtended || {};

window.VRCXExtended.Utils = {
  /**
   * Generate a unique ID
   * @returns {string} Unique identifier
   */
  uid() {
    return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  },

  /**
   * Get current timestamp in ISO format
   * @returns {string} ISO timestamp
   */
  nowIso() {
    return new Date().toISOString();
  },

  /**
   * Read JSON data from localStorage with fallback
   * @param {string} key - Storage key
   * @param {*} fallback - Fallback value if parsing fails
   * @returns {*} Parsed JSON or fallback
   */
  readJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },

  /**
   * Write JSON data to localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  /**
   * Sort items by updated timestamp (newest first)
   * @param {Object} a - First item
   * @param {Object} b - Second item
   * @returns {number} Sort comparison result
   */
  sortByUpdated(a, b) {
    return (b.updatedAt || '').localeCompare(a.updatedAt || '');
  },

  /**
   * Show notification to user
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, success, error)
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'var(--red-2, #f56c6c)' : 
                   type === 'success' ? 'var(--green-2, #67c23a)' : 
                   'var(--accent-1, #66b1ff)';
    
    notification.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      padding: 16px 20px;
      background: ${bgColor};
      color: var(--bg-4);
      border-radius: var(--border-radius);
      font-family: var(--font-primary);
      font-size: 14px;
      font-weight: 500;
      max-width: 400px;
      box-shadow: var(--shadow-elevated);
      z-index: 10000;
      transition: var(--transition);
      animation: slideInNotification 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
    `;
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInNotification {
        from { 
          transform: translateX(100%) scale(0.9); 
          opacity: 0; 
        }
        to { 
          transform: translateX(0) scale(1); 
          opacity: 1; 
        }
      }
    `;
    document.head.appendChild(style);
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%) scale(0.9)';
        setTimeout(() => {
          notification.remove();
          if (style.parentNode) style.remove();
        }, 300);
      }
    }, 4000);
  },

  /**
   * Safe console logging for cross-window scenarios
   * @param {string} level - Log level (log, warn, error, info)
   * @param {...*} args - Arguments to log
   */
  safeConsoleLog(level, ...args) {
    const originalMethod = console[level] || console.log;
    originalMethod.apply(console, args);
    
    // Try to forward to opener window if available
    if (window.opener && window.opener.console) {
      try {
        const openerMethod = window.opener.console[level] || window.opener.console.log;
        openerMethod.call(window.opener.console, '[VRCX-Extended]', ...args);
      } catch (e) {
        // Ignore cross-origin errors
      }
    }
  },

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Deep clone an object
   * @param {*} obj - Object to clone
   * @returns {*} Cloned object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      Object.keys(obj).forEach(key => {
        clonedObj[key] = this.deepClone(obj[key]);
      });
      return clonedObj;
    }
  }
};
