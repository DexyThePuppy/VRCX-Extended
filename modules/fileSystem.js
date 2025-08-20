// ==Module==
// @name         VRCX-Extended File System
// @description  Complete file system operations for VRCX plugins and themes
// ==Module==

/**
 * Complete File System Module for VRCX-Extended
 * Handles all file system operations and popup integration
 */
window.VRCXExtended = window.VRCXExtended || {};

window.VRCXExtended.FileSystem = {
  /**
   * Base paths for VRCX directories
   */
  PATHS: {
    PLUGINS: 'file://vrcx/plugins/',
    THEMES: 'file://vrcx/themes/'
  },

  /**
   * Initialize file system integration
   */
  init() {
    console.log('🔧 Initializing File System...');
    
    // Wait for popup manager to be available
    if (window.VRCXExtended.PopupManager) {
      this.enhancePopupManager();
    } else {
      // Wait for popup manager to load
      setTimeout(() => this.init(), 100);
    }
  },

  /**
   * Read a file from VRCX directory
   * @param {string} path - File path relative to VRCX directory
   * @returns {Promise<string>} File contents
   */
  async readFile(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Failed to read file:', path, error);
      throw error;
    }
  },

  /**
   * Write a file to VRCX directory
   * @param {string} path - File path relative to VRCX directory
   * @param {string} content - File content to write
   * @returns {Promise<boolean>} Success status
   */
  async writeFile(path, content) {
    try {
      const response = await fetch(path, {
        method: 'PUT',
        body: content,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to write file:', path, error);
      throw error;
    }
  },

  /**
   * Delete a file from VRCX directory
   * @param {string} path - File path relative to VRCX directory
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(path) {
    try {
      const response = await fetch(path, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete file:', path, error);
      throw error;
    }
  },

  /**
   * List files in a VRCX directory
   * @param {string} basePath - Base path (PLUGINS or THEMES)
   * @returns {Promise<Array>} Array of file information
   */
  async listFiles(basePath) {
    try {
      const response = await fetch(basePath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const files = [];
      const links = doc.querySelectorAll('a[href]');
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('../') && !href.startsWith('./')) {
          const fileName = href.replace(/\/$/, ''); // Remove trailing slash
          if (fileName && fileName !== '') {
            files.push({
              name: fileName,
              path: basePath + fileName,
              isDirectory: href.endsWith('/')
            });
          }
        }
      });
      
      return files;
    } catch (error) {
      console.error('Failed to list files:', basePath, error);
      throw error;
    }
  },

  /**
   * Get file extension based on type
   * @param {string} type - 'plugin' or 'theme'
   * @returns {string} File extension
   */
  getFileExtension(type) {
    return type === 'plugin' ? '.js' : '.css';
  },

  /**
   * Create a new plugin file
   * @param {string} name - Plugin name
   * @param {string} content - Plugin content
   * @returns {Promise<boolean>} Success status
   */
  async createPlugin(name, content) {
    const fileName = this.sanitizeFileName(name) + '.js';
    const filePath = this.PATHS.PLUGINS + fileName;
    
    return await this.writeFile(filePath, content);
  },

  /**
   * Create a new theme file
   * @param {string} name - Theme name
   * @param {string} content - Theme content
   * @returns {Promise<boolean>} Success status
   */
  async createTheme(name, content) {
    const fileName = this.sanitizeFileName(name) + '.css';
    const filePath = this.PATHS.THEMES + fileName;
    
    return await this.writeFile(filePath, content);
  },

  /**
   * Update an existing file
   * @param {string} path - Full file path
   * @param {string} content - New content
   * @returns {Promise<boolean>} Success status
   */
  async updateFile(path, content) {
    return await this.writeFile(path, content);
  },

  /**
   * Check if file exists
   * @param {string} path - File path
   * @returns {Promise<boolean>} Exists status
   */
  async fileExists(path) {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Get file info (name, path, type)
   * @param {string} path - Full file path
   * @returns {Object} File information
   */
  getFileInfo(path) {
    const fileName = path.split('/').pop();
    const name = fileName.replace(/\.(js|css)$/, '');
    const type = path.endsWith('.js') ? 'plugin' : 'theme';
    
    return {
      name,
      fileName,
      path,
      type
    };
  },

  /**
   * Enhance the popup manager with file system capabilities
   */
  enhancePopupManager() {
    const pm = window.VRCXExtended.PopupManager;
    
    // Add file system methods to popup manager
    pm.listVrcxFiles = this.listVrcxFiles.bind(this);
    pm.mergeFileData = this.mergeFileData.bind(this);
    pm.sanitizeFileName = this.sanitizeFileName.bind(this);
    pm.saveToFileSystem = this.saveToFileSystem.bind(this);
    pm.deleteFromFileSystem = this.deleteFromFileSystem.bind(this);
    pm.readFile = this.readFile.bind(this);
    pm.writeFile = this.writeFile.bind(this);
    pm.deleteFile = this.deleteFile.bind(this);
    pm.listFiles = this.listFiles.bind(this);
    pm.createPlugin = this.createPlugin.bind(this);
    pm.createTheme = this.createTheme.bind(this);
    pm.updateFile = this.updateFile.bind(this);
    pm.fileExists = this.fileExists.bind(this);
    pm.getFileInfo = this.getFileInfo.bind(this);
    
    // Override renderList to include file system
    const originalRenderList = pm.renderList;
    pm.renderList = async function(section) {
      const list = document.getElementById('list');
      
      try {
        // Show loading state
        list.innerHTML = '<div class="muted">Loading files...</div>';
        
        // Get files from VRCX directory
        const basePath = section === 'plugins' ? 'file://vrcx/plugins/' : 'file://vrcx/themes/';
        const files = await this.listVrcxFiles(basePath);
        
        // Also get data from localStorage for additional metadata
        const storageKey = section === 'plugins' ? window.VRCXExtended.Config.KEYS.PLUGINS : window.VRCXExtended.Config.KEYS.THEMES;
        const storedData = this.readJSON(storageKey, []);
        
        // Merge file system data with stored metadata
        const mergedData = this.mergeFileData(files, storedData, section);
        
        // Use simplified UI rendering
        this.simpleRenderList(mergedData, section, list);
      } catch (error) {
        console.error('Failed to load files:', error);
        list.innerHTML = '<div class="muted">Failed to load files. Using local storage only.</div>';
        
        // Fallback to localStorage only
        const storageKey = section === 'plugins' ? window.VRCXExtended.Config.KEYS.PLUGINS : window.VRCXExtended.Config.KEYS.THEMES;
        const data = this.readJSON(storageKey, []);
        this.simpleRenderList(data, section, list);
      }
    };

    // Override save functionality to include file system
    const originalOpenSimpleEditor = pm.openSimpleEditor;
    pm.openSimpleEditor = function(item) {
      const editor = originalOpenSimpleEditor.call(this, item);
      
      // Enhance save button to include file system
      const saveBtn = document.querySelector('.modal-footer .btn.primary');
      if (saveBtn) {
        const originalClick = saveBtn.onclick;
        saveBtn.onclick = async function() {
          // Call original save logic
          if (originalClick) {
            originalClick.call(this);
          }
          
          // Add file system save
          const nameInput = document.getElementById('editor-name-input');
          const textarea = document.getElementById('editor-textarea');
          const section = pm.getSection();
          
          if (nameInput && textarea) {
            const name = nameInput.value.trim();
            const code = textarea.value;
            const isPlugin = section === 'plugins';
            
            try {
              await pm.saveToFileSystem(name, code, isPlugin);
              console.log('✅ Saved to file system successfully');
            } catch (error) {
              console.warn('⚠️ File system save failed:', error);
            }
          }
        };
      }
      
      return editor;
    };

    console.log('✅ File System Integration enhanced popup manager');
  },

  /**
   * List files from VRCX directory
   * @param {string} basePath - Base path for plugins or themes
   * @returns {Promise<Array>} Array of file information
   */
  async listVrcxFiles(basePath) {
    try {
      const response = await fetch(basePath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const files = [];
      const links = doc.querySelectorAll('a[href]');
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('../') && !href.startsWith('./')) {
          const fileName = href.replace(/\/$/, ''); // Remove trailing slash
          if (fileName && fileName !== '' && (fileName.endsWith('.js') || fileName.endsWith('.css'))) {
            files.push({
              name: fileName.replace(/\.(js|css)$/, ''),
              fileName: fileName,
              path: basePath + fileName,
              isFile: true
            });
          }
        }
      });
      
      return files;
    } catch (error) {
      console.error('Failed to list VRCX files:', basePath, error);
      throw error;
    }
  },

  /**
   * Merge file system data with stored metadata
   * @param {Array} files - Files from file system
   * @param {Array} storedData - Data from localStorage
   * @param {string} section - Section type (plugins/themes)
   * @returns {Array} Merged data
   */
  mergeFileData(files, storedData, section) {
    const merged = [];
    
    // Add files from file system
    files.forEach(file => {
      const storedItem = storedData.find(item => 
        item.fileName === file.fileName || item.name === file.name
      );
      
      if (storedItem) {
        // Merge with stored metadata
        merged.push({
          ...storedItem,
          path: file.path,
          fileName: file.fileName,
          exists: true
        });
      } else {
        // Create new item from file
        merged.push({
          id: this.uid ? this.uid() : 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36),
          name: file.name,
          fileName: file.fileName,
          path: file.path,
          description: `Imported ${section.slice(0, -1)} from file system`,
          enabled: true,
          createdAt: this.nowIso ? this.nowIso() : new Date().toISOString(),
          updatedAt: this.nowIso ? this.nowIso() : new Date().toISOString(),
          exists: true
        });
      }
    });
    
    // Add stored items that don't exist as files (legacy support)
    storedData.forEach(storedItem => {
      const exists = merged.some(item => item.id === storedItem.id);
      if (!exists) {
        merged.push({
          ...storedItem,
          exists: false
        });
      }
    });
    
    return merged.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  },

  /**
   * Save content to file system
   * @param {string} name - File name
   * @param {string} content - File content
   * @param {boolean} isPlugin - Whether it's a plugin or theme
   * @returns {Promise<boolean>} Success status
   */
  async saveToFileSystem(name, content, isPlugin) {
    const basePath = isPlugin ? 'file://vrcx/plugins/' : 'file://vrcx/themes/';
    const extension = isPlugin ? '.js' : '.css';
    const fileName = this.sanitizeFileName(name) + extension;
    const filePath = basePath + fileName;
    
    try {
      const response = await fetch(filePath, {
        method: 'PUT',
        body: content,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save to file system:', filePath, error);
      throw error;
    }
  },

  /**
   * Delete file from file system
   * @param {string} path - File path
   * @returns {Promise<boolean>} Success status
   */
  async deleteFromFileSystem(path) {
    try {
      const response = await fetch(path, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete from file system:', path, error);
      throw error;
    }
  },

  /**
   * Sanitize filename for safe file creation
   * @param {string} name - Original name
   * @returns {string} Sanitized name
   */
  sanitizeFileName(name) {
    return name
      .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .toLowerCase();
  }
};

// Auto-initialize when module loads
window.VRCXExtended.FileSystem.init();

console.log('🔧 VRCX-Extended File System ready');
