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
      console.warn('Failed to load settings, using defaults:', error);
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
      console.log('✅ Settings updated:', updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
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
  }
};
