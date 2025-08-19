// ==Module==
// @name         VRCX-Extended Utilities
// @description  Utility functions for VRCX-Extended
// ==Module==

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
   * Show notification using VRCX's native Noty system
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, success, error, warning)
   * @param {number} timeout - Auto-close timeout in milliseconds (optional)
   */
  showNotification(message, type = 'info', timeout = null) {
    // Check if we're in VRCX environment with Noty available
    // VRCX uses Noty directly, not window.Noty
    const NotyClass = (typeof Noty !== 'undefined') ? Noty : 
                      (typeof window.Noty !== 'undefined') ? window.Noty : null;
    
    if (NotyClass) {
      const notyType = type === 'error' ? 'error' : 
                      type === 'success' ? 'success' : 
                      type === 'warning' ? 'warning' : 'info';
      
      const notyTimeout = timeout !== null ? timeout : 
                         type === 'error' ? 6000 : 
                         type === 'warning' ? 5000 : 4000;

      new NotyClass({
        type: notyType,
        text: message,
        timeout: notyTimeout,
        layout: 'bottomLeft',
        theme: 'mint'
      }).show();
      
      return;
    }
    
    // Fallback for non-VRCX environments (like popup window)
    this.showFallbackNotification(message, type, timeout);
  },

  /**
   * Show success notification with VRCX Noty
   * @param {string} message - Success message
   * @param {number} timeout - Auto-close timeout (default: 4000ms)
   */
  showSuccessNotification(message, timeout = 4000) {
    const NotyClass = (typeof Noty !== 'undefined') ? Noty : 
                      (typeof window.Noty !== 'undefined') ? window.Noty : null;
    
    if (NotyClass) {
      new NotyClass({
        type: 'success',
        text: message,
        timeout: timeout,
        layout: 'bottomLeft',
        theme: 'mint'
      }).show();
    } else {
      this.showFallbackNotification(message, 'success', timeout);
    }
  },

  /**
   * Show error notification with VRCX Noty
   * @param {string} message - Error message
   * @param {number} timeout - Auto-close timeout (default: 6000ms)
   */
  showErrorNotification(message, timeout = 6000) {
    const NotyClass = (typeof Noty !== 'undefined') ? Noty : 
                      (typeof window.Noty !== 'undefined') ? window.Noty : null;
    
    if (NotyClass) {
      new NotyClass({
        type: 'error',
        text: message,
        timeout: timeout,
        layout: 'bottomLeft',
        theme: 'mint'
      }).show();
    } else {
      this.showFallbackNotification(message, 'error', timeout);
    }
  },

  /**
   * Show loading notification with spinner (non-auto-closing)
   * @param {string} message - Loading message
   * @returns {Object|null} Noty instance for later updating/closing
   */
  showLoadingNotification(message) {
    const NotyClass = (typeof Noty !== 'undefined') ? Noty : 
                      (typeof window.Noty !== 'undefined') ? window.Noty : null;
    
    if (NotyClass) {
      return new NotyClass({
        type: 'info',
        text: `<i class="fa fa-spinner fa-spin"></i> ${message}`,
        timeout: false,
        closeWith: [],
        layout: 'bottomLeft',
        theme: 'mint'
      }).show();
    } else {
      // Fallback - show info notification that auto-closes
      this.showFallbackNotification(`⏳ ${message}`, 'info', false);
      return null;
    }
  },

  /**
   * Update/close a loading notification
   * @param {Object} notyInstance - Noty instance from showLoadingNotification
   * @param {string} message - Completion message
   * @param {string} type - Result type (success, error, warning)
   */
  updateLoadingNotification(notyInstance, message, type = 'success') {
    if (notyInstance && typeof notyInstance.close === 'function') {
      notyInstance.close();
    }
    
    // Show completion notification
    this.showNotification(message, type);
  },

  /**
   * Show plugin/theme toggle notification
   * @param {string} itemName - Plugin or theme name
   * @param {string} itemType - 'Plugin' or 'Theme'
   * @param {boolean} isEnabled - Whether item was enabled or disabled
   * @param {boolean} isSuccess - Whether the operation was successful
   */
  showToggleNotification(itemName, itemType, isEnabled, isSuccess = true) {
    const action = isEnabled ? 'enabled' : 'disabled';
    const message = isSuccess 
      ? `${itemType} <strong>${this.escapeHtml(itemName)}</strong> ${action}` 
      : `Failed to ${action.slice(0, -1)} ${itemType.toLowerCase()} <strong>${this.escapeHtml(itemName)}</strong>`;
    
    const type = isSuccess ? 'success' : 'error';
    this.showNotification(message, type, 4000);
  },

  /**
   * Fallback notification system for non-VRCX environments
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   * @param {number|false} timeout - Timeout or false for no auto-close
   */
  showFallbackNotification(message, type = 'info', timeout = 4000) {
    // Limit concurrent notifications to prevent DOM bloat
    const existingNotifications = document.querySelectorAll('[data-vrcx-notification]');
    if (existingNotifications.length >= 3) {
      existingNotifications[0].remove();
    }

    const notification = document.createElement('div');
    notification.setAttribute('data-vrcx-notification', 'true');
    
    const bgColor = type === 'error' ? 'var(--red-2, #f56c6c)' : 
                   type === 'success' ? 'var(--green-2, #67c23a)' : 
                   type === 'warning' ? 'var(--yellow-2, #e6a23c)' :
                   'var(--accent-1, #66b1ff)';
    
    notification.style.cssText = `
      position: fixed;
      top: ${24 + (existingNotifications.length * 80)}px;
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
    
    // Add slide-in animation (only once)
    if (!document.getElementById('vrcx-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'vrcx-notification-styles';
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
    }
    
    notification.innerHTML = message; // Use innerHTML to support HTML content
    document.body.appendChild(notification);
    
    // Auto-remove setup
    if (timeout !== false) {
      const cleanup = () => {
        if (notification.parentNode) {
          notification.style.opacity = '0';
          notification.style.transform = 'translateX(100%) scale(0.9)';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
            
            // Reposition remaining notifications
            const remainingNotifications = document.querySelectorAll('[data-vrcx-notification]');
            remainingNotifications.forEach((notif, index) => {
              notif.style.top = `${24 + (index * 80)}px`;
            });
          }, 300);
        }
      };
      
      const timeoutId = setTimeout(cleanup, timeout);
      
      // Allow manual dismissal
      notification.addEventListener('click', () => {
        clearTimeout(timeoutId);
        cleanup();
      });
      
      notification.style.cursor = 'pointer';
      notification.title = 'Click to dismiss';
    }
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
