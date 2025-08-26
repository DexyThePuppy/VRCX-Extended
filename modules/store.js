// ==Module==
// @name         VRCX-Extended Store Manager
// @description  Handles fetching and parsing store data for plugins and themes
// ==Module==

/**
 * Store management module for VRCX-Extended
 * Handles fetching, caching, and parsing of store data
 */
window.VRCXExtended = window.VRCXExtended || {};

window.VRCXExtended.Store = {
  /**
   * Fetch store data for a specific type (plugins or themes)
   * @param {string} type - 'plugins' or 'themes'
   * @param {boolean} forceRefresh - Force refresh even if cache is valid
   * @returns {Promise<Array>} Promise that resolves to store data array
   */
  async fetchStoreData(type, forceRefresh = false) {
    const config = window.VRCXExtended.Config;
    const utils = window.VRCXExtended.Utils;
    
    // Debug logging for store URL selection
    const settings = config.getSettings();
    utils.safeConsoleLog('log', `🔧 [Store] Debug mode: ${settings.debugMode}`);
    utils.safeConsoleLog('log', `🔧 [Store] Disable cache: ${settings.disableCache}`);
    utils.safeConsoleLog('log', `🔧 [Store] Local debug paths:`, settings.localDebugPaths);
    
    try {
      // Check cache first (unless force refresh is requested)
      if (!forceRefresh && config.isStoreCacheValid(type)) {
        const cachedData = config.getStoreCache(type);
        if (cachedData) {
          utils.safeConsoleLog('log', `📦 [Store] Using cached ${type} data`);
          return cachedData;
        }
      }

      // Get appropriate URL based on debug mode
      const url = config.getStoreUrl(type);
      utils.safeConsoleLog('log', `📦 [Store] Fetching ${type} from:`, url);

      // Fetch data from URL
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate data structure
      if (!Array.isArray(data)) {
        throw new Error(`Invalid data format: expected array, got ${typeof data}`);
      }

      // Process and validate each item
      const processedData = data.map(item => this.processStoreItem(item, type));
      const validatedData = processedData.filter(item => this.validateStoreItem(item, type));
      
      if (validatedData.length !== data.length) {
        utils.safeConsoleLog('warn', `⚠️ [Store] Filtered out ${data.length - validatedData.length} invalid ${type} items`);
      }

      // Cache the validated data
      config.setStoreCache(type, validatedData);
      
      utils.safeConsoleLog('log', `✅ [Store] Successfully loaded ${validatedData.length} ${type}`);
      return validatedData;

    } catch (error) {
      utils.safeConsoleLog('error', `❌ [Store] Failed to fetch ${type}:`, error);
      
      // Try to return cached data even if expired
      const cachedData = config.getStoreCache(type);
      if (cachedData) {
        utils.safeConsoleLog('log', `📦 [Store] Using expired cached ${type} data as fallback`);
        return cachedData;
      }
      
      throw error;
    }
  },

  /**
   * Process a store item to convert relative paths to full URLs
   * @param {Object} item - Store item to process
   * @param {string} type - 'plugins' or 'themes'
   * @returns {Object} Processed item with full URLs
   */
  processStoreItem(item, type) {
    const config = window.VRCXExtended.Config;
    const settings = config.getSettings();
    const isDebugMode = settings.debugMode || false;
    
    // Create a copy of the item to avoid modifying the original
    const processedItem = { ...item };
    
    // Convert relative thumbnail path to full URL
    if (processedItem.thumbnail && !this.isValidUrl(processedItem.thumbnail)) {
      if (isDebugMode) {
        // For debug mode, use local file path
        processedItem.thumbnail = `file://vrcx/extended/store/${type}/${processedItem.thumbnail}`;
      } else {
        // For production, use GitHub URL
        processedItem.thumbnail = `${config.STORE.GITHUB.BASE_URL}/store/${type}/${processedItem.thumbnail}`;
      }
    }
    
    return processedItem;
  },

  /**
   * Validate a store item has required fields
   * @param {Object} item - Store item to validate
   * @param {string} type - 'plugins' or 'themes'
   * @returns {boolean} True if item is valid
   */
  validateStoreItem(item, type) {
    const requiredFields = ['name', 'description', 'creator', 'dateCreated', 'dateUpdated', 'filename', 'thumbnail'];
    
    // Check all required fields exist
    for (const field of requiredFields) {
      if (!item.hasOwnProperty(field)) {
        const utils = window.VRCXExtended.Utils;
        utils.safeConsoleLog('warn', `⚠️ [Store] Item missing required field '${field}':`, item);
        return false;
      }
    }



    // Validate dates
    if (!this.isValidDate(item.dateCreated) || !this.isValidDate(item.dateUpdated)) {
      const utils = window.VRCXExtended.Utils;
      utils.safeConsoleLog('warn', `⚠️ [Store] Item has invalid dates:`, item);
      return false;
    }

    // Validate thumbnail URL (after processing, should be a valid URL)
    if (!item.thumbnail || !this.isValidUrl(item.thumbnail)) {
      const utils = window.VRCXExtended.Utils;
      utils.safeConsoleLog('warn', `⚠️ [Store] Item has invalid thumbnail URL:`, item.thumbnail);
      return false;
    }

    return true;
  },

  /**
   * Check if a string is a valid date
   * @param {string} dateString - Date string to validate
   * @returns {boolean} True if valid date
   */
  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },

  /**
   * Check if a string is a valid URL
   * @param {string} url - URL string to validate
   * @returns {boolean} True if valid URL
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Sort store items by update date (newest first)
   * @param {Array} items - Array of store items
   * @returns {Array} Sorted array
   */
  sortByUpdated(items) {
    return items.slice().sort((a, b) => {
      const dateA = new Date(a.dateUpdated);
      const dateB = new Date(b.dateUpdated);
      return dateB - dateA;
    });
  },

  /**
   * Filter store items by search term
   * @param {Array} items - Array of store items
   * @param {string} searchTerm - Search term to filter by
   * @returns {Array} Filtered array
   */
  filterBySearch(items, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      return items;
    }

    const term = searchTerm.toLowerCase().trim();
    
    return items.filter(item => {
      return item.name.toLowerCase().includes(term) ||
             item.description.toLowerCase().includes(term) ||
             item.creator.toLowerCase().includes(term);
    });
  },

  /**
   * Get store statistics
   * @param {Array} items - Array of store items
   * @returns {Object} Statistics object
   */
  getStats(items) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recent = items.filter(item => new Date(item.dateUpdated) > oneWeekAgo);
    const monthly = items.filter(item => new Date(item.dateUpdated) > oneMonthAgo);

    return {
      total: items.length,
      recent: recent.length,
      monthly: monthly.length,
      creators: [...new Set(items.map(item => item.creator))].length
    };
  },

  /**
   * Clear store cache for a specific type or all types
   * @param {string} type - 'plugins', 'themes', or 'all'
   */
  clearCache(type = 'all') {
    const config = window.VRCXExtended.Config;
    const utils = window.VRCXExtended.Utils;
    
    if (type === 'all') {
      localStorage.removeItem(config.getStoreCacheKey('plugins'));
      localStorage.removeItem(config.getStoreCacheKey('themes'));
      utils.safeConsoleLog('log', '🗑️ [Store] Cleared all store cache');
    } else {
      localStorage.removeItem(config.getStoreCacheKey(type));
      utils.safeConsoleLog('log', `🗑️ [Store] Cleared ${type} cache`);
    }
  },

  /**
   * Get cache status for store data
   * @returns {Object} Cache status object
   */
  getCacheStatus() {
    const config = window.VRCXExtended.Config;
    const settings = config.getSettings();
    
    return {
      plugins: {
        cached: config.isStoreCacheValid('plugins'),
        disabled: settings.disableCache,
        debugMode: settings.debugMode
      },
      themes: {
        cached: config.isStoreCacheValid('themes'),
        disabled: settings.disableCache,
        debugMode: settings.debugMode
      }
    };
  }
};
