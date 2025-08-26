// ==Module==
// @name         VRCX-Extended Configuration
// @description  Configuration constants and settings for VRCX-Extended
// ==Module==

/**
 * Configuration module for VRCX-Extended
 * Contains all constants, keys, and configuration settings
 */
window.VRCXExtended = window.VRCXExtended || {};

window.VRCXExtended.Config = {
  // Storage keys
  KEYS: {
    PLUGINS: 'vrcx_mm_plugins',
    THEMES: 'vrcx_mm_themes',
    SETTINGS: 'vrcx_extended_settings',
  },

  // Default settings
  DEFAULT_SETTINGS: {
    disableCache: false,
    debugMode: false,
    localDebugPaths: {
      modules: 'file://vrcx/extended/modules',
      html: 'file://vrcx/extended/html', 
      stylesheets: 'file://vrcx/extended/stylesheet',
      store: 'file://vrcx/extended/store'
    }
  },

  // UI Constants
  UI: {
    POPUP_NAME: 'VRCX-Extended',
    POPUP_FEATURES: 'width=1200,height=800',
    MENU_ITEM_ID: 'vrcx-mods-menu-item',
    DEFAULT_THEME: 'material3'
  },

  // CodeMirror Configuration
  EDITOR: {
    OPTIONS: {
      lineNumbers: true,
      styleActiveLine: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      theme: 'default'
    },
    JAVASCRIPT_MODE: 'javascript',
    CSS_MODE: 'css'
  },

  // External Dependencies
  EXTERNAL: {
    ELEMENT_UI_CSS: 'https://unpkg.com/element-ui/lib/theme-chalk/index.css',
    CODEMIRROR: {
      CSS: 'https://unpkg.com/codemirror@5.65.16/lib/codemirror.css',
      JS: 'https://unpkg.com/codemirror@5.65.16/lib/codemirror.js',
      CSS_MODE: 'https://unpkg.com/codemirror@5.65.16/mode/css/css.js',
      JS_MODE: 'https://unpkg.com/codemirror@5.65.16/mode/javascript/javascript.js',
      CLOSEBRACKETS: 'https://unpkg.com/codemirror@5.65.16/addon/edit/closebrackets.js',
      CLOSETAG: 'https://unpkg.com/codemirror@5.65.16/addon/edit/closetag.js',
      MATCHBRACKETS: 'https://unpkg.com/codemirror@5.65.16/addon/edit/matchbrackets.js',
      ACTIVELINE: 'https://unpkg.com/codemirror@5.65.16/addon/selection/active-line.js'
    }
  },

  // Store Configuration
  STORE: {
    // GitHub repository for store data
    GITHUB: {
      BASE_URL: 'https://raw.githubusercontent.com/DexyThePuppy/VRCX-Extended/main',
      PLUGINS: 'https://raw.githubusercontent.com/DexyThePuppy/VRCX-Extended/main/store/plugins/plugins.json',
      THEMES: 'https://raw.githubusercontent.com/DexyThePuppy/VRCX-Extended/main/store/themes/themes.json'
    },
    
    // Local debug paths for development
    LOCAL: {
      PLUGINS: 'file://vrcx/extended/store/plugins/plugins.json',
      THEMES: 'file://vrcx/extended/store/themes/themes.json'
    },
    
    // Cache settings
    CACHE: {
      DURATION: 300000, // 5 minutes in milliseconds
      KEY_PREFIX: 'vrcx_store_'
    }
  },

  // Default templates
  TEMPLATES: {
    PLUGIN: {
      code: '// Your JavaScript code here\nconsole.log("Hello from VRCX Plugin!");',
      description: 'Custom JavaScript plugin for VRCX'
    },
    THEME: {
      code: '/* Your CSS code here */\n.example {\n  color: #ff6b35;\n}',
      description: 'Custom CSS theme for VRCX'
    }
  },

  // Settings management
  /**
   * Get current settings with defaults
   * @returns {Object} Current settings
   */
  getSettings() {
    try {
      const stored = localStorage.getItem(this.KEYS.SETTINGS);
      const settings = stored ? JSON.parse(stored) : {};
      return { ...this.DEFAULT_SETTINGS, ...settings };
    } catch (error) {
      const utils = window.VRCXExtended?.Utils;
      if (utils?.safeConsoleLog) {
        utils.safeConsoleLog('warn', 'Failed to load settings, using defaults:', error);
      } else {
        console.warn('Failed to load settings, using defaults:', error);
      }
      return { ...this.DEFAULT_SETTINGS };
    }
  },

  /**
   * Update settings
   * @param {Object} newSettings - Settings to update
   */
  updateSettings(newSettings) {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(updatedSettings));
      const utils = window.VRCXExtended?.Utils;
      if (utils?.safeConsoleLog) {
        utils.safeConsoleLog('log', '✅ Settings updated:', updatedSettings);
      } else {
        console.log('✅ Settings updated:', updatedSettings);
      }
    } catch (error) {
      const utils = window.VRCXExtended?.Utils;
      if (utils?.safeConsoleLog) {
        utils.safeConsoleLog('error', 'Failed to update settings:', error);
      } else {
        console.error('Failed to update settings:', error);
      }
    }
  },

  /**
   * Get a specific setting value
   * @param {string} key - Setting key
   * @returns {*} Setting value
   */
  getSetting(key) {
    const settings = this.getSettings();
    return settings[key];
  },

  /**
   * Set a specific setting value
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   */
  setSetting(key, value) {
    this.updateSettings({ [key]: value });
  },

  /**
   * Get store URL based on debug mode setting
   * @param {string} type - 'plugins' or 'themes'
   * @returns {string} URL for the store data
   */
  getStoreUrl(type) {
    const settings = this.getSettings();
    const isDebugMode = settings.debugMode || false;
    
    if (isDebugMode) {
      return type === 'plugins' ? this.STORE.LOCAL.PLUGINS : this.STORE.LOCAL.THEMES;
    } else {
      return type === 'plugins' ? this.STORE.GITHUB.PLUGINS : this.STORE.GITHUB.THEMES;
    }
  },



  /**
   * Get store cache key for a specific type
   * @param {string} type - 'plugins' or 'themes'
   * @returns {string} Cache key
   */
  getStoreCacheKey(type) {
    return this.STORE.CACHE.KEY_PREFIX + type;
  },

  /**
   * Check if store cache is valid
   * @param {string} type - 'plugins' or 'themes'
   * @returns {boolean} True if cache is valid
   */
  isStoreCacheValid(type) {
    const settings = this.getSettings();
    if (settings.disableCache) return false;
    
    const cacheKey = this.getStoreCacheKey(type);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return false;
    
    try {
      const data = JSON.parse(cached);
      const now = Date.now();
      return data.timestamp && (now - data.timestamp) < this.STORE.CACHE.DURATION;
    } catch {
      return false;
    }
  },

  /**
   * Store data in cache
   * @param {string} type - 'plugins' or 'themes'
   * @param {Array} data - Data to cache
   */
  setStoreCache(type, data) {
    const settings = this.getSettings();
    if (settings.disableCache) return;
    
    const cacheKey = this.getStoreCacheKey(type);
    const cacheData = {
      data: data,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      const utils = window.VRCXExtended?.Utils;
      if (utils?.safeConsoleLog) {
        utils.safeConsoleLog('warn', 'Failed to cache store data:', error);
      } else {
        console.warn('Failed to cache store data:', error);
      }
    }
  },

  /**
   * Get data from cache
   * @param {string} type - 'plugins' or 'themes'
   * @returns {Array|null} Cached data or null if not found/invalid
   */
  getStoreCache(type) {
    const settings = this.getSettings();
    if (settings.disableCache) return null;
    
    const cacheKey = this.getStoreCacheKey(type);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    try {
      const data = JSON.parse(cached);
      return data.data || null;
    } catch {
      return null;
    }
  }
};
