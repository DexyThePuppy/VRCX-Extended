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
      // Load external resources if not cached
      if (!this.externalResources) {
        console.log('📋 Loading external resources for popup...');
        this.externalResources = await window.VRCXExtended.ModuleSystem.loadExternalResources();
      }

      const html = this.processHTML(this.externalResources.html, this.externalResources.css);
    win.document.write(html);
    win.document.close();
    } catch (error) {
      console.error('❌ Failed to build popup window:', error);
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
    const config = window.VRCXExtended.Config;
    
    return `
(function(){
  'use strict';

  // Storage interop (uses opener's localStorage)
  const KEYS = ${JSON.stringify(config.KEYS)};

  // Create the popup manager
  window.VRCXExtended = window.VRCXExtended || {};
  
  window.VRCXExtended.PopupManager = {
    getSection() { 
      return document.querySelector('.sidebar .menu-item.active')?.dataset.section || 'plugins'; 
    },
    
    setSection(sec) {
      document.querySelectorAll('.sidebar .menu-item').forEach(mi => 
        mi.classList.toggle('active', mi.dataset.section === sec)
      );
      
      const titles = {
        'plugins': 'Plugins',
        'themes': 'Themes', 
        'settings': 'Settings'
      };
      document.getElementById('sectionTitle').textContent = titles[sec] || 'Unknown';
      
      // Show/hide create button based on section
      const createBtn = document.getElementById('createBtn');
      createBtn.style.display = (sec === 'plugins' || sec === 'themes') ? 'inline-flex' : 'none';
      
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
        case 'settings':
          this.renderSettings();
          break;
        default:
          list.innerHTML = '<div class="muted">Unknown section</div>';
      }
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

      const title = document.createElement('div');
      title.className = 'card-title';

      const name = document.createElement('div');
      name.className = 'name';
      name.title = item.name;
      name.textContent = item.name || '(untitled)';

      const actions = document.createElement('div');
      actions.className = 'card-actions';

      const deleteIcon = document.createElement('i');
      deleteIcon.className = 'el-icon-delete card-delete';
      deleteIcon.title = 'Delete';
      deleteIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete "' + item.name + '"?')) {
          const storageKey = section === 'plugins' ? KEYS.PLUGINS : KEYS.THEMES;
          const allItems = this.readJSON(storageKey, []);
          const index = allItems.findIndex(x => x.id === item.id);
          
          if (index !== -1) {
            allItems.splice(index, 1);
            this.writeJSON(storageKey, allItems);
            this.renderCurrentSection();
            
            if (section === 'plugins' && window.opener?.$app?.refreshVrcxPlugins) {
              window.opener.$app.refreshVrcxPlugins();
            }
            if (section === 'themes' && window.opener?.$app?.refreshVrcxThemes) {
              window.opener.$app.refreshVrcxThemes();
            }
          }
        }
      });

      const settingsIcon = document.createElement('i');
      settingsIcon.className = 'el-icon-setting card-settings';
      settingsIcon.title = 'Edit';
      settingsIcon.addEventListener('click', () => this.openSimpleEditor(item));

      actions.appendChild(deleteIcon);
      actions.appendChild(settingsIcon);
      title.appendChild(name);
      title.appendChild(actions);

      const description = document.createElement('div');
      description.className = 'card-description';
      if (section === 'plugins') {
        description.textContent = item.description || 'Custom JavaScript plugin for VRCX';
      } else {
        description.textContent = item.description || 'Custom CSS theme for VRCX';
      }

      const bottom = document.createElement('div');
      bottom.className = 'card-bottom';

      const meta = document.createElement('div');
      meta.className = 'muted';
      meta.style.fontSize = '11px';
      meta.textContent = new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString();

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
        const storageKey = section === 'plugins' ? KEYS.PLUGINS : KEYS.THEMES;
        const allItems = this.readJSON(storageKey, []);
        const index = allItems.findIndex(x => x.id === item.id);
        
        if (index !== -1) {
          allItems[index].enabled = checkbox.checked;
          allItems[index].updatedAt = this.nowIso();
          this.writeJSON(storageKey, allItems);
          
          // Show notification for toggle action
          if (window.opener?.VRCXExtended?.Utils?.showNotification) {
            const itemType = section === 'plugins' ? 'Plugin' : 'Theme';
            window.opener.VRCXExtended.Utils.showNotification(
              item.name, 
              itemType, 
              checkbox.checked, 
              true
            );
          }
          
          if (section === 'plugins' && window.opener?.$app?.refreshVrcxPlugins) {
            window.opener.$app.refreshVrcxPlugins();
          }
          if (section === 'themes' && window.opener?.$app?.refreshVrcxThemes) {
            window.opener.$app.refreshVrcxThemes();
          }
        }
      });

      bottom.appendChild(meta);
      bottom.appendChild(label);

      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(bottom);

      return card;
    },

    simpleRenderSettings(listElement) {
      listElement.innerHTML = '';
      
      const settingsContainer = document.createElement('div');
      settingsContainer.style.gridColumn = '1 / -1';
      settingsContainer.style.maxWidth = '600px';
      settingsContainer.style.margin = '0 auto';
      
      // Cache Settings Card
      const cacheCard = document.createElement('div');
      cacheCard.className = 'card';
      cacheCard.style.marginBottom = '20px';
      
      const cacheTitle = document.createElement('div');
      cacheTitle.className = 'card-title';
      cacheTitle.innerHTML = '<h3 style="margin: 0; color: var(--text-2, hsl(38, 47%, 80%));">Cache Settings</h3>';
      
      const cacheContent = document.createElement('div');
      cacheContent.style.display = 'flex';
      cacheContent.style.flexDirection = 'column';
      cacheContent.style.gap = '16px';
      
      // Disable cache toggle
      const cacheToggleContainer = document.createElement('div');
      cacheToggleContainer.style.display = 'flex';
      cacheToggleContainer.style.alignItems = 'center';
      cacheToggleContainer.style.gap = '12px';
      
      const cacheCheckbox = document.createElement('input');
      cacheCheckbox.type = 'checkbox';
      cacheCheckbox.id = 'disableCacheCheckbox';
      cacheCheckbox.style.transform = 'scale(1.2)';
      
      // Get current setting from opener window
      const currentSettings = window.opener?.VRCXExtended?.Config?.getSettings?.() || {};
      cacheCheckbox.checked = currentSettings.disableCache || false;
      
      const cacheLabel = document.createElement('label');
      cacheLabel.htmlFor = 'disableCacheCheckbox';
      cacheLabel.style.cursor = 'pointer';
      cacheLabel.style.userSelect = 'none';
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
      cacheInfo.style.fontSize = '13px';
      cacheInfo.textContent = 'When disabled, modules will always be downloaded fresh instead of using cached versions. Useful for development but slower loading.';
      
      // Clear cache button
      const clearCacheBtn = document.createElement('button');
      clearCacheBtn.className = 'btn';
      clearCacheBtn.style.backgroundColor = 'var(--accent-1, #66b1ff)';
      clearCacheBtn.style.borderColor = 'var(--accent-1, #66b1ff)';
      clearCacheBtn.style.color = 'var(--text-0, #282828)';
      clearCacheBtn.style.alignSelf = 'flex-start';
      clearCacheBtn.textContent = '🗑️ Clear Module Cache';
      
      clearCacheBtn.addEventListener('click', () => {
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
      
      cacheContent.appendChild(cacheToggleContainer);
      cacheContent.appendChild(cacheInfo);
      cacheContent.appendChild(clearCacheBtn);
      cacheCard.appendChild(cacheTitle);
      cacheCard.appendChild(cacheContent);
      
      // Storage Management Card
      const storageCard = document.createElement('div');
      storageCard.className = 'card';
      
      const storageTitle = document.createElement('div');
      storageTitle.className = 'card-title';
      storageTitle.innerHTML = '<h3 style="margin: 0; color: var(--text-2, hsl(38, 47%, 80%));">Storage Management</h3>';
      
      const storageContent = document.createElement('div');
      storageContent.style.display = 'flex';
      storageContent.style.flexDirection = 'column';
      storageContent.style.gap = '12px';
      
      const storageInfo = document.createElement('div');
      storageInfo.className = 'muted';
      storageInfo.textContent = 'Reset all plugins and themes data. This action cannot be undone.';
      
      const resetBtn = document.createElement('button');
      resetBtn.className = 'btn';
      resetBtn.style.backgroundColor = 'var(--red-2, #ea6962)';
      resetBtn.style.borderColor = 'var(--red-2, #ea6962)';
      resetBtn.style.color = 'var(--text-0, #282828)';
      resetBtn.style.alignSelf = 'flex-start';
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
      header.innerHTML = '<strong>'+(item?.id ? 'Edit ' : 'Create ')+(isPlugin?'Plugin':'Theme')+'</strong>';

      const body = document.createElement('div');
      body.className = 'modal-body';

      const field = document.createElement('div');
      field.className = 'field';
      
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
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn ghost';
      cancelBtn.textContent = 'Cancel';
      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn primary';
      saveBtn.textContent = 'Save';

      footer.appendChild(cancelBtn);
      footer.appendChild(saveBtn);

      modal.appendChild(header);
      modal.appendChild(body);
      modal.appendChild(footer);
      backdrop.appendChild(modal);
      root.appendChild(backdrop);

      // Initialize CodeMirror
      let editor = null;
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
          
          setTimeout(() => {
            if (editor) {
              editor.refresh();
              editor.setSize('100%', '100%');
              editor.focus();
            }
          }, 50);
          
        } catch (error) {
          console.error('CodeMirror initialization error:', error);
        }
      }, 100);

      const closeEditor = () => {
        if (editor) {
          try {
            editor.toTextArea();
          } catch(e) {
            console.warn('Error disposing CodeMirror:', e);
          }
        }
        root.style.display = 'none';
        root.innerHTML = '';
      };

      cancelBtn.addEventListener('click', closeEditor);
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeEditor(); });

      saveBtn.addEventListener('click', () => {
        const storageKey = isPlugin ? KEYS.PLUGINS : KEYS.THEMES;
        const data = this.readJSON(storageKey, []);
        const name = nameInput.value.trim() || (isPlugin? 'Untitled Plugin' : 'Untitled Theme');
        const description = descriptionInput.value.trim();
        
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
            data[index].code = code;
            data[index].updatedAt = this.nowIso();
          }
        } else {
          data.push({
            id: this.uid(),
            name,
            description,
            code,
            enabled: true,
            createdAt: this.nowIso(),
            updatedAt: this.nowIso(),
          });
        }

        this.writeJSON(storageKey, data);
        
        if (isPlugin && window.opener?.$app?.refreshVrcxPlugins) {
          window.opener.$app.refreshVrcxPlugins();
        }
        if (!isPlugin && window.opener?.$app?.refreshVrcxThemes) {
          window.opener.$app.refreshVrcxThemes();
        }

        closeEditor();
        this.renderCurrentSection();
      });
      
      modal.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          saveBtn.click();
        }
        if (e.key === 'Escape') {
          closeEditor();
        }
      });
    },

    renderCurrentSection() {
      this.renderContent(this.getSection());
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

  // Apply Material 3 theme
  document.body.className = 'x-container theme-material3';

  // Initial render
  window.VRCXExtended.PopupManager.setSection('plugins');
  
  console.log('VRCX-Extended popup initialized successfully');
})();
    `;
  }
};
