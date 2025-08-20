// ==Module==
// @name         VRCX-Extended Code Editor
// @description  CodeMirror-based code editor for VRCX-Extended
// ==Module==

/**
 * Code editor module for VRCX-Extended
 * Handles CodeMirror integration and modal editor functionality
 */
window.VRCXExtended = window.VRCXExtended || {};

window.VRCXExtended.Editor = {
  currentEditor: null,

  /**
   * Open the code editor modal
   * @param {Object|null} item - Item to edit (null for new item)
   */
  openEditor(item) {
    const config = window.VRCXExtended.Config;
    const utils = window.VRCXExtended.Utils;
    
    const section = window.VRCXExtended.PopupManager.getSection();
    const isPlugin = section === 'plugins';

    const root = document.getElementById('modalRoot');
    root.style.display = 'block';
    root.innerHTML = '';
    
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const header = this.createModalHeader(item, isPlugin);
    const body = this.createModalBody(item, isPlugin);
    const footer = this.createModalFooter();

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    backdrop.appendChild(modal);
    root.appendChild(backdrop);

    // Setup event handlers
    this.setupModalEventHandlers(backdrop, modal, item, isPlugin);

    // Initialize CodeMirror after DOM is ready
    setTimeout(() => this.initializeCodeMirror(item, isPlugin), 100);
  },

  /**
   * Create modal header
   * @param {Object|null} item - Item being edited
   * @param {boolean} isPlugin - Whether editing a plugin
   * @returns {HTMLElement} Header element
   */
  createModalHeader(item, isPlugin) {
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `<strong>${item?.id ? 'Edit ' : 'Create '}${isPlugin ? 'Plugin' : 'Theme'}</strong>`;
    return header;
  },

  /**
   * Create modal body with form fields and editor
   * @param {Object|null} item - Item being edited
   * @param {boolean} isPlugin - Whether editing a plugin
   * @returns {HTMLElement} Body element
   */
  createModalBody(item, isPlugin) {
    const config = window.VRCXExtended.Config;
    
    const body = document.createElement('div');
    body.className = 'modal-body';

    // Compact form fields container
    const field = document.createElement('div');
    field.className = 'field';
    
    // Name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = `${isPlugin ? 'Plugin' : 'Theme'} name`;
    nameInput.value = item?.name || '';
    nameInput.id = 'editor-name-input';
    field.appendChild(nameInput);

    // Description input
    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.placeholder = 'Description (optional)';
    descriptionInput.value = item?.description || '';
    descriptionInput.id = 'editor-description-input';
    field.appendChild(descriptionInput);

    // Editor host
    const editorHost = document.createElement('div');
    editorHost.className = 'editor-host';
    
    const textarea = document.createElement('textarea');
    textarea.id = 'editor-textarea';
    textarea.value = item?.code || '';
    editorHost.appendChild(textarea);

    body.appendChild(field);
    body.appendChild(editorHost);

    return body;
  },

  /**
   * Create modal footer with buttons
   * @returns {HTMLElement} Footer element
   */
  createModalFooter() {
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn ghost';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.id = 'editor-cancel-btn';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn primary';
    saveBtn.textContent = 'Save';
    saveBtn.id = 'editor-save-btn';

    footer.appendChild(cancelBtn);
    footer.appendChild(saveBtn);

    return footer;
  },

  /**
   * Setup modal event handlers
   * @param {HTMLElement} backdrop - Modal backdrop
   * @param {HTMLElement} modal - Modal element
   * @param {Object|null} item - Item being edited
   * @param {boolean} isPlugin - Whether editing a plugin
   */
  setupModalEventHandlers(backdrop, modal, item, isPlugin) {
    const cancelBtn = document.getElementById('editor-cancel-btn');
    const saveBtn = document.getElementById('editor-save-btn');

    cancelBtn.addEventListener('click', () => this.closeEditor());
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.closeEditor();
    });

    saveBtn.addEventListener('click', () => this.saveItem(item, isPlugin));

    // Keyboard shortcuts
    modal.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.saveItem(item, isPlugin);
      }
      if (e.key === 'Escape') {
        this.closeEditor();
      }
    });
  },

  /**
   * Initialize CodeMirror editor
   * @param {Object|null} item - Item being edited
   * @param {boolean} isPlugin - Whether editing a plugin
   */
  initializeCodeMirror(item, isPlugin) {
    const config = window.VRCXExtended.Config;
    const textarea = document.getElementById('editor-textarea');
    
    try {
      const editorOptions = {
        ...config.EDITOR.OPTIONS,
        mode: isPlugin ? config.EDITOR.JAVASCRIPT_MODE : config.EDITOR.CSS_MODE,
        autoCloseTags: !isPlugin,
        value: item?.code || ''
      };

      this.currentEditor = CodeMirror.fromTextArea(textarea, editorOptions);
      
      // Force refresh and resize after initialization
      setTimeout(() => {
        if (this.currentEditor) {
          this.currentEditor.refresh();
          this.currentEditor.setSize('100%', '100%');
          this.currentEditor.focus();
        }
      }, 50);
      
    } catch (error) {
      console.error('CodeMirror initialization error:', error);
      // Show fallback message
      const editorHost = textarea.parentElement;
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'padding: 8px; color: #ff6b6b; font-size: 12px;';
      errorDiv.textContent = 'CodeMirror failed to load. You can still edit in the textarea below.';
      editorHost.insertBefore(errorDiv, textarea);
    }
  },

  /**
   * Save the current item
   * @param {Object|null} item - Item being edited
   * @param {boolean} isPlugin - Whether editing a plugin
   */
  saveItem(item, isPlugin) {
    const config = window.VRCXExtended.Config;
    const utils = window.VRCXExtended.Utils;
    
    const nameInput = document.getElementById('editor-name-input');
    const descriptionInput = document.getElementById('editor-description-input');
    const textarea = document.getElementById('editor-textarea');

    const name = nameInput.value.trim() || (isPlugin ? 'Untitled Plugin' : 'Untitled Theme');
    const description = descriptionInput.value.trim();
    
    // Get code value safely
    let code = '';
    if (this.currentEditor) {
      try {
        code = this.currentEditor.getValue();
      } catch (e) {
        console.warn('Error getting CodeMirror value:', e);
        code = textarea.value; // fallback to textarea value
      }
    } else {
      code = textarea.value;
    }

    const storageKey = isPlugin ? config.KEYS.PLUGINS : config.KEYS.THEMES;
    const data = utils.readJSON(storageKey, []);

    if (item?.id) {
      // Update existing item
      const index = data.findIndex(x => x.id === item.id);
      if (index !== -1) {
        data[index].name = name;
        data[index].description = description;
        data[index].code = code;
        data[index].updatedAt = utils.nowIso();
      }
    } else {
      // Create new item
      data.push({
        id: utils.uid(),
        name,
        description,
        code,
        enabled: true,
        createdAt: utils.nowIso(),
        updatedAt: utils.nowIso(),
      });
    }

    utils.writeJSON(storageKey, data);

    // Apply changes immediately
    if (isPlugin && window.opener?.$app?.refreshVrcxPlugins) {
      window.opener.$app.refreshVrcxPlugins();
    }
    if (!isPlugin && window.opener?.$app?.refreshVrcxThemes) {
      window.opener.$app.refreshVrcxThemes();
    }

    this.closeEditor();
    window.VRCXExtended.PopupManager.renderCurrentSection();
    
    // Show save notification
    const itemType = isPlugin ? 'Plugin' : 'Theme';
    const actionText = item?.id ? 'updated' : 'created';
    utils.showSuccessNotification(itemType + ' <strong>' + utils.escapeHtml(name) + '</strong> ' + actionText + ' successfully!');
  },

  /**
   * Close the editor modal
   */
  closeEditor() {
    // Dispose of CodeMirror instance properly
    if (this.currentEditor) {
      try {
        // Remove all event listeners
        this.currentEditor.off();
        // Convert back to textarea and remove
        this.currentEditor.toTextArea();
        this.currentEditor = null;
      } catch (e) {
        console.warn('Error disposing CodeMirror:', e);
        this.currentEditor = null;
      }
    }
    
    const root = document.getElementById('modalRoot');
    if (root) {
      // Remove all event listeners from the modal content before clearing
      const modal = root.querySelector('.modal');
      if (modal) {
        // Clone the modal to remove all event listeners
        const clonedModal = modal.cloneNode(true);
        root.innerHTML = '';
      } else {
        root.innerHTML = '';
      }
      root.style.display = 'none';
    }
  }
};
