// ==Module==
// @name         VRCX-Extended Popup Window Manager
// @description  Manages the popup window and its external HTML/CSS content for VRCX-Extended
// ==Module==

/**
 * Popup window management for VRCX-Extended
 * Handles window creation and external resource loading
 */
window.VRCXExtended = window.VRCXExtended || {};

window.VRCXExtended.Popup = {
  // Cache for external resources
  externalResources: null,

  /**
   * Open the manager window
   */
  openManagerWindow() {
    const config = window.VRCXExtended.Config;
    // Clear cached resources to force reload
    this.externalResources = null;
    window.open('about:blank', config.UI.POPUP_NAME, config.UI.POPUP_FEATURES);
    setTimeout(() => this.buildManagerWindow(), 100);
  },

  /**
   * Build the manager window with external HTML content
   */
  async buildManagerWindow() {
    const config = window.VRCXExtended.Config;
    const win = window.open('', config.UI.POPUP_NAME);
    if (!win) return;

    try {
      // Force reload external resources to get latest HTML
      const utils = window.VRCXExtended.Utils;
      utils.safeConsoleLog('log', '📋 Loading external resources for popup...');
      this.externalResources = await window.VRCXExtended.ModuleSystem.loadExternalResources();

      const html = this.processHTML(this.externalResources.html, this.externalResources.css);
      win.document.write(html);
      win.document.close();
    } catch (error) {
      const utils = window.VRCXExtended.Utils;
      utils.safeConsoleLog('error', '❌ Failed to build popup window:', error);
      // Fallback to basic HTML
      const fallbackHTML = this.generateFallbackHTML();
      win.document.write(fallbackHTML);
      win.document.close();
    }
  },

  /**
   * Process HTML template with dynamic values
   * @param {string} htmlTemplate - HTML template content
   * @param {string} cssContent - CSS content
   * @returns {string} Processed HTML
   */
  processHTML(htmlTemplate, cssContent) {
    const config = window.VRCXExtended.Config;
    
    // Replace placeholders in HTML template
    return htmlTemplate
      .replace('{{ELEMENT_UI_CSS}}', config.EXTERNAL.ELEMENT_UI_CSS)
      .replace('{{CODEMIRROR_CSS}}', config.EXTERNAL.CODEMIRROR.CSS)
      .replace('{{CODEMIRROR_JS}}', config.EXTERNAL.CODEMIRROR.JS)
      .replace('{{CODEMIRROR_CSS_MODE}}', config.EXTERNAL.CODEMIRROR.CSS_MODE)
      .replace('{{CODEMIRROR_JS_MODE}}', config.EXTERNAL.CODEMIRROR.JS_MODE)
      .replace('{{CODEMIRROR_CLOSEBRACKETS}}', config.EXTERNAL.CODEMIRROR.CLOSEBRACKETS)
      .replace('{{CODEMIRROR_CLOSETAG}}', config.EXTERNAL.CODEMIRROR.CLOSETAG)
      .replace('{{CODEMIRROR_MATCHBRACKETS}}', config.EXTERNAL.CODEMIRROR.MATCHBRACKETS)
      .replace('{{CODEMIRROR_ACTIVELINE}}', config.EXTERNAL.CODEMIRROR.ACTIVELINE)
      .replace('{{VRCX_EXTENDED_CSS}}', 'data:text/css;base64,' + btoa(cssContent))
      .replace('{{DEFAULT_THEME}}', config.UI.DEFAULT_THEME)
      .replace('{{VRCX_EXTENDED_SCRIPT}}', this.generateJavaScript());
  },

  /**
   * Generate fallback HTML when external resources fail
   * @returns {string} Basic HTML content
   */
  generateFallbackHTML() {
    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>VRCX-Extended</title>
  <style>
    body { 
      font-family: system-ui, sans-serif; 
      padding: 20px; 
      background: #1e1e1e; 
      color: #fff; 
    }
    .error { 
      color: #ff6b6b; 
      border: 1px solid #ff6b6b; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0; 
    }
  </style>
</head>
<body>
  <h1>VRCX-Extended</h1>
  <div class="error">
    <h3>⚠️ Failed to Load External Resources</h3>
    <p>Could not load the VRCX-Extended interface. This may be due to:</p>
    <ul>
      <li>Network connectivity issues</li>
      <li>GitHub repository access problems</li>
      <li>CORS restrictions</li>
    </ul>
    <p>Please check your internet connection and try refreshing the page.</p>
  </div>
</body>
</html>`;
  },

  /**
   * Generate JavaScript for the popup window
   * @returns {string} JavaScript content
   */
  generateJavaScript() {
    const config = window.VRCXExtended?.Config || {};
    
    return `
(function(){
  'use strict';

  // Storage interop (uses opener's localStorage)
  const KEYS = {
    PLUGINS: 'vrcx_mm_plugins',
    THEMES: 'vrcx_mm_themes',
    SETTINGS: 'vrcx_extended_settings'
  };

  // Create the popup manager
  window.VRCXExtended = window.VRCXExtended || {};
  
  // Add safeConsoleLog function for popup window
  window.VRCXExtended.Utils = window.VRCXExtended.Utils || {};
  window.VRCXExtended.Utils.safeConsoleLog = function(level, ...args) {
    // Create a prefix to identify the source
    const prefix = '[VRCX-Extended Popup]';
    
    // Try to forward to main window
    if (window.opener && window.opener.console && window.opener !== window) {
      try {
        const openerMethod = window.opener.console[level] || window.opener.console.log;
        openerMethod.call(window.opener.console, prefix, ...args);
      } catch (e) {
        // If forwarding fails, log locally
        const originalMethod = console[level] || console.log;
        originalMethod.apply(console, args);
      }
    } else {
      // Log locally if no opener
      const originalMethod = console[level] || console.log;
      originalMethod.apply(console, args);
    }
  };
  
  window.VRCXExtended.PopupManager = {
    getSection() { 
      return document.querySelector('.sidebar .menu-item.active')?.dataset.section || 'plugins'; 
    },
    
    getStoreSubSection() {
      return document.querySelector('.store-subtabs .subtab.active')?.dataset.subsection || 'store-plugins';
    },
    
    setSection(sec) {
      document.querySelectorAll('.sidebar .menu-item').forEach(mi => 
        mi.classList.toggle('active', mi.dataset.section === sec)
      );
      
      const titles = {
        'plugins': 'Plugins',
        'themes': 'Themes',
        'store': 'Store',
        'settings': 'Settings'
      };
      document.getElementById('sectionTitle').textContent = titles[sec] || 'Unknown';
      
      // Show/hide create button based on section
      const createBtn = document.getElementById('createBtn');
      createBtn.style.display = (sec === 'plugins' || sec === 'themes') ? 'inline-flex' : 'none';
      
      // Show/hide store subtabs
      const storeSubtabs = document.querySelector('.store-subtabs');
      if (storeSubtabs) {
        storeSubtabs.style.display = sec === 'store' ? 'flex' : 'none';
      }
      
      this.renderContent(sec);
    },

    renderContent(section) {
      const list = document.getElementById('list');
      list.innerHTML = '';
      
      switch(section) {
        case 'plugins':
        case 'themes':
          this.renderList(section);
          break;
        case 'store':
          this.renderStore();
          break;
        case 'settings':
          this.renderSettings();
          break;
        default:
          list.innerHTML = '<div class="muted">Unknown section</div>';
      }
      
      // Update footer count after rendering content
      this.updateFooterCount();
    },

    renderList(section) {
      const list = document.getElementById('list');
      const storageKey = section === 'plugins' ? KEYS.PLUGINS : KEYS.THEMES;
      const data = this.readJSON(storageKey, []);
      
      // Use simplified UI rendering
      this.simpleRenderList(data, section, list);
    },

    renderSettings() {
      const list = document.getElementById('list');
      this.simpleRenderSettings(list);
    },

    simpleRenderList(data, section, listElement) {
      listElement.innerHTML = '';
      const sortedData = data.slice().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

      if (!sortedData.length) {
        const empty = document.createElement('div');
        empty.className = 'muted';
        empty.textContent = 'No items yet. Click Create to add your first one.';
        listElement.appendChild(empty);
        return;
      }

      sortedData.forEach(item => {
        const card = this.createSimpleCard(item, section);
        listElement.appendChild(card);
      });
    },

    createSimpleCard(item, section) {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.border = '1px solid var(--surface-2, #3c3836)';
      card.style.borderRadius = '8px';
      card.style.padding = '16px';
      card.style.marginBottom = '12px';
      card.style.background = 'var(--surface-0, #282828)';
      card.style.transition = 'all 0.2s';
      card.style.cursor = 'pointer';
      
      // Card content container
      const contentContainer = document.createElement('div');
      contentContainer.style.display = 'flex';
      contentContainer.style.flexDirection = 'column';
      contentContainer.style.gap = '12px';
      
      // 1. Title - Actions (Header)
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.marginBottom = '8px';
      
      const title = document.createElement('h3');
      title.textContent = item.name || '(untitled)';
      title.style.margin = '0';
      title.style.color = 'var(--text-0, #ebdbb2)';
      title.style.fontSize = '16px';
      title.style.fontWeight = '600';
      
      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.alignItems = 'center';
      actions.style.gap = '8px';
      
      const deleteIcon = document.createElement('button');
      deleteIcon.className = 'btn';
      deleteIcon.innerHTML = '<i class="el-icon-delete"></i>';
      deleteIcon.title = 'Delete';
      deleteIcon.style.padding = '4px 8px';
      deleteIcon.style.backgroundColor = '#3a3a3a';
      deleteIcon.style.borderColor = '#4a4a4a';
      deleteIcon.style.color = '#ffffff';
      
      deleteIcon.addEventListener('mouseenter', () => {
        deleteIcon.style.backgroundColor = '#ff453a';
        deleteIcon.style.borderColor = '#ff453a';
      });
      
      deleteIcon.addEventListener('mouseleave', () => {
        deleteIcon.style.backgroundColor = '#3a3a3a';
        deleteIcon.style.borderColor = '#4a4a4a';
      });
      
      deleteIcon.addEventListener('click', (e) => {
        window.VRCXExtended.Utils.safeConsoleLog('log', '🗑️ [Popup] Deleting item:', item.name, 'from section:', section);
        const storageKey = section === 'plugins' ? KEYS.PLUGINS : KEYS.THEMES;
        const allItems = this.readJSON(storageKey, []);
        window.VRCXExtended.Utils.safeConsoleLog('log', '🗑️ [Popup] Current items before deletion:', allItems.length);
        const index = allItems.findIndex(x => x.id === item.id);
        window.VRCXExtended.Utils.safeConsoleLog('log', '🗑️ [Popup] Found item at index:', index);
        
        if (index !== -1) {
          allItems.splice(index, 1);
          this.writeJSON(storageKey, allItems);
          window.VRCXExtended.Utils.safeConsoleLog('log', '🗑️ [Popup] Item removed from storage, new count:', allItems.length);
          
          // Verify deletion worked
          const verifyItems = this.readJSON(storageKey, []);
          const stillExists = verifyItems.findIndex(x => x.id === item.id) !== -1;
          if (stillExists) {
            window.VRCXExtended.Utils.safeConsoleLog('error', '❌ [Popup] Item still exists after deletion!');
          } else {
            window.VRCXExtended.Utils.safeConsoleLog('log', '✅ [Popup] Item successfully deleted from storage');
          }
          
          // Remove the card element from the DOM immediately
          const cardElement = e.target.closest('.card');
          if (cardElement) {
            cardElement.remove();
          }
          
          // Refresh the current section
          this.renderCurrentSection();
          
          // Refresh the opener window
          let refreshSuccess = true;
          try {
            if (section === 'plugins' && window.opener?.$app?.refreshVrcxPlugins) {
              window.opener.$app.refreshVrcxPlugins();
            }
            if (section === 'themes' && window.opener?.$app?.refreshVrcxThemes) {
              window.opener.$app.refreshVrcxThemes();
            }
          } catch (refreshError) {
            window.VRCXExtended.Utils.safeConsoleLog('warn', 'Failed to refresh after deletion:', refreshError);
            refreshSuccess = false;
          }
          
          // Show deletion notification
          if (window.opener?.VRCXExtended?.Utils?.showNotification) {
            const itemType = section === 'plugins' ? 'Plugin' : 'Theme';
            const itemName = item.name || '(untitled)';
            const message = refreshSuccess 
              ? itemType + ' <strong>' + itemName + '</strong> deleted successfully'
              : itemType + ' <strong>' + itemName + '</strong> deleted (refresh may be needed)';
            window.opener.VRCXExtended.Utils.showNotification(message, refreshSuccess ? 'success' : 'warning');
          }
        }
      });

      const settingsIcon = document.createElement('button');
      settingsIcon.className = 'btn';
      settingsIcon.innerHTML = '<i class="el-icon-setting"></i>';
      settingsIcon.title = 'Edit';
      settingsIcon.style.padding = '4px 8px';
      settingsIcon.style.backgroundColor = '#3a3a3a';
      settingsIcon.style.borderColor = '#4a4a4a';
      settingsIcon.style.color = '#ffffff';
      
      settingsIcon.addEventListener('mouseenter', () => {
        settingsIcon.style.backgroundColor = '#4a4a4a';
        settingsIcon.style.borderColor = '#5a5a5a';
      });
      
      settingsIcon.addEventListener('mouseleave', () => {
        settingsIcon.style.backgroundColor = '#3a3a3a';
        settingsIcon.style.borderColor = '#4a4a4a';
      });
      
      settingsIcon.addEventListener('click', (e) => {
        this.openSimpleEditor(item);
      });

      // Toggle switch (moved to last place)
      const label = document.createElement('label');
      label.className = 'switch';
      label.style.margin = '0';
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!item.enabled;
      const slider = document.createElement('span');
      slider.className = 'slider';
      slider.style.background = checkbox.checked ? 'var(--accent-1, #ff6b35)' : '#4a4a4a';
      slider.style.borderColor = checkbox.checked ? 'var(--accent-1, #ff6b35)' : '#4a4a4a';
      label.appendChild(checkbox);
      label.appendChild(slider);

      checkbox.addEventListener('change', (e) => {
        const storageKey = section === 'plugins' ? KEYS.PLUGINS : KEYS.THEMES;
        const allItems = this.readJSON(storageKey, []);
        const index = allItems.findIndex(x => x.id === item.id);
        
        if (index !== -1) {
          allItems[index].enabled = checkbox.checked;
          allItems[index].updatedAt = this.nowIso();
          this.writeJSON(storageKey, allItems);
          
          // Update toggle styling
          slider.style.background = checkbox.checked ? 'var(--accent-1, #ff6b35)' : '#4a4a4a';
          slider.style.borderColor = checkbox.checked ? 'var(--accent-1, #ff6b35)' : '#4a4a4a';
          
          // Show notification for toggle action
          if (window.opener?.VRCXExtended?.Utils?.showNotification) {
            const itemType = section === 'plugins' ? 'Plugin' : 'Theme';
            const action = checkbox.checked ? 'enabled' : 'disabled';
            const itemName = item.name || '(untitled)';
            const message = itemType + ' <strong>' + itemName + '</strong> ' + action;
            window.opener.VRCXExtended.Utils.showNotification(message, 'success');
          }
          
          if (section === 'plugins' && window.opener?.$app?.refreshVrcxPlugins) {
            window.opener.$app.refreshVrcxPlugins();
          }
          if (section === 'themes' && window.opener?.$app?.refreshVrcxThemes) {
            window.opener.$app.refreshVrcxThemes();
          }
        }
      });

      actions.appendChild(deleteIcon);
      actions.appendChild(settingsIcon);
      actions.appendChild(label);
      header.appendChild(title);
      header.appendChild(actions);
      
      // 2. Thumbnail - Description (Side by side)
      const imageDescriptionContainer = document.createElement('div');
      imageDescriptionContainer.style.display = 'flex';
      imageDescriptionContainer.style.gap = '16px';
      imageDescriptionContainer.style.alignItems = 'flex-start';
      
      // Thumbnail section
      const thumbnailSection = document.createElement('div');
      thumbnailSection.style.flexShrink = '0';
      
      const thumbnail = document.createElement('img');
      thumbnail.src = item.thumbnail || 'https://picsum.photos/200';
      thumbnail.alt = item.name + ' thumbnail';
      thumbnail.style.width = '150px';
      thumbnail.style.height = '80px';
      thumbnail.style.objectFit = 'cover';
      thumbnail.style.borderRadius = '6px';
      thumbnail.style.border = '1px solid var(--surface-2, #3c3836)';
      
      thumbnailSection.appendChild(thumbnail);
      
      // Description section
      const descriptionSection = document.createElement('div');
      descriptionSection.style.flex = '1';
      
      const description = document.createElement('p');
      if (section === 'plugins') {
        description.textContent = item.description || 'Custom JavaScript plugin for VRCX';
      } else {
        description.textContent = item.description || 'Custom CSS theme for VRCX';
      }
      description.style.margin = '0';
      description.style.color = 'var(--text-1, #ebdbb2)';
      description.style.fontSize = '14px';
      description.style.lineHeight = '1.4';
      description.style.maxHeight = 'calc(1.4em * 4)'; // 4 lines max
      description.style.overflow = 'hidden';
      description.style.textOverflow = 'ellipsis';
      description.style.display = '-webkit-box';
      description.style.webkitLineClamp = '4';
      description.style.webkitBoxOrient = 'vertical';
      
      descriptionSection.appendChild(description);
      
      imageDescriptionContainer.appendChild(thumbnailSection);
      imageDescriptionContainer.appendChild(descriptionSection);
      
      // 3. Creator - Date (Footer)
      const footer = document.createElement('div');
      footer.style.display = 'flex';
      footer.style.justifyContent = 'space-between';
      footer.style.alignItems = 'center';
      footer.style.fontSize = '12px';
      footer.style.color = 'var(--text-2, #928374)';
      
      const creator = document.createElement('span');
      creator.textContent = 'by ' + (item.creator || 'Unknown');
      
      const dates = document.createElement('span');
      const updatedDate = new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString();
      dates.textContent = 'Updated: ' + updatedDate;

      footer.appendChild(creator);
      footer.appendChild(dates);
      
      contentContainer.appendChild(header);
      contentContainer.appendChild(imageDescriptionContainer);
      contentContainer.appendChild(footer);
      
      card.appendChild(contentContainer);
      
      // Add hover effect
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'var(--accent-1, #ff6b35)';
        card.style.transform = 'translateY(-2px)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = 'var(--surface-2, #3c3836)';
        card.style.transform = 'translateY(0)';
      });

      // Add click handler to show detailed modal
      card.addEventListener('click', (e) => {
        // Don't open modal if clicking on interactive elements
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL' || e.target.closest('button') || e.target.closest('input') || e.target.closest('label')) {
          return;
        }
        this.openDetailModal(item, section);
      });

      return card;
    },

    renderStore() {
      const list = document.getElementById('list');
      list.innerHTML = '';
      
      // Create store subtabs if they don't exist
      this.createStoreSubtabs();
      
      // Render the current store subsection
      const subsection = this.getStoreSubSection();
      this.renderStoreSubsection(subsection);
    },

    createStoreSubtabs() {
      // Check if subtabs already exist
      if (document.querySelector('.store-subtabs')) return;
      
      const contentHeader = document.querySelector('.content-header');
      const title = contentHeader.querySelector('.title');
      
      // Create subtabs container
      const subtabsContainer = document.createElement('div');
      subtabsContainer.className = 'store-subtabs';
      subtabsContainer.style.display = 'flex';
      subtabsContainer.style.gap = '8px';
      
      // Create subtab buttons
      const pluginsTab = document.createElement('button');
      pluginsTab.className = 'subtab active btn primary';
      pluginsTab.dataset.subsection = 'store-plugins';
      pluginsTab.textContent = 'Available Plugins';
      
      const themesTab = document.createElement('button');
      themesTab.className = 'subtab btn';
      themesTab.dataset.subsection = 'store-themes';
      themesTab.textContent = 'Available Themes';
      
      // Add click handlers
      [pluginsTab, themesTab].forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.subtab').forEach(t => {
            t.classList.remove('active', 'primary');
          });
          tab.classList.add('active');
          if (tab.classList.contains('active')) {
            tab.classList.add('primary');
          }
          this.renderStoreSubsection(tab.dataset.subsection);
        });
      });
      
      // Update active tab styles
      const updateActiveTab = () => {
        document.querySelectorAll('.subtab').forEach(tab => {
          if (tab.classList.contains('active')) {
            tab.classList.add('primary');
          } else {
            tab.classList.remove('primary');
          }
        });
      };
      
      // Initial style update
      setTimeout(updateActiveTab, 0);
      
      // Add click handlers that also update styles
      [pluginsTab, themesTab].forEach(tab => {
        const originalClick = tab.onclick;
        tab.onclick = (e) => {
          if (originalClick) originalClick(e);
          setTimeout(updateActiveTab, 0);
        };
      });
      
      subtabsContainer.appendChild(pluginsTab);
      subtabsContainer.appendChild(themesTab);
      
      // Insert after title
      title.parentNode.insertBefore(subtabsContainer, title.nextSibling);
    },

    renderStoreSubsection(subsection) {
      const list = document.getElementById('list');
      list.innerHTML = '';
      
      switch(subsection) {
        case 'store-plugins':
          this.renderStorePlugins();
          break;
        case 'store-themes':
          this.renderStoreThemes();
          break;
        default:
          list.innerHTML = '<div class="muted">Unknown store subsection</div>';
      }
    },

    async renderStorePlugins() {
      const list = document.getElementById('list');
      
      try {
        // Show loading state
        list.innerHTML = '<div class="muted">Loading plugins from store...</div>';
        
        // Use the Store module from the main window
        let plugins = [];
        if (window.opener && window.opener.VRCXExtended && window.opener.VRCXExtended.Store) {
          // Force refresh to get the latest data
          plugins = await window.opener.VRCXExtended.Store.fetchStoreData('plugins', true);
        } else {
          throw new Error('Store module not available in main window');
        }
        
        if (!plugins.length) {
          list.innerHTML = '<div class="muted">No plugins available in the store.</div>';
          return;
        }
        
        // Sort by update date
        const sortedPlugins = window.opener.VRCXExtended.Store.sortByUpdated(plugins);
        
        // Clear loading state
        list.innerHTML = '';
        
        sortedPlugins.forEach(plugin => {
          const card = this.createStoreCard(plugin, 'plugin');
          list.appendChild(card);
        });
        
        // Update footer count with actual store data
        const countElement = document.getElementById('footerCount');
        if (countElement) {
          countElement.textContent = sortedPlugins.length + ' store plugins';
        }
        
      } catch (error) {
        window.VRCXExtended.Utils.safeConsoleLog('error', 'Failed to load store plugins:', error);
        list.innerHTML = '<div class="muted">Failed to load plugins from store. Please check your connection and try again.</div>';
      }
    },

    async renderStoreThemes() {
      const list = document.getElementById('list');
      
      try {
        // Show loading state
        list.innerHTML = '<div class="muted">Loading themes from store...</div>';
        
        // Use the Store module from the main window
        let themes = [];
        if (window.opener && window.opener.VRCXExtended && window.opener.VRCXExtended.Store) {
          // Force refresh to get the latest data
          themes = await window.opener.VRCXExtended.Store.fetchStoreData('themes', true);
          

        } else {
          throw new Error('Store module not available in main window');
        }
        
        if (!themes.length) {
          list.innerHTML = '<div class="muted">No themes available in the store.</div>';
          return;
        }
        
        // Sort by update date
        const sortedThemes = window.opener.VRCXExtended.Store.sortByUpdated(themes);
        
        // Clear loading state
        list.innerHTML = '';
        
        sortedThemes.forEach(theme => {
          const card = this.createStoreCard(theme, 'theme');
          list.appendChild(card);
        });
        
        // Update footer count with actual store data
        const countElement = document.getElementById('footerCount');
        if (countElement) {
          countElement.textContent = sortedThemes.length + ' store themes';
        }
        
      } catch (error) {
        window.VRCXExtended.Utils.safeConsoleLog('error', 'Failed to load store themes:', error);
        list.innerHTML = '<div class="muted">Failed to load themes from store. Please check your connection and try again.</div>';
      }
    },

    createStoreCard(item, type) {
      const card = document.createElement('div');
      card.className = 'card store-card';
      card.style.border = '1px solid var(--surface-2, #3c3836)';
      card.style.borderRadius = '8px';
      card.style.padding = '16px';
      card.style.marginBottom = '12px';
      card.style.background = 'var(--surface-0, #282828)';
      card.style.transition = 'all 0.2s';
      card.style.cursor = 'pointer';
      
      // Card content container
      const contentContainer = document.createElement('div');
      contentContainer.style.display = 'flex';
      contentContainer.style.flexDirection = 'column';
      contentContainer.style.gap = '12px';
      
      // 1. Title - Button (Header)
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.marginBottom = '8px';
      
      const title = document.createElement('h3');
      title.textContent = item.name;
      title.style.margin = '0';
      title.style.color = 'var(--text-0, #ebdbb2)';
      title.style.fontSize = '16px';
      title.style.fontWeight = '600';
      
      // Toggle switch for install status
      const label = document.createElement('label');
      label.className = 'switch';
      label.style.margin = '0';
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      
      // Check if item is already installed
      const storageKey = type === 'plugin' ? KEYS.PLUGINS : KEYS.THEMES;
      const installedItems = this.readJSON(storageKey, []);
      const isInstalled = installedItems.some(installed => 
        installed.name === item.name && installed.creator === item.creator
      );
      checkbox.checked = isInstalled;
      
      const slider = document.createElement('span');
      slider.className = 'slider';
      slider.style.background = checkbox.checked ? 'var(--accent-1, #ff6b35)' : '#4a4a4a';
      slider.style.borderColor = checkbox.checked ? 'var(--accent-1, #ff6b35)' : '#4a4a4a';
      
      label.appendChild(checkbox);
      label.appendChild(slider);

      checkbox.addEventListener('change', (e) => {
        // Update toggle styling
        slider.style.background = checkbox.checked ? 'var(--accent-1, #ff6b35)' : '#4a4a4a';
        slider.style.borderColor = checkbox.checked ? 'var(--accent-1, #ff6b35)' : '#4a4a4a';
        
        if (checkbox.checked) {
          this.installStoreItem(item, type, checkbox);
        } else {
          this.uninstallStoreItem(item, type, checkbox);
        }
      });
      
      header.appendChild(title);
      header.appendChild(label);
      
      // 2. Image - Description (Side by side)
      const imageDescriptionContainer = document.createElement('div');
      imageDescriptionContainer.style.display = 'flex';
      imageDescriptionContainer.style.gap = '16px';
      imageDescriptionContainer.style.alignItems = 'flex-start';
      
      // Thumbnail section
      const thumbnailSection = document.createElement('div');
      thumbnailSection.style.flexShrink = '0';
      
      const thumbnail = document.createElement('img');
      thumbnail.src = item.thumbnail || 'https://picsum.photos/200';
      thumbnail.alt = item.name + ' thumbnail';
      thumbnail.style.width = '160px';
      thumbnail.style.height = '90px';
      thumbnail.style.objectFit = 'cover';
      thumbnail.style.borderRadius = '6px';
      thumbnail.style.border = '1px solid var(--surface-2, #3c3836)';
      
      // Add error handling for thumbnail loading
      thumbnail.addEventListener('error', () => {
        thumbnail.src = 'https://picsum.photos/200';
        window.VRCXExtended.Utils.safeConsoleLog('warn', 'Failed to load thumbnail for:', item.name);
      });
      
      thumbnailSection.appendChild(thumbnail);
      
      // Description section
      const descriptionSection = document.createElement('div');
      descriptionSection.style.flex = '1';
      
      const description = document.createElement('p');
      description.textContent = item.description;
      description.style.margin = '0';
      description.style.color = 'var(--text-1, #ebdbb2)';
      description.style.fontSize = '14px';
      description.style.lineHeight = '1.4';
      description.style.maxHeight = 'calc(1.4em * 4)'; // 4 lines max
      description.style.overflow = 'hidden';
      description.style.textOverflow = 'ellipsis';
      description.style.display = '-webkit-box';
      description.style.webkitLineClamp = '4';
      description.style.webkitBoxOrient = 'vertical';
      
      descriptionSection.appendChild(description);
      
      imageDescriptionContainer.appendChild(thumbnailSection);
      imageDescriptionContainer.appendChild(descriptionSection);
      
      // 3. Creator (Footer)
      const creatorSection = document.createElement('div');
      creatorSection.style.display = 'flex';
      creatorSection.style.justifyContent = 'space-between';
      creatorSection.style.alignItems = 'center';
      creatorSection.style.fontSize = '12px';
      creatorSection.style.color = 'var(--text-2, #928374)';
      
      const creator = document.createElement('span');
      creator.textContent = 'by ' + item.creator;
      
      const dates = document.createElement('span');
      const updatedDate = new Date(item.dateUpdated).toLocaleDateString();
      dates.textContent = 'Updated: ' + updatedDate;
      
      creatorSection.appendChild(creator);
      creatorSection.appendChild(dates);
      
      contentContainer.appendChild(header);
      contentContainer.appendChild(imageDescriptionContainer);
      contentContainer.appendChild(creatorSection);
      
      card.appendChild(contentContainer);
      
      // Add hover effect
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'var(--accent-1, #ff6b35)';
        card.style.transform = 'translateY(-2px)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = 'var(--surface-2, #3c3836)';
        card.style.transform = 'translateY(0)';
      });

      // Add click handler to show detailed modal
      card.addEventListener('click', (e) => {
        // Don't open modal if clicking on interactive elements
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL' || e.target.closest('button') || e.target.closest('input') || e.target.closest('label')) {
          return;
        }
        this.openDetailModal(item, type === 'plugin' ? 'store-plugin' : 'store-theme');
      });
      
      return card;
    },

    async installStoreItem(item, type, checkbox) {
      const storageKey = type === 'plugin' ? KEYS.PLUGINS : KEYS.THEMES;
      const installedItems = this.readJSON(storageKey, []);
      
      // Check if already installed
      const existingIndex = installedItems.findIndex(installed => 
        installed.name === item.name && installed.creator === item.creator
      );
      
      if (existingIndex === -1) {
        try {
          // Fetch the actual file content
          const fileContent = await this.fetchStoreFile(item, type);
          
          // Create new item from store data with actual file content
          const newItem = {
            id: this.uid(),
            name: item.name,
            description: item.description,
            creator: item.creator,
            thumbnail: item.thumbnail,
            code: fileContent,
            enabled: true,
            createdAt: this.nowIso(),
            updatedAt: this.nowIso()
          };
          
          installedItems.push(newItem);
          this.writeJSON(storageKey, installedItems);
          
          const itemType = type === 'plugin' ? 'Plugin' : 'Theme';
          const message = itemType + ' "' + item.name + '" installed successfully!';
          
          if (window.opener?.VRCXExtended?.Utils?.showNotification) {
            window.opener.VRCXExtended.Utils.showNotification(message, 'success');
          }
          
          // Refresh the opener window
          if (type === 'plugin' && window.opener?.$app?.refreshVrcxPlugins) {
            window.opener.$app.refreshVrcxPlugins();
          }
          if (type === 'theme' && window.opener?.$app?.refreshVrcxThemes) {
            window.opener.$app.refreshVrcxThemes();
          }
        } catch (error) {
          // Fallback to default code if file fetch fails
          window.VRCXExtended.Utils.safeConsoleLog('error', '❌ [Popup] File fetch failed, using fallback:', error);
          
          const newItem = {
            id: this.uid(),
            name: item.name,
            description: item.description,
            creator: item.creator,
            thumbnail: item.thumbnail,
            code: this.getDefaultCode(type, item),
            enabled: true,
            createdAt: this.nowIso(),
            updatedAt: this.nowIso()
          };
          
          installedItems.push(newItem);
          this.writeJSON(storageKey, installedItems);
          
          const itemType = type === 'plugin' ? 'Plugin' : 'Theme';
          const message = itemType + ' "' + item.name + '" installed with fallback code.';
          
          if (window.opener?.VRCXExtended?.Utils?.showNotification) {
            window.opener.VRCXExtended.Utils.showNotification(message, 'warning');
          }
        }
      } else {
        // Already installed, just update the toggle state
        checkbox.checked = true;
        slider.style.background = 'var(--accent-1, #ff6b35)';
        slider.style.borderColor = 'var(--accent-1, #ff6b35)';
      }
    },

    async fetchStoreFile(item, type) {
      // Get the base URL from the main window's config
      const config = window.opener?.VRCXExtended?.Config;
      if (!config) {
        throw new Error('Config not available');
      }
      
      const settings = config.getSettings();
      const isDebugMode = settings.debugMode || false;
      
      // Determine the base URL using config
      let baseUrl;
      if (isDebugMode) {
        // For debug mode, use local paths from config
        baseUrl = config.STORE.LOCAL[type === 'plugin' ? 'PLUGINS' : 'THEMES'].replace('/' + type + 's.json', '');
        window.VRCXExtended.Utils.safeConsoleLog('log', '🔍 [Popup] Debug mode enabled, using local path:', baseUrl);
      } else {
        // Use GitHub URL from config
        baseUrl = config.STORE.GITHUB.BASE_URL + '/store';
        window.VRCXExtended.Utils.safeConsoleLog('log', '🔍 [Popup] Using GitHub URL:', baseUrl);
      }
      
      // Use the filename which now includes the folder path
      const fileUrl = baseUrl + '/' + item.filename;
      
      // Debug logging
      window.VRCXExtended.Utils.safeConsoleLog('log', '🔍 [Popup] Fetching file:', fileUrl);
      window.VRCXExtended.Utils.safeConsoleLog('log', '🔍 [Popup] Debug mode:', isDebugMode);
      window.VRCXExtended.Utils.safeConsoleLog('log', '🔍 [Popup] Item filename:', item.filename);
      
      const response = await fetch(fileUrl);
      if (!response.ok) {
        window.VRCXExtended.Utils.safeConsoleLog('error', '❌ [Popup] HTTP Error:', response.status, response.statusText);
        window.VRCXExtended.Utils.safeConsoleLog('error', '❌ [Popup] Failed URL:', fileUrl);
        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
      }
      
      const content = await response.text();
      window.VRCXExtended.Utils.safeConsoleLog('log', '✅ [Popup] Successfully fetched file, length:', content.length);
      return content;
    },

    uninstallStoreItem(item, type, checkbox) {
      const storageKey = type === 'plugin' ? KEYS.PLUGINS : KEYS.THEMES;
      const installedItems = this.readJSON(storageKey, []);
      
      // Find and remove the item
      const index = installedItems.findIndex(installed => 
        installed.name === item.name && installed.creator === item.creator
      );
      
      if (index !== -1) {
        installedItems.splice(index, 1);
        this.writeJSON(storageKey, installedItems);
        
        const itemType = type === 'plugin' ? 'Plugin' : 'Theme';
        const message = itemType + ' "' + item.name + '" uninstalled successfully!';
        
        if (window.opener?.VRCXExtended?.Utils?.showNotification) {
          window.opener.VRCXExtended.Utils.showNotification(message, 'info');
        }
        
        // Refresh the opener window
        if (type === 'plugin' && window.opener?.$app?.refreshVrcxPlugins) {
          window.opener.$app.refreshVrcxPlugins();
        }
        if (type === 'theme' && window.opener?.$app?.refreshVrcxThemes) {
          window.opener.$app.refreshVrcxThemes();
        }
      } else {
        // Not installed, reset the toggle state
        checkbox.checked = false;
        slider.style.background = '#4a4a4a';
        slider.style.borderColor = '#4a4a4a';
      }
    },

    getDefaultCode(type, item) {
      if (type === 'plugin') {
        return '//\\n' +
               '// ==PLUGIN==\\n' +
               '// @name         ' + item.name + '\\n' +
               '// @description  ' + item.description + '\\n' +
               '// @creator      ' + item.creator + '\\n' +
               '// @dateCreated  ' + item.dateCreated + '\\n' +
               '// @dateUpdated  ' + item.dateUpdated + '\\n' +
               '// ==PLUGIN==\\n' +
               '//\\n' +
               '\\n' +
               '// ' + item.name + ' Plugin\\n' +
               '(function() {\\n' +
               '  \\'use strict\\';\\n' +
               '  \\n' +
               '  console.log(\\'' + item.name + ' loaded!\\');\\n' +
               '  \\n' +
               '  // Your plugin code here\\n' +
               '  \\n' +
               '})();';
      } else {
        return '/**\\n' +
               '// ==THEME==\\n' +
               '// @name         ' + item.name + '\\n' +
               '// @description  ' + item.description + '\\n' +
               '// @creator      ' + item.creator + '\\n' +
               '// @dateCreated  ' + item.dateCreated + '\\n' +
               '// @dateUpdated  ' + item.dateUpdated + '\\n' +
               '// ==THEME==\\n' +
               '*/\\n' +
               '\\n' +
               '/** ' + item.name + ' Theme for VRCX-Extended */\\n' +
               '\\n' +
               '/** Your theme CSS here */';
      }
    },

    simpleRenderSettings(listElement) {
      listElement.innerHTML = '';
      
      const settingsContainer = document.createElement('div');
      settingsContainer.style.gridColumn = '1 / -1';
      settingsContainer.style.maxWidth = '500px';
      settingsContainer.style.margin = '0 auto';
      
      // Cache Settings Card
      const cacheCard = document.createElement('div');
      cacheCard.className = 'card';
      cacheCard.style.marginBottom = '12px';
      
      const cacheTitle = document.createElement('div');
      cacheTitle.className = 'card-title';
      cacheTitle.innerHTML = '<h3 style="margin: 0; font-size: 14px; color: var(--text-2, hsl(38, 47%, 80%));">Cache Settings</h3>';
      
      const cacheContent = document.createElement('div');
      cacheContent.style.display = 'flex';
      cacheContent.style.flexDirection = 'column';
      cacheContent.style.gap = '10px';
      
      // Disable cache toggle
      const cacheToggleContainer = document.createElement('div');
      cacheToggleContainer.style.display = 'flex';
      cacheToggleContainer.style.alignItems = 'center';
      cacheToggleContainer.style.gap = '8px';
      
      const cacheCheckbox = document.createElement('input');
      cacheCheckbox.type = 'checkbox';
      cacheCheckbox.id = 'disableCacheCheckbox';
      cacheCheckbox.style.transform = 'scale(1.1)';
      
      // Get current setting from opener window
      const currentSettings = window.opener?.VRCXExtended?.Config?.getSettings?.() || {};
      cacheCheckbox.checked = currentSettings.disableCache || false;
      
      const cacheLabel = document.createElement('label');
      cacheLabel.htmlFor = 'disableCacheCheckbox';
      cacheLabel.style.cursor = 'pointer';
      cacheLabel.style.userSelect = 'none';
      cacheLabel.style.fontSize = '12px';
      cacheLabel.textContent = 'Disable module caching (for development)';
      
      cacheCheckbox.addEventListener('change', () => {
        if (window.opener?.VRCXExtended?.Config?.setSetting) {
          window.opener.VRCXExtended.Config.setSetting('disableCache', cacheCheckbox.checked);
          
          if (window.opener?.VRCXExtended?.Utils?.showNotification) {
            window.opener.VRCXExtended.Utils.showNotification(
              cacheCheckbox.checked ? 'Module caching disabled' : 'Module caching enabled',
              'success'
            );
          }
        }
      });
      
      cacheToggleContainer.appendChild(cacheCheckbox);
      cacheToggleContainer.appendChild(cacheLabel);
      
      const cacheInfo = document.createElement('div');
      cacheInfo.className = 'muted';
      cacheInfo.style.fontSize = '12px';
      cacheInfo.textContent = 'When disabled, modules will always be downloaded fresh instead of using cached versions. Useful for development but slower loading.';
      
      // Clear module cache button
      const clearModuleCacheBtn = document.createElement('button');
      clearModuleCacheBtn.className = 'btn';
      clearModuleCacheBtn.style.backgroundColor = 'var(--accent-1, #ff6b35)';
      clearModuleCacheBtn.style.borderColor = 'var(--accent-1, #ff6b35)';
      clearModuleCacheBtn.style.color = 'var(--text-0, #282828)';
      clearModuleCacheBtn.style.alignSelf = 'flex-start';
      clearModuleCacheBtn.style.fontSize = '11px';
      clearModuleCacheBtn.style.padding = '4px 8px';
      clearModuleCacheBtn.textContent = '🗑️ Clear Module Cache';
      
      clearModuleCacheBtn.addEventListener('click', () => {
        if (window.opener?.VRCXExtended?.ModuleSystem?.clearAllCache) {
          const clearedCount = window.opener.VRCXExtended.ModuleSystem.clearAllCache();
          if (clearedCount > 0) {
            alert('Successfully cleared ' + clearedCount + ' cached modules.');
          } else {
            alert('No cached modules found to clear.');
          }
        } else {
          alert('Cache clearing not available.');
        }
      });
      
      // Clear store cache button
      const clearStoreCacheBtn = document.createElement('button');
      clearStoreCacheBtn.className = 'btn';
      clearStoreCacheBtn.style.backgroundColor = 'var(--accent-2, #ff8c42)';
      clearStoreCacheBtn.style.borderColor = 'var(--accent-2, #ff8c42)';
      clearStoreCacheBtn.style.color = 'var(--text-0, #282828)';
      clearStoreCacheBtn.style.alignSelf = 'flex-start';
      clearStoreCacheBtn.style.fontSize = '11px';
      clearStoreCacheBtn.style.padding = '4px 8px';
      clearStoreCacheBtn.style.marginTop = '8px';
      clearStoreCacheBtn.textContent = '🔄 Clear Store Cache';
      
      clearStoreCacheBtn.addEventListener('click', () => {
        if (window.opener?.VRCXExtended?.Store?.clearCache) {
          window.opener.VRCXExtended.Store.clearCache('all');
          alert('Store cache cleared successfully. Store data will be refreshed on next load.');
          
          // Force refresh the current store section if we're on the store tab
          const currentSection = this.getSection();
          if (currentSection === 'store') {
            setTimeout(() => {
              this.renderCurrentSection();
            }, 100);
          }
        } else {
          alert('Store cache clearing not available.');
        }
      });
      
      cacheContent.appendChild(cacheToggleContainer);
      cacheContent.appendChild(cacheInfo);
      cacheContent.appendChild(clearModuleCacheBtn);
      cacheContent.appendChild(clearStoreCacheBtn);
      cacheCard.appendChild(cacheTitle);
      cacheCard.appendChild(cacheContent);
      
      // Debug Mode Settings Card
      const debugCard = document.createElement('div');
      debugCard.className = 'card';
      debugCard.style.marginBottom = '12px';
      
      const debugTitle = document.createElement('div');
      debugTitle.className = 'card-title';
      debugTitle.innerHTML = '<h3 style="margin: 0; font-size: 14px; color: var(--text-2, hsl(38, 47%, 80%));">Debug Mode</h3>';
      
      const debugContent = document.createElement('div');
      debugContent.style.display = 'flex';
      debugContent.style.flexDirection = 'column';
      debugContent.style.gap = '10px';
      
      // Debug mode toggle
      const debugToggleContainer = document.createElement('div');
      debugToggleContainer.style.display = 'flex';
      debugToggleContainer.style.alignItems = 'center';
      debugToggleContainer.style.gap = '8px';
      
      const debugCheckbox = document.createElement('input');
      debugCheckbox.type = 'checkbox';
      debugCheckbox.id = 'debugModeCheckbox';
      debugCheckbox.style.transform = 'scale(1.1)';
      
      // Get current debug setting
      debugCheckbox.checked = currentSettings.debugMode || false;
      
      const debugLabel = document.createElement('label');
      debugLabel.htmlFor = 'debugModeCheckbox';
      debugLabel.style.cursor = 'pointer';
      debugLabel.style.userSelect = 'none';
      debugLabel.style.fontSize = '12px';
      debugLabel.textContent = 'Enable debug mode (load from local files)';
      
      debugCheckbox.addEventListener('change', () => {
        if (window.opener?.VRCXExtended?.Config?.setSetting) {
          window.opener.VRCXExtended.Config.setSetting('debugMode', debugCheckbox.checked);
          
          if (window.opener?.VRCXExtended?.Utils?.showNotification) {
            window.opener.VRCXExtended.Utils.showNotification(
              debugCheckbox.checked ? 'Debug mode enabled - will load from local files (with GitHub fallback)' : 'Debug mode disabled - will load from GitHub',
              'success'
            );
          }
        }
      });
      
      debugToggleContainer.appendChild(debugCheckbox);
      debugToggleContainer.appendChild(debugLabel);
      
      // Disable fallback toggle
      const fallbackToggleContainer = document.createElement('div');
      fallbackToggleContainer.style.display = 'flex';
      fallbackToggleContainer.style.alignItems = 'center';
      fallbackToggleContainer.style.gap = '8px';
      fallbackToggleContainer.style.marginTop = '8px';
      
      const fallbackCheckbox = document.createElement('input');
      fallbackCheckbox.type = 'checkbox';
      fallbackCheckbox.id = 'disableFallbackCheckbox';
      fallbackCheckbox.style.transform = 'scale(1.1)';
      
      // Get current fallback setting
      fallbackCheckbox.checked = currentSettings.disableFallback || false;
      
      const fallbackLabel = document.createElement('label');
      fallbackLabel.htmlFor = 'disableFallbackCheckbox';
      fallbackLabel.style.cursor = 'pointer';
      fallbackLabel.style.userSelect = 'none';
      fallbackLabel.style.fontSize = '12px';
      fallbackLabel.textContent = 'Disable GitHub fallback (local files only)';
      
      fallbackCheckbox.addEventListener('change', () => {
        if (window.opener?.VRCXExtended?.Config?.setSetting) {
          window.opener.VRCXExtended.Config.setSetting('disableFallback', fallbackCheckbox.checked);
          
          if (window.opener?.VRCXExtended?.Utils?.showNotification) {
            window.opener.VRCXExtended.Utils.showNotification(
              fallbackCheckbox.checked ? 'GitHub fallback disabled - will only load from local files' : 'GitHub fallback enabled - will fall back to GitHub if local files fail',
              'success'
            );
          }
        }
      });
      
      fallbackToggleContainer.appendChild(fallbackCheckbox);
      fallbackToggleContainer.appendChild(fallbackLabel);
      
      const debugInfo = document.createElement('div');
      debugInfo.className = 'muted';
      debugInfo.style.fontSize = '11px';
      debugInfo.innerHTML = 'When debug mode is enabled, VRCX-Extended will load modules from local file paths instead of GitHub. If local files are not available, it will automatically fall back to GitHub (unless disabled below). This requires the files to be available at:<br><br><code>file://vrcx/extended/modules/</code><br><code>file://vrcx/extended/html/</code><br><code>file://vrcx/extended/stylesheet/</code><br><br><strong>Note:</strong> You must refresh the page after changing these settings.';
      
      // Local paths info
      const pathsInfo = document.createElement('div');
      pathsInfo.style.backgroundColor = 'var(--surface-1, #32302f)';
      pathsInfo.style.padding = '8px';
      pathsInfo.style.borderRadius = '4px';
      pathsInfo.style.fontFamily = 'monospace';
      pathsInfo.style.fontSize = '10px';
      pathsInfo.style.color = 'var(--text-2, hsl(38, 47%, 80%))';
      pathsInfo.innerHTML = 
        '<strong>Local Debug Paths:</strong><br>' +
        'Modules: file://vrcx/extended/modules/<br>' +
        'HTML: file://vrcx/extended/html/<br>' +
        'Stylesheets: file://vrcx/extended/stylesheet/';
      
      debugContent.appendChild(debugToggleContainer);
      debugContent.appendChild(fallbackToggleContainer);
      debugContent.appendChild(debugInfo);
      debugContent.appendChild(pathsInfo);
      debugCard.appendChild(debugTitle);
      debugCard.appendChild(debugContent);
      
      // Storage Management Card
      const storageCard = document.createElement('div');
      storageCard.className = 'card';
      
      const storageTitle = document.createElement('div');
      storageTitle.className = 'card-title';
      storageTitle.innerHTML = '<h3 style="margin: 0; font-size: 14px; color: var(--text-2, hsl(38, 47%, 80%));">Storage Management</h3>';
      
      const storageContent = document.createElement('div');
      storageContent.style.display = 'flex';
      storageContent.style.flexDirection = 'column';
      storageContent.style.gap = '8px';
      
      const storageInfo = document.createElement('div');
      storageInfo.className = 'muted';
      storageInfo.style.fontSize = '11px';
      storageInfo.textContent = 'Reset all plugins and themes data. This action cannot be undone.';
      
      const resetBtn = document.createElement('button');
      resetBtn.className = 'btn';
      resetBtn.style.backgroundColor = 'var(--red-2, #ea6962)';
      resetBtn.style.borderColor = 'var(--red-2, #ea6962)';
      resetBtn.style.color = 'var(--text-0, #282828)';
      resetBtn.style.alignSelf = 'flex-start';
      resetBtn.style.fontSize = '11px';
      resetBtn.style.padding = '4px 8px';
      resetBtn.textContent = '⚠️ Reset All Data';
      
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all VRCX Mods data?\\n\\nThis will permanently delete all your plugins and themes. This action cannot be undone.')) {
          window.opener.localStorage.removeItem('vrcx_mm_plugins');
          window.opener.localStorage.removeItem('vrcx_mm_themes');
          
          if (window.opener?.$app?.refreshVrcxAll) {
            window.opener.$app.refreshVrcxAll();
          }
          
          alert('All VRCX Mods data has been reset.');
          this.renderCurrentSection();
        }
      });
      
      storageContent.appendChild(storageInfo);
      storageContent.appendChild(resetBtn);
      storageCard.appendChild(storageTitle);
      storageCard.appendChild(storageContent);
      
      settingsContainer.appendChild(cacheCard);
      settingsContainer.appendChild(debugCard);
      settingsContainer.appendChild(storageCard);
      listElement.appendChild(settingsContainer);
    },

    openSimpleEditor(item) {
      const section = this.getSection();
      const isPlugin = section === 'plugins';

      const root = document.getElementById('modalRoot');
      root.style.display = 'block';
      root.innerHTML = '';
      
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';

      const modal = document.createElement('div');
      modal.className = 'modal';

      const header = document.createElement('div');
      header.className = 'modal-header';
      
      const title = document.createElement('strong');
      title.textContent = (item?.id ? 'Edit ' : 'Create ') + (isPlugin ? 'Plugin' : 'Theme');
      header.appendChild(title);
      
              // Add fullscreen button
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = 'btn ghost';
        fullscreenBtn.innerHTML = '<i class="el-icon-full-screen"></i>';
        fullscreenBtn.title = 'Toggle Fullscreen';
        fullscreenBtn.style.marginLeft = 'auto';
        fullscreenBtn.style.padding = '4px 8px';
        fullscreenBtn.style.fontSize = '12px';
      
      let isFullscreen = false;
      fullscreenBtn.addEventListener('click', () => {
        isFullscreen = !isFullscreen;
        const fieldsSection = document.getElementById('editor-fields');
        
        if (isFullscreen) {
          modal.style.width = '100vw';
          modal.style.height = '100vh';
          modal.style.borderRadius = '0';
          modal.style.maxWidth = 'none';
          modal.style.maxHeight = 'none';
          fullscreenBtn.innerHTML = '<i class="el-icon-close"></i>';
          fullscreenBtn.title = 'Exit Fullscreen';
          
          // Hide the fields section in fullscreen mode
          if (fieldsSection) {
            fieldsSection.style.display = 'none';
          }
          editorHost.className = 'editor-host no-fields';
        } else {
          modal.style.width = 'min(750px, 90vw)';
          modal.style.height = 'min(600px, 85vh)';
          modal.style.borderRadius = '8px';
          modal.style.maxWidth = '90vw';
          modal.style.maxHeight = '85vh';
          fullscreenBtn.innerHTML = '<i class="el-icon-full-screen"></i>';
          fullscreenBtn.title = 'Toggle Fullscreen';
          
          // Show the fields section in normal mode
          if (fieldsSection) {
            fieldsSection.style.display = 'flex';
          }
          editorHost.className = 'editor-host';
        }
        
        // Refresh CodeMirror to adjust to new size
        if (editor) {
          setTimeout(() => {
            editor.refresh();
            editor.setSize('100%', '100%');
          }, 50);
        }
              });
        
        header.appendChild(fullscreenBtn);

      const body = document.createElement('div');
      body.className = 'modal-body';

      // Create field section (initially visible)
      const field = document.createElement('div');
      field.className = 'field';
      field.id = 'editor-fields';
      
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = (isPlugin?'Plugin':'Theme') + ' name';
      nameInput.value = item?.name || '';
      nameInput.id = 'editor-name-input';
      field.appendChild(nameInput);

      const descriptionInput = document.createElement('input');
      descriptionInput.type = 'text';
      descriptionInput.placeholder = 'Description (optional)';
      descriptionInput.value = item?.description || '';
      descriptionInput.style.marginTop = '12px';
      descriptionInput.id = 'editor-description-input';
      field.appendChild(descriptionInput);

      const creatorInput = document.createElement('input');
      creatorInput.type = 'text';
      creatorInput.placeholder = 'Creator name (optional)';
      creatorInput.value = item?.creator || '';
      creatorInput.style.marginTop = '12px';
      creatorInput.id = 'editor-creator-input';
      field.appendChild(creatorInput);

      const thumbnailInput = document.createElement('input');
      thumbnailInput.type = 'text';
      thumbnailInput.placeholder = 'Thumbnail URL (optional)';
      thumbnailInput.value = item?.thumbnail || 'https://picsum.photos/200';
      thumbnailInput.style.marginTop = '12px';
      thumbnailInput.id = 'editor-thumbnail-input';
      field.appendChild(thumbnailInput);

      const editorHost = document.createElement('div');
      editorHost.className = 'editor-host';
      const textarea = document.createElement('textarea');
      textarea.id = 'editor-textarea';
      textarea.value = item?.code || '';
      editorHost.appendChild(textarea);

      body.appendChild(field);
      body.appendChild(editorHost);

      const footer = document.createElement('div');
      footer.className = 'modal-footer';
      
      // Add autosave toggle to left side of footer
      const autosaveContainer = document.createElement('div');
      autosaveContainer.style.display = 'flex';
      autosaveContainer.style.alignItems = 'center';
      autosaveContainer.style.gap = '8px';
      autosaveContainer.style.marginRight = 'auto';
      
      const autosaveToggle = document.createElement('label');
      autosaveToggle.className = 'switch';
      autosaveToggle.style.margin = '0';
      autosaveToggle.style.display = 'flex';
      autosaveToggle.style.alignItems = 'center';
      
      const autosaveCheckbox = document.createElement('input');
      autosaveCheckbox.type = 'checkbox';
      autosaveCheckbox.checked = true; // Default to on for better UX
      autosaveCheckbox.id = 'autosave-toggle';
      
      const autosaveSlider = document.createElement('span');
      autosaveSlider.className = 'slider';
      autosaveSlider.style.background = 'var(--accent-1, #ff6b35)'; // Default to enabled color
      autosaveSlider.style.borderColor = 'var(--accent-1, #ff6b35)'; // Default to enabled color
      
      autosaveToggle.appendChild(autosaveCheckbox);
      autosaveToggle.appendChild(autosaveSlider);
      autosaveContainer.appendChild(autosaveToggle);
      
      const autosaveLabel = document.createElement('span');
      autosaveLabel.textContent = 'Autosave';
      autosaveLabel.style.fontSize = '12px';
      autosaveLabel.style.color = '#a0a0a0';
      autosaveContainer.appendChild(autosaveLabel);
      
      let autosaveEnabled = true; // Default to enabled
      let autosaveTimer = null;
      
      autosaveCheckbox.addEventListener('change', (e) => {
        autosaveEnabled = e.target.checked;
        autosaveSlider.style.background = autosaveEnabled ? 'var(--accent-1, #ff6b35)' : '#4a4a4a';
        autosaveSlider.style.borderColor = autosaveEnabled ? 'var(--accent-1, #ff6b35)' : '#4a4a4a';
        
        window.VRCXExtended.Utils.safeConsoleLog('log', '🔄 [Popup] Autosave toggled:', autosaveEnabled);
        
        if (autosaveEnabled) {
          // Show notification
          if (window.opener?.VRCXExtended?.Utils?.showNotification) {
            window.opener.VRCXExtended.Utils.showNotification('Autosave enabled - changes will be saved automatically', 'success');
          }
        } else {
          if (autosaveTimer) {
            clearTimeout(autosaveTimer);
            autosaveTimer = null;
          }
          // Show notification
          if (window.opener?.VRCXExtended?.Utils?.showNotification) {
            window.opener.VRCXExtended.Utils.showNotification('Autosave disabled', 'info');
          }
        }
      });
      
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn ghost';
      cancelBtn.textContent = 'Cancel';
      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn primary';
      saveBtn.textContent = 'Save';

      footer.appendChild(autosaveContainer);
      footer.appendChild(cancelBtn);
      footer.appendChild(saveBtn);

      modal.appendChild(header);
      modal.appendChild(body);
      modal.appendChild(footer);
      backdrop.appendChild(modal);
      root.appendChild(backdrop);

      // Initialize CodeMirror
      let editor = null;
      
      // Show initial autosave notification
      setTimeout(() => {
        if (window.opener?.VRCXExtended?.Utils?.showNotification) {
          window.opener.VRCXExtended.Utils.showNotification('Autosave is enabled by default - changes will be saved automatically', 'info');
        }
      }, 500);
      
      setTimeout(() => {
        try {
          editor = CodeMirror.fromTextArea(textarea, {
            lineNumbers: true,
            mode: isPlugin ? 'javascript' : 'css',
            styleActiveLine: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            autoCloseTags: !isPlugin,
            theme: 'default',
            value: item?.code || ''
          });
          
          // Add autosave functionality
          const performAutosave = () => {
            if (!autosaveEnabled || !editor) return;
            
            window.VRCXExtended.Utils.safeConsoleLog('log', '🔄 [Popup] Performing autosave...');
            
            try {
              const storageKey = isPlugin ? KEYS.PLUGINS : KEYS.THEMES;
              const data = window.VRCXExtended.PopupManager.readJSON(storageKey, []);
            
            // Get values from input fields if they exist, otherwise use existing values or defaults
            const nameInput = document.getElementById('editor-name-input');
            const descriptionInput = document.getElementById('editor-description-input');
            const creatorInput = document.getElementById('editor-creator-input');
            const thumbnailInput = document.getElementById('editor-thumbnail-input');
            
            const name = nameInput ? nameInput.value.trim() : (item?.name || (isPlugin ? 'Untitled Plugin' : 'Untitled Theme'));
            const description = descriptionInput ? descriptionInput.value.trim() : (item?.description || '');
            const creator = creatorInput ? creatorInput.value.trim() : (item?.creator || '');
            const thumbnail = thumbnailInput ? thumbnailInput.value.trim() : (item?.thumbnail || 'https://picsum.photos/200');
            
            let code = '';
            try {
              code = editor.getValue();
            } catch(e) {
              code = textarea.value;
            }

            if (item?.id) {
              const index = data.findIndex(x => x.id === item.id);
              if (index !== -1) {
                data[index].name = name;
                data[index].description = description;
                data[index].creator = creator;
                data[index].thumbnail = thumbnail;
                data[index].code = code;
                data[index].updatedAt = window.VRCXExtended.PopupManager.nowIso();
              }
            } else {
              // For new items, create a temporary save
              const tempId = 'temp_' + Date.now();
              data.push({
                id: tempId,
                name,
                description,
                creator,
                thumbnail,
                code,
                enabled: true,
                createdAt: window.VRCXExtended.PopupManager.nowIso(),
                updatedAt: window.VRCXExtended.PopupManager.nowIso(),
              });
              // Update the item reference for subsequent autosaves
              item = { id: tempId };
            }

            window.VRCXExtended.PopupManager.writeJSON(storageKey, data);
            
            window.VRCXExtended.Utils.safeConsoleLog('log', '✅ [Popup] Autosave completed successfully');
            
            // Show subtle autosave indicator
            const originalColor = autosaveSlider.style.background;
            autosaveSlider.style.background = '#67c23a';
            autosaveSlider.style.borderColor = '#67c23a';
            setTimeout(() => {
              autosaveSlider.style.background = originalColor;
              autosaveSlider.style.borderColor = originalColor;
            }, 1000);
            
            } catch (error) {
              window.VRCXExtended.Utils.safeConsoleLog('error', '❌ [Popup] Autosave failed:', error);
              
              // Show error indicator
              const originalColor = autosaveSlider.style.background;
              autosaveSlider.style.background = '#f56c6c';
              autosaveSlider.style.borderColor = '#f56c6c';
              setTimeout(() => {
                autosaveSlider.style.background = originalColor;
                autosaveSlider.style.borderColor = originalColor;
              }, 2000);
            }
          };
          
          // Set up autosave on editor changes
          editor.on('change', () => {
            window.VRCXExtended.Utils.safeConsoleLog('log', '📝 [Popup] Editor changed, autosave enabled:', autosaveEnabled);
            if (autosaveEnabled) {
              if (autosaveTimer) {
                clearTimeout(autosaveTimer);
              }
              autosaveTimer = setTimeout(performAutosave, 2000); // Autosave after 2 seconds of inactivity
            }
          });
          
          // Set up autosave on input field changes
          const setupInputAutosave = (inputElement) => {
            if (inputElement) {
              inputElement.addEventListener('input', () => {
                window.VRCXExtended.Utils.safeConsoleLog('log', '📝 [Popup] Input field changed, autosave enabled:', autosaveEnabled);
                if (autosaveEnabled) {
                  if (autosaveTimer) {
                    clearTimeout(autosaveTimer);
                  }
                  autosaveTimer = setTimeout(performAutosave, 2000); // Autosave after 2 seconds of inactivity
                }
              });
            }
          };
          
          // Add autosave listeners to all input fields
          setupInputAutosave(nameInput);
          setupInputAutosave(descriptionInput);
          setupInputAutosave(creatorInput);
          setupInputAutosave(thumbnailInput);
          
          setTimeout(() => {
            if (editor) {
              editor.refresh();
              editor.setSize('100%', '100%');
              editor.focus();
            }
          }, 50);
          
        } catch (error) {
          window.VRCXExtended.Utils.safeConsoleLog('error', 'CodeMirror initialization error:', error);
        }
      }, 100);

      const closeEditor = () => {
        // Clear autosave timer
        if (autosaveTimer) {
          clearTimeout(autosaveTimer);
          autosaveTimer = null;
        }
        
        if (editor) {
          try {
            editor.toTextArea();
                  } catch(e) {
          window.VRCXExtended.Utils.safeConsoleLog('warn', 'Error disposing CodeMirror:', e);
        }
        }
        root.style.display = 'none';
        root.innerHTML = '';
      };

      cancelBtn.addEventListener('click', closeEditor);
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeEditor(); });

      saveBtn.addEventListener('click', function() {
        const storageKey = isPlugin ? KEYS.PLUGINS : KEYS.THEMES;
        const data = window.VRCXExtended.PopupManager.readJSON(storageKey, []);
        
        // Get values from input fields if they exist, otherwise use existing values or defaults
        const nameInput = document.getElementById('editor-name-input');
        const descriptionInput = document.getElementById('editor-description-input');
        const creatorInput = document.getElementById('editor-creator-input');
        const thumbnailInput = document.getElementById('editor-thumbnail-input');
        
        const name = nameInput ? nameInput.value.trim() : (item?.name || (isPlugin ? 'Untitled Plugin' : 'Untitled Theme'));
        const description = descriptionInput ? descriptionInput.value.trim() : (item?.description || '');
        const creator = creatorInput ? creatorInput.value.trim() : (item?.creator || '');
        const thumbnail = thumbnailInput ? thumbnailInput.value.trim() : (item?.thumbnail || 'https://picsum.photos/200');
        
        let code = '';
        if (editor) {
          try {
            code = editor.getValue();
          } catch(e) {
            code = textarea.value;
          }
        } else {
          code = textarea.value;
        }

        if (item?.id) {
          const index = data.findIndex(x => x.id === item.id);
          if (index !== -1) {
            data[index].name = name;
            data[index].description = description;
            data[index].creator = creator;
            data[index].thumbnail = thumbnail;
            data[index].code = code;
            data[index].updatedAt = window.VRCXExtended.PopupManager.nowIso();
          }
        } else {
          data.push({
            id: window.VRCXExtended.PopupManager.uid(),
            name,
            description,
            creator,
            thumbnail,
            code,
            enabled: true,
            createdAt: window.VRCXExtended.PopupManager.nowIso(),
            updatedAt: window.VRCXExtended.PopupManager.nowIso(),
          });
        }

        window.VRCXExtended.PopupManager.writeJSON(storageKey, data);
        
        // Show notification for save action
        if (window.opener?.VRCXExtended?.Utils?.showNotification) {
          const itemType = isPlugin ? 'Plugin' : 'Theme';
          const action = item?.id ? 'updated' : 'created';
          const message = itemType + ' <strong>' + name + '</strong> ' + action + ' successfully';
          window.opener.VRCXExtended.Utils.showNotification(message, 'success');
        }
        
        // Refresh the opener window
        if (isPlugin && window.opener?.$app?.refreshVrcxPlugins) {
          window.opener.$app.refreshVrcxPlugins();
        }
        if (!isPlugin && window.opener?.$app?.refreshVrcxThemes) {
          window.opener.$app.refreshVrcxThemes();
        }

        // Close the modal first
        closeEditor();
        
        // Then refresh the current section
        setTimeout(() => {
          window.VRCXExtended.PopupManager.renderCurrentSection();
        }, 100);
      });
      
      modal.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          saveBtn.click();
        }
        if (e.key === 'Escape') {
          closeEditor();
        }
        if (e.key === 'F11') {
          e.preventDefault();
          fullscreenBtn.click();
        }
        if (e.ctrlKey && e.key === 'a') {
          e.preventDefault();
          autosaveCheckbox.checked = !autosaveCheckbox.checked;
          autosaveCheckbox.dispatchEvent(new Event('change'));
        }
      });
    },

    async openDetailModal(item, section) {
      const root = document.getElementById('modalRoot');
      root.style.display = 'block';
      root.innerHTML = '';
      
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';

      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.style.width = 'min(900px, 95vw)';
      modal.style.height = 'min(700px, 90vh)';

      const header = document.createElement('div');
      header.className = 'modal-header';
      
      const title = document.createElement('strong');
      title.textContent = item.name;
      title.style.fontSize = '18px';
      header.appendChild(title);

      const body = document.createElement('div');
      body.className = 'modal-body';
      body.style.padding = '20px';
      body.style.overflow = 'auto';

      // Create content sections
      const content = document.createElement('div');
      content.style.display = 'flex';
      content.style.flexDirection = 'column';
      content.style.gap = '20px';

      // 1. Header section with thumbnail and basic info
      const headerSection = document.createElement('div');
      headerSection.style.display = 'flex';
      headerSection.style.gap = '20px';
      headerSection.style.alignItems = 'flex-start';
      headerSection.style.paddingBottom = '20px';
      headerSection.style.borderBottom = '1px solid #333';

      // Thumbnail
      const thumbnail = document.createElement('img');
      thumbnail.src = item.thumbnail || 'https://picsum.photos/200';
      thumbnail.alt = item.name + ' thumbnail';
      thumbnail.style.width = '200px';
      thumbnail.style.height = '120px';
      thumbnail.style.objectFit = 'cover';
      thumbnail.style.borderRadius = '8px';
      thumbnail.style.border = '1px solid #333';
      
      // Add error handling for thumbnail loading
      thumbnail.addEventListener('error', () => {
        thumbnail.src = 'https://picsum.photos/200';
        window.VRCXExtended.Utils.safeConsoleLog('warn', 'Failed to load thumbnail for detail modal:', item.name);
      });

      // Info section
      const infoSection = document.createElement('div');
      infoSection.style.flex = '1';
      infoSection.style.display = 'flex';
      infoSection.style.flexDirection = 'column';
      infoSection.style.gap = '12px';

      const itemName = document.createElement('h2');
      itemName.textContent = item.name;
      itemName.style.margin = '0';
      itemName.style.fontSize = '24px';
      itemName.style.fontWeight = '600';
      itemName.style.color = '#ffffff';

      const itemDescription = document.createElement('p');
      itemDescription.textContent = item.description || 'No description available';
      itemDescription.style.margin = '0';
      itemDescription.style.fontSize = '14px';
      itemDescription.style.lineHeight = '1.5';
      itemDescription.style.color = '#cccccc';

      const metaInfo = document.createElement('div');
      metaInfo.style.display = 'flex';
      metaInfo.style.flexDirection = 'column';
      metaInfo.style.gap = '8px';
      metaInfo.style.fontSize = '12px';
      metaInfo.style.color = '#888888';

      const creator = document.createElement('div');
      creator.innerHTML = '<strong>Creator:</strong> ' + (item.creator || 'Unknown');
      
      const createdDate = document.createElement('div');
      const createdDateStr = item.createdAt || item.dateCreated;
      if (createdDateStr) {
        createdDate.innerHTML = '<strong>Created:</strong> ' + new Date(createdDateStr).toLocaleDateString();
      }
      
      const updatedDate = document.createElement('div');
      const updatedDateStr = item.updatedAt || item.dateUpdated;
      if (updatedDateStr) {
        updatedDate.innerHTML = '<strong>Updated:</strong> ' + new Date(updatedDateStr).toLocaleDateString();
      }

      const status = document.createElement('div');
      if (section.startsWith('store-')) {
        // Store item - show install status
        const storageKey = section === 'store-plugin' ? KEYS.PLUGINS : KEYS.THEMES;
        const installedItems = this.readJSON(storageKey, []);
        const isInstalled = installedItems.some(installed => 
          installed.name === item.name && installed.creator === item.creator
        );
        status.innerHTML = '<strong>Status:</strong> ' + (isInstalled ? '<span style="color: #67c23a;">Installed</span>' : '<span style="color: #909399;">Not Installed</span>');
      } else {
        // Local item - show enabled status
        status.innerHTML = '<strong>Status:</strong> ' + (item.enabled ? '<span style="color: #67c23a;">Enabled</span>' : '<span style="color: #f56c6c;">Disabled</span>');
      }

      metaInfo.appendChild(creator);
      if (createdDateStr) metaInfo.appendChild(createdDate);
      if (updatedDateStr) metaInfo.appendChild(updatedDate);
      metaInfo.appendChild(status);

      infoSection.appendChild(itemName);
      infoSection.appendChild(itemDescription);
      infoSection.appendChild(metaInfo);

      headerSection.appendChild(thumbnail);
      headerSection.appendChild(infoSection);

      // 2. Code section
      const codeSection = document.createElement('div');
      codeSection.style.display = 'flex';
      codeSection.style.flexDirection = 'column';
      codeSection.style.gap = '12px';

      const codeTitle = document.createElement('h3');
      codeTitle.textContent = 'Code';
      codeTitle.style.margin = '0';
      codeTitle.style.fontSize = '16px';
      codeTitle.style.fontWeight = '600';
      codeTitle.style.color = '#ffffff';

      const codeContainer = document.createElement('div');
      codeContainer.style.border = '1px solid #333';
      codeContainer.style.borderRadius = '6px';
      codeContainer.style.overflow = 'hidden';
      codeContainer.style.backgroundColor = '#1a1a1a';

      const codeTextarea = document.createElement('textarea');
      codeTextarea.style.width = '100%';
      codeTextarea.style.height = '300px';
      codeTextarea.style.border = 'none';
      codeTextarea.style.backgroundColor = '#1a1a1a';
      codeTextarea.style.color = '#ffffff';
      codeTextarea.style.fontFamily = 'monospace';
      codeTextarea.style.fontSize = '12px';
      codeTextarea.style.padding = '12px';
      codeTextarea.style.resize = 'vertical';
      codeTextarea.readOnly = true;

      // Handle code content based on section type
      if (section.startsWith('store-')) {
        // For store items, fetch the code content
        codeTextarea.value = 'Loading code content...';
        try {
          const type = section === 'store-plugin' ? 'plugin' : 'theme';
          const codeContent = await this.fetchStoreFile(item, type);
          codeTextarea.value = codeContent;
        } catch (error) {
          window.VRCXExtended.Utils.safeConsoleLog('error', 'Failed to fetch store file:', error);
          codeTextarea.value = 'Failed to load code content. Please try again.';
        }
      } else {
        // For local items, use existing code
        codeTextarea.value = item.code || '';
      }

      codeContainer.appendChild(codeTextarea);
      codeSection.appendChild(codeTitle);
      codeSection.appendChild(codeContainer);

      content.appendChild(headerSection);
      content.appendChild(codeSection);
      body.appendChild(content);

      const footer = document.createElement('div');
      footer.className = 'modal-footer';
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'btn ghost';
      closeBtn.textContent = 'Close';
      
      const editBtn = document.createElement('button');
      editBtn.className = 'btn primary';
      editBtn.textContent = 'Edit';
      editBtn.style.display = section.startsWith('store-') ? 'none' : 'inline-flex';

      footer.appendChild(closeBtn);
      footer.appendChild(editBtn);

      modal.appendChild(header);
      modal.appendChild(body);
      modal.appendChild(footer);
      backdrop.appendChild(modal);
      root.appendChild(backdrop);

      const closeModal = () => {
        root.style.display = 'none';
        root.innerHTML = '';
      };

      closeBtn.addEventListener('click', closeModal);
      backdrop.addEventListener('click', (e) => { 
        if (e.target === backdrop) closeModal(); 
      });

      editBtn.addEventListener('click', () => {
        closeModal();
        setTimeout(() => {
          this.openSimpleEditor(item);
        }, 100);
      });

      // Add keyboard shortcuts
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      });
    },

    renderCurrentSection() {
      this.renderContent(this.getSection());
    },

    initializeFooter() {
      // Update time immediately and set interval
      this.updateFooterTime();
      setInterval(() => this.updateFooterTime(), 1000);
      
      // Update status
      this.updateFooterStatus('Ready');
      
      // Update count based on current section
      this.updateFooterCount();
    },

    updateFooterTime() {
      const timeElement = document.getElementById('footerTime');
      if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString();
      }
    },

    updateFooterStatus(status) {
      const statusElement = document.getElementById('footerStatus');
      if (statusElement) {
        statusElement.textContent = status;
      }
    },

    updateFooterCount() {
      const countElement = document.getElementById('footerCount');
      if (!countElement) return;

      const section = this.getSection();
      let count = 0;
      let itemType = 'items';

      switch(section) {
        case 'plugins':
          const plugins = this.readJSON(KEYS.PLUGINS, []);
          count = plugins.length;
          itemType = count === 1 ? 'plugin' : 'plugins';
          break;
        case 'themes':
          const themes = this.readJSON(KEYS.THEMES, []);
          count = themes.length;
          itemType = count === 1 ? 'theme' : 'themes';
          break;
        case 'store':
          const storeSubsection = this.getStoreSubSection();
          if (storeSubsection === 'store-plugins') {
            itemType = 'store plugins';
          } else if (storeSubsection === 'store-themes') {
            itemType = 'store themes';
          }
          // Store count will be updated when data is loaded
          break;
        case 'settings':
          itemType = 'settings';
          count = 3; // Cache, Debug, Storage sections
          break;
      }

      countElement.textContent = count + ' ' + itemType;
    },

    // Utility functions
    readJSON(key, fallback) {
      try {
        const v = window.opener.localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch {
        return fallback;
      }
    },

    writeJSON(key, val) {
      window.opener.localStorage.setItem(key, JSON.stringify(val));
    },

    nowIso() {
      return new Date().toISOString();
    },

    uid() {
      return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  };

  // Setup event listeners
  document.querySelectorAll('.sidebar .menu-item').forEach(mi => 
    mi.addEventListener('click', () => window.VRCXExtended.PopupManager.setSection(mi.dataset.section))
  );
  document.getElementById('createBtn').addEventListener('click', () => 
    window.VRCXExtended.PopupManager.openSimpleEditor(null)
  );

  // Add Ctrl+R reload functionality
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      window.VRCXExtended.Utils.safeConsoleLog('log', '🔄 [Popup] Reloading popup window...');
      
      // Instead of browser reload, rebuild the window content
      if (window.opener && window.opener.VRCXExtended && window.opener.VRCXExtended.Popup) {
        window.opener.VRCXExtended.Popup.buildManagerWindow();
      } else {
        // Fallback to browser reload if opener is not available
        window.location.reload();
      }
    }
  });

  // Apply Material 3 theme
  document.body.className = 'x-container theme-material3';

  // Initialize footer functionality
  window.VRCXExtended.PopupManager.initializeFooter();

  // Initial render
  window.VRCXExtended.PopupManager.setSection('plugins');
  
  window.VRCXExtended.Utils.safeConsoleLog('log', 'VRCX-Extended popup initialized successfully');
})();
    `;
  }
};
