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
   */
  injectThemes(themes) {
    this.removeInjected('theme');
    themes.filter(theme => theme.enabled).forEach(theme => {
      const style = document.createElement('style');
      style.setAttribute('data-vrcxmods', 'theme');
      style.id = `vrcx-theme-${theme.id}`;
      style.textContent = theme.code || '';
      document.head.appendChild(style);
    });
  },

  /**
   * Inject enabled plugins into the document
   * @param {Array} plugins - Array of plugin objects
   */
  injectPlugins(plugins) {
    this.removeInjected('plugin');
    plugins.filter(plugin => plugin.enabled).forEach(plugin => {
      const script = document.createElement('script');
      script.setAttribute('data-vrcxmods', 'plugin');
      script.id = `vrcx-plugin-${plugin.id}`;
      script.textContent = `(function(){try{\n${plugin.code || ''}\n}catch(e){console.error('VRCX Plugin Error (${plugin.name})', e);}})();`;
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
    
    this.injectThemes(themes);
    this.injectPlugins(plugins);
  },

  /**
   * Refresh only themes
   */
  refreshThemes() {
    const config = window.VRCXExtended.Config;
    const utils = window.VRCXExtended.Utils;
    
    const themes = utils.readJSON(config.KEYS.THEMES, []);
    this.injectThemes(themes);
  },

  /**
   * Refresh only plugins
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
