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
    
    // Inject local themes
    themes.filter(theme => theme.enabled).forEach(theme => {
      const style = document.createElement('style');
      style.setAttribute('data-vrcxmods', 'theme');
      style.id = `vrcx-theme-${theme.id}`;
      style.textContent = theme.code || '';
      document.head.appendChild(style);
      injectedThemes.push(theme.name);
    });
    
    // Inject online themes
    const onlineThemes = window.VRCXExtended.Utils.readJSON(window.VRCXExtended.Config.KEYS.ONLINE_THEMES, []);
    this.injectOnlineThemes(onlineThemes, injectedThemes);
    
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
    
    // Inject local plugins
    plugins.filter(plugin => plugin.enabled).forEach(plugin => {
      const script = document.createElement('script');
      script.setAttribute('data-vrcxmods', 'plugin');
      script.id = `vrcx-plugin-${plugin.id}`;
      script.textContent = `(function(){try{\n${plugin.code || ''}\n}catch(e){console.error('VRCX Plugin Error (${plugin.name})', e);}})();`;
      document.head.appendChild(script);
      injectedPlugins.push(plugin.name);
    });
    
    // Inject online plugins
    const onlinePlugins = window.VRCXExtended.Utils.readJSON(window.VRCXExtended.Config.KEYS.ONLINE_PLUGINS, []);
    this.injectOnlinePlugins(onlinePlugins, injectedPlugins);
    
    return injectedPlugins;
  },

  /**
   * Inject online themes from URLs
   * @param {Array} themeUrls - Array of theme URLs
   * @param {Array} injectedThemes - Array to append injected theme names to
   */
  injectOnlineThemes(themeUrls, injectedThemes) {
    if (!Array.isArray(themeUrls) || themeUrls.length === 0) return;
    
    themeUrls.forEach((url, index) => {
      if (!url || typeof url !== 'string') return;
      
      // Check for theme prefix (@light, @dark)
      const isDarkTheme = url.startsWith('@dark ');
      const isLightTheme = url.startsWith('@light ');
      const actualUrl = isDarkTheme || isLightTheme ? url.substring(url.indexOf(' ') + 1) : url;
      
      // Skip if theme doesn't match current Discord theme
      if (isDarkTheme && !document.body.classList.contains('theme-dark')) return;
      if (isLightTheme && document.body.classList.contains('theme-dark')) return;
      
      const link = document.createElement('link');
      link.setAttribute('data-vrcxmods', 'theme');
      link.id = `vrcx-online-theme-${index}`;
      link.rel = 'stylesheet';
      link.href = actualUrl;
      link.onload = () => {
        console.log('✅ Online theme loaded:', actualUrl);
        injectedThemes.push(`Online Theme ${index + 1}`);
      };
      link.onerror = () => {
        console.error('❌ Failed to load online theme:', actualUrl);
      };
      document.head.appendChild(link);
    });
  },

  /**
   * Inject online plugins from URLs
   * @param {Array} pluginUrls - Array of plugin URLs
   * @param {Array} injectedPlugins - Array to append injected plugin names to
   */
  injectOnlinePlugins(pluginUrls, injectedPlugins) {
    if (!Array.isArray(pluginUrls) || pluginUrls.length === 0) return;
    
    pluginUrls.forEach((url, index) => {
      if (!url || typeof url !== 'string') return;
      
      // Check for theme prefix (@light, @dark)
      const isDarkTheme = url.startsWith('@dark ');
      const isLightTheme = url.startsWith('@light ');
      const actualUrl = isDarkTheme || isLightTheme ? url.substring(url.indexOf(' ') + 1) : url;
      
      // Skip if theme doesn't match current Discord theme
      if (isDarkTheme && !document.body.classList.contains('theme-dark')) return;
      if (isLightTheme && document.body.classList.contains('theme-dark')) return;
      
      const script = document.createElement('script');
      script.setAttribute('data-vrcxmods', 'plugin');
      script.id = `vrcx-online-plugin-${index}`;
      script.src = actualUrl;
      script.onload = () => {
        console.log('✅ Online plugin loaded:', actualUrl);
        injectedPlugins.push(`Online Plugin ${index + 1}`);
      };
      script.onerror = () => {
        console.error('❌ Failed to load online plugin:', actualUrl);
      };
      document.head.appendChild(script);
    });
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
   * Refresh themes only
   */
  refreshThemes() {
    const config = window.VRCXExtended.Config;
    const utils = window.VRCXExtended.Utils;
    const themes = utils.readJSON(config.KEYS.THEMES, []);
    this.injectThemes(themes);
  },

  /**
   * Refresh plugins only
   */
  refreshPlugins() {
    const config = window.VRCXExtended.Config;
    const utils = window.VRCXExtended.Utils;
    const plugins = utils.readJSON(config.KEYS.PLUGINS, []);
    this.injectPlugins(plugins);
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
