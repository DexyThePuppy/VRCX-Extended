// ==Module==
// @name         VRCX-Extended UI Components
// @description  UI rendering and management for VRCX-Extended
// ==Module==

/**
 * UI components and rendering system for VRCX-Extended
 * Handles menu integration and popup window UI
 */
window.VRCXExtended = window.VRCXExtended || {};

window.VRCXExtended.UI = {
  /**
   * Install the native menu item in VRCX
   */
  installNativeMenuItem() {
    const config = window.VRCXExtended.Config;
    const container = document.querySelector('.x-menu-container > .el-menu');
    
    if (!container || document.getElementById(config.UI.MENU_ITEM_ID)) return;

    const li = document.createElement('li');
    li.id = config.UI.MENU_ITEM_ID;
    li.className = 'el-menu-item';
    li.setAttribute('tabindex', '-1');

    const inner = document.createElement('div');
    const icon = document.createElement('i');
    icon.className = 'el-icon-setting';
    inner.appendChild(icon);

    const title = document.createElement('span');
    title.setAttribute('slot', 'title');
    title.textContent = 'VRCX-Extended';
    inner.appendChild(title);

    li.appendChild(inner);
    li.addEventListener('click', () => window.VRCXExtended.Popup.openManagerWindow());
    container.appendChild(li);
  },

  /**
   * Initialize UI observers and menu integration
   */
  initMenuIntegration() {
    const observer = new MutationObserver(() => this.installNativeMenuItem());
    observer.observe(document.body, { childList: true, subtree: true });
    this.installNativeMenuItem();
  },

  /**
   * Render the main content list for plugins/themes
   * @param {Array} data - Array of items to render
   * @param {string} section - Current section ('plugins' or 'themes')
   * @param {HTMLElement} listElement - Container element
   */
  renderList(data, section, listElement) {
    const utils = window.VRCXExtended.Utils;
    
    // Use DocumentFragment to batch DOM operations
    const fragment = document.createDocumentFragment();
    const sortedData = data.slice().sort(utils.sortByUpdated);

    if (!sortedData.length) {
      const empty = document.createElement('div');
      empty.className = 'muted';
      empty.textContent = 'No items yet. Click Create to add your first one.';
      fragment.appendChild(empty);
    } else {
      // Batch create all cards
      sortedData.forEach(item => {
        const card = this.createItemCard(item, section);
        fragment.appendChild(card);
      });
    }

    // Single DOM update - much faster than individual appendChild calls
    listElement.innerHTML = '';
    listElement.appendChild(fragment);
  },

  /**
   * Create a card for a plugin or theme item
   * @param {Object} item - Item data
   * @param {string} section - Section type
   * @returns {HTMLElement} Card element
   */
  createItemCard(item, section) {
    const utils = window.VRCXExtended.Utils;
    const config = window.VRCXExtended.Config;
    
    const card = document.createElement('div');
    card.className = 'card';

    // Card header with title and settings icon
    const title = document.createElement('div');
    title.className = 'card-title';

    const name = document.createElement('div');
    name.className = 'name';
    name.title = item.name;
    name.textContent = item.name || '(untitled)';

    // Action icons container
    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const deleteIcon = this.createDeleteIcon(item, section);
    const settingsIcon = this.createSettingsIcon(item);

    actions.appendChild(deleteIcon);
    actions.appendChild(settingsIcon);

    title.appendChild(name);
    title.appendChild(actions);

    // Card description
    const description = document.createElement('div');
    description.className = 'card-description';
    if (section === 'plugins') {
      description.textContent = item.description || config.TEMPLATES.PLUGIN.description;
    } else {
      description.textContent = item.description || config.TEMPLATES.THEME.description;
    }

    // Card bottom with toggle
    const bottom = document.createElement('div');
    bottom.className = 'card-bottom';

    // Meta info
    const meta = document.createElement('div');
    meta.className = 'muted';
    meta.style.fontSize = '11px';
    meta.textContent = new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString();

    // Toggle switch
    const toggleSwitch = this.createToggleSwitch(item, section);

    bottom.appendChild(meta);
    bottom.appendChild(toggleSwitch);

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(bottom);

    return card;
  },

  /**
   * Create delete icon with event handler
   * @param {Object} item - Item data
   * @param {string} section - Section type
   * @returns {HTMLElement} Delete icon element
   */
  createDeleteIcon(item, section) {
    const utils = window.VRCXExtended.Utils;
    const config = window.VRCXExtended.Config;
    
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'el-icon-delete card-delete';
    deleteIcon.title = 'Delete';
    
    deleteIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to delete "' + item.name + '"?')) {
        const storageKey = section === 'plugins' ? config.KEYS.PLUGINS : config.KEYS.THEMES;
        const allItems = utils.readJSON(storageKey, []);
        const index = allItems.findIndex(x => x.id === item.id);
        
        if (index !== -1) {
          allItems.splice(index, 1);
          utils.writeJSON(storageKey, allItems);
          
          // Refresh the view and apply changes
          window.VRCXExtended.PopupManager.renderCurrentSection();
          
          let refreshSuccess = true;
          try {
            if (section === 'plugins' && window.opener?.$app?.refreshVrcxPlugins) {
              window.opener.$app.refreshVrcxPlugins();
            }
            if (section === 'themes' && window.opener?.$app?.refreshVrcxThemes) {
              window.opener.$app.refreshVrcxThemes();
            }
          } catch (refreshError) {
            console.warn('Failed to refresh after deletion:', refreshError);
            refreshSuccess = false;
          }
          
          // Show deletion notification
          const itemType = section === 'plugins' ? 'Plugin' : 'Theme';
          const message = refreshSuccess 
            ? `${itemType} <strong>${utils.escapeHtml(item.name)}</strong> deleted successfully`
            : `${itemType} <strong>${utils.escapeHtml(item.name)}</strong> deleted (refresh may be needed)`;
          
          utils.showNotification(message, refreshSuccess ? 'success' : 'warning');
        }
      }
    });

    return deleteIcon;
  },

  /**
   * Create settings icon with event handler
   * @param {Object} item - Item data
   * @returns {HTMLElement} Settings icon element
   */
  createSettingsIcon(item) {
    const settingsIcon = document.createElement('i');
    settingsIcon.className = 'el-icon-setting card-settings';
    settingsIcon.title = 'Edit';
    settingsIcon.addEventListener('click', () => {
      window.VRCXExtended.Editor.openEditor(item);
    });
    return settingsIcon;
  },

  /**
   * Create toggle switch with event handler
   * @param {Object} item - Item data
   * @param {string} section - Section type
   * @returns {HTMLElement} Toggle switch element
   */
  createToggleSwitch(item, section) {
    const utils = window.VRCXExtended.Utils;
    const config = window.VRCXExtended.Config;
    
    const label = document.createElement('label');
    label.className = 'switch';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!item.enabled;
    
    const slider = document.createElement('span');
    slider.className = 'slider';
    
    label.appendChild(checkbox);
    label.appendChild(slider);

    checkbox.addEventListener('change', () => {
      const storageKey = section === 'plugins' ? config.KEYS.PLUGINS : config.KEYS.THEMES;
      const allItems = utils.readJSON(storageKey, []);
      const index = allItems.findIndex(x => x.id === item.id);
      
      if (index !== -1) {
        allItems[index].enabled = checkbox.checked;
        allItems[index].updatedAt = utils.nowIso();
        utils.writeJSON(storageKey, allItems);
        
        // Apply immediately
        let applySuccess = true;
        try {
          if (section === 'plugins' && window.opener?.$app?.refreshVrcxPlugins) {
            window.opener.$app.refreshVrcxPlugins();
          }
          if (section === 'themes' && window.opener?.$app?.refreshVrcxThemes) {
            window.opener.$app.refreshVrcxThemes();
          }
        } catch (applyError) {
          console.warn('Failed to apply changes:', applyError);
          applySuccess = false;
        }
        
        // Show toggle notification
        const itemType = section === 'plugins' ? 'Plugin' : 'Theme';
        utils.showNotification(item.name, itemType, checkbox.checked, applySuccess);
      }
    });

    return label;
  },

  /**
   * Render the settings section
   * @param {HTMLElement} listElement - Container element
   */
  renderSettings(listElement) {
    const utils = window.VRCXExtended.Utils;
    
    // Use DocumentFragment for efficient DOM construction
    const fragment = document.createDocumentFragment();
    
    // Settings container with full width
    const settingsContainer = document.createElement('div');
    settingsContainer.style.gridColumn = '1 / -1'; // Span all columns
    settingsContainer.style.maxWidth = '600px';
    settingsContainer.style.margin = '0 auto';
    
    // Storage Management Section
    const storageCard = document.createElement('div');
    storageCard.className = 'card';
    
    const storageTitle = document.createElement('div');
    storageTitle.className = 'card-title';
    storageTitle.innerHTML = '<h3 style="margin: 0; color: var(--text-2, hsl(38, 47%, 80%));">Storage Management</h3>';
    
    const storageContent = document.createElement('div');
    storageContent.style.display = 'flex';
    storageContent.style.flexDirection = 'column';
    storageContent.style.gap = '12px';
    
    // Storage info
    const storageInfo = document.createElement('div');
    storageInfo.className = 'muted';
    storageInfo.textContent = 'Reset all plugins and themes data. This action cannot be undone.';
    
    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn';
    resetBtn.style.backgroundColor = 'var(--red-2, #ea6962)';
    resetBtn.style.borderColor = 'var(--red-2, #ea6962)';
    resetBtn.style.color = 'var(--text-0, #282828)';
    resetBtn.style.alignSelf = 'flex-start';
    resetBtn.textContent = '⚠️ Reset All Data';
    
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all VRCX Mods data?\\n\\nThis will permanently delete all your plugins and themes. This action cannot be undone.')) {
        // Clear all stored data
        window.opener.localStorage.removeItem('vrcx_mm_plugins');
        window.opener.localStorage.removeItem('vrcx_mm_themes');
        
        // Refresh the main app to remove any injected content
        if (window.opener?.$app?.refreshVrcxAll) {
          window.opener.$app.refreshVrcxAll();
        }
        
        utils.showSuccessNotification('All VRCX-Extended data has been reset successfully');
        
        // Refresh the current view if we're on plugins/themes
        window.VRCXExtended.PopupManager.renderCurrentSection();
      }
    });
    
    // Build the DOM structure efficiently
    storageContent.appendChild(storageInfo);
    storageContent.appendChild(resetBtn);
    storageCard.appendChild(storageTitle);
    storageCard.appendChild(storageContent);
    settingsContainer.appendChild(storageCard);
    fragment.appendChild(settingsContainer);
    
    // Single DOM update
    listElement.innerHTML = '';
    listElement.appendChild(fragment);
  }
};
