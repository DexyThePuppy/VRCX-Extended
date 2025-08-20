// ==Module==
// @name         VRCX-Extended File System
// @description  File system operations for VRCX plugins and themes
// ==Module==

/**
 * File system operations for VRCX-Extended
 * Handles reading, writing, and managing files in VRCX directories
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
   * Delete a plugin or theme file
   * @param {string} path - Full file path
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(path) {
    return await this.deleteFile(path);
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
  }
};
