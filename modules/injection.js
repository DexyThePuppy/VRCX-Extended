// ==Module==
// @name         VRCX-Extended Content Injection System
// @description  Handles theme and plugin injection into VRCX
// ==Module==

/**
 * Content injection system for VRCX-Extended
 * Manages theme and plugin injection/removal
 */
window.VRCXExtended = window.VRCXExtended || {};

window.VRCXExtended.Injection = {
  /**
   * Remove all injected content of a specific type
   * @param {string} typePrefix - Type prefix ('theme' or 'plugin')
   */
  removeInjected(typePrefix) {
    document.querySelectorAll(`[data-vrcxmods='${typePrefix}']`).forEach((node) => node.remove());
  },

  /**
   * Inject enabled themes into the document
   * @param {Array} themes - Array of theme objects
   * @returns {Array} Array of successfully injected theme names
   */
  injectThemes(themes) {
    this.removeInjected('theme');
    const injectedThemes = [];
    
    themes.filter(theme => theme.enabled).forEach(theme => {
      const style = document.createElement('style');
      style.setAttribute('data-vrcxmods', 'theme');
      style.id = `vrcx-theme-${theme.id}`;
      style.textContent = theme.code || '';
      document.head.appendChild(style);
      injectedThemes.push(theme.name);
    });
    
    return injectedThemes;
  },

  /**
   * Inject enabled plugins into the document
   * @param {Array} plugins - Array of plugin objects
   * @returns {Array} Array of successfully injected plugin names
   */
  injectPlugins(plugins) {
    this.removeInjected('plugin');
    const injectedPlugins = [];
    
    plugins.filter(plugin => plugin.enabled).forEach(plugin => {
      const script = document.createElement('script');
      script.setAttribute('data-vrcxmods', 'plugin');
      script.id = `vrcx-plugin-${plugin.id}`;
      script.textContent = `(function(){try{\n${plugin.code || ''}\n}catch(e){console.error('VRCX Plugin Error (${plugin.name})', e);}})();`;
      document.head.appendChild(script);
      injectedPlugins.push(plugin.name);
    });
    
    return injectedPlugins;
  },

  /**
   * Refresh themes only
   */
  refreshThemes() {
    const config = window.VRCXExtended.Config;
    const utils = window.VRCXExtended.Utils;
    
    const themes = utils.readJSON(config.KEYS.THEMES, []);
    const injectedThemes = this.injectThemes(themes);
    
    // Show notification for theme refresh
    if (injectedThemes.length > 0) {
      this.showInjectionNotifications(injectedThemes, []);
    }
    
    return injectedThemes;
  },

  /**
   * Refresh plugins only
   */
  refreshPlugins() {
    const config = window.VRCXExtended.Config;
    const utils = window.VRCXExtended.Utils;
    
    const plugins = utils.readJSON(config.KEYS.PLUGINS, []);
    const injectedPlugins = this.injectPlugins(plugins);
    
    // Show notification for plugin refresh
    if (injectedPlugins.length > 0) {
      this.showInjectionNotifications([], injectedPlugins);
    }
    
    return injectedPlugins;
  },

  /**
   * Refresh all injected content (themes and plugins)
   */
  refreshAll() {
    const config = window.VRCXExtended.Config;
    const utils = window.VRCXExtended.Utils;
    
    const plugins = utils.readJSON(config.KEYS.PLUGINS, []);
    const themes = utils.readJSON(config.KEYS.THEMES, []);
    
    const injectedThemes = this.injectThemes(themes);
    const injectedPlugins = this.injectPlugins(plugins);
    
    // Show startup injection notifications
    this.showInjectionNotifications(injectedThemes, injectedPlugins);
  },

  /**
   * Show notifications for successfully injected content
   * @param {Array} injectedThemes - Array of injected theme names
   * @param {Array} injectedPlugins - Array of injected plugin names
   */
  showInjectionNotifications(injectedThemes, injectedPlugins) {
    // Only show notifications if there's content to report
    if (injectedThemes.length === 0 && injectedPlugins.length === 0) {
      return;
    }
    
    // Build notification message
    let message = '';
    if (injectedThemes.length > 0) {
      message += 'Themes loaded: <strong>' + injectedThemes.join(', ') + '</strong>';
    }
    if (injectedPlugins.length > 0) {
      if (message) message += '<br>';
      message += 'Plugins loaded: <strong>' + injectedPlugins.join(', ') + '</strong>';
    }
    
    // Use Noty directly
    if (typeof Noty !== 'undefined') {
      new Noty({
        type: 'success',
        text: message,
        timeout: 5000
      }).show();
    }
  },

  /**
   * Initialize the injection system and expose API
   */
  init() {
    // Expose refreshers for other scripts
    window.$app = window.$app || {};
    window.$app.refreshVrcxThemes = () => this.refreshThemes();
    window.$app.refreshVrcxPlugins = () => this.refreshPlugins();
    window.$app.refreshVrcxAll = () => this.refreshAll();

    // Initial injection
    this.refreshAll();
  }
};
