// ==Module==
// @name         VRCX-Extended Module System
// @description  Advanced module loading and management system for VRCX-Extended
// ==Module==

/**
 * VRCX-Extended Module System
 * Contains module list, advanced loading logic, caching, parallel loading, and initialization
 */
window.VRCXExtended = window.VRCXExtended || {};

window.VRCXExtended.ModuleSystem = {
    // Module configuration and dependencies
    config: {
        // Base repository configuration
        repository: {
            baseUrl: 'https://raw.githubusercontent.com/DexyThePuppy/VRCX-Extended/refs/heads/main',
            paths: {
                modules: 'modules',
                html: 'html',
                stylesheets: 'stylesheet'
            }
        },
        
        // Module dependency groups for parallel loading
        dependencyGroups: [
            ['config.js', 'utils.js'], // Core dependencies (parallel)
            ['injection.js'],           // Injection system
            ['ui.js', 'editor.js'],    // UI components (parallel)
            ['popup.js']               // Popup (depends on all above)
        ],
        
        // External resources (HTML/CSS)
        externalResources: {
            html: 'popup.html',
            css: 'popup.css'
        },
        
        // Cache configuration
        cache: {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            version: '5.1'
        },
        
        // Loading timeouts
        timeout: {
            fetch: 10000,
            total: 15000
        }
    },

    // Runtime state
    state: {
        loadingNotification: null,
        loadedModules: [],
        failedModules: [],
        criticalModules: ['config.js', 'utils.js']
    },

    /**
     * Build URL for a specific resource type
     * @param {string} type - Resource type ('modules', 'html', 'stylesheets')
     * @param {string} filename - Filename to append
     * @returns {string} Complete URL
     */
    buildUrl(type, filename) {
        const { baseUrl, paths } = this.config.repository;
        return `${baseUrl}/${paths[type]}/${filename}`;
    },

    /**
     * Get module URL
     * @param {string} moduleName - Module filename
     * @returns {string} Complete module URL
     */
    getModuleUrl(moduleName) {
        return this.buildUrl('modules', moduleName);
    },

    /**
     * Get external resource URL
     * @param {string} type - Resource type ('html' or 'css')
     * @returns {string} Complete resource URL
     */
    getResourceUrl(type) {
        const resourceType = type === 'css' ? 'stylesheets' : 'html';
        const filename = this.config.externalResources[type];
        return this.buildUrl(resourceType, filename);
    },

    /**
     * Get cached module content if available and valid
     * @param {string} src - Source URL/path of the script
     * @returns {string|null} Cached content or null if not available/expired
     */
    getCachedModule(src) {
        try {
            const cacheKey = `vrcx_module_${btoa(src).replace(/[^a-zA-Z0-9]/g, '')}`;
            const cached = localStorage.getItem(cacheKey);
            
            if (!cached) return null;
            
            const { content, timestamp, version } = JSON.parse(cached);
            const now = Date.now();
            
            // Check if cache is expired or version mismatch
            if (now - timestamp > this.config.cache.maxAge || version !== this.config.cache.version) {
                localStorage.removeItem(cacheKey);
                return null;
            }
            
            return content;
        } catch (error) {
            console.warn('Cache read error:', error);
            return null;
        }
    },

    /**
     * Cache module content
     * @param {string} src - Source URL/path of the script
     * @param {string} content - Module content to cache
     */
    cacheModule(src, content) {
        try {
            const cacheKey = `vrcx_module_${btoa(src).replace(/[^a-zA-Z0-9]/g, '')}`;
            const cacheData = {
                content,
                timestamp: Date.now(),
                version: this.config.cache.version
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Cache write error:', error);
        }
    },

    /**
     * Load external resource (HTML/CSS) with caching
     * @param {string} src - Source URL/path of the resource
     * @param {string} type - Resource type ('html' or 'css')
     * @returns {Promise<string>} Promise that resolves with resource content
     */
    async loadExternalResource(src, type) {
        try {
            // Try to get from cache first
            let content = this.getCachedModule(src);
            
            if (content) {
                console.log(`💾 Using cached ${type}: ${src}`);
                return content;
            }

            console.log(`📡 Fetching ${type} content: ${src}`);
            
            // Create fetch with timeout
            const fetchWithTimeout = async (url, options, timeoutMs = this.config.timeout.fetch) => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
                
                try {
                    const response = await fetch(url, {
                        ...options,
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);
                    return response;
                } catch (error) {
                    clearTimeout(timeoutId);
                    if (error.name === 'AbortError') {
                        throw new Error(`Request timeout after ${timeoutMs}ms`);
                    }
                    throw error;
                }
            };
            
            // Fetch the content
            const response = await fetchWithTimeout(src, {
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Accept': type === 'html' ? 'text/html, text/plain, */*' : 'text/css, text/plain, */*'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            content = await response.text();
            
            if (!content.trim()) {
                throw new Error(`Empty ${type} content`);
            }

            // Cache the downloaded content
            this.cacheModule(src, content);
            
            console.log(`✓ Loaded ${type}: ${src}`);
            return content;
            
        } catch (error) {
            console.error(`✗ Failed to load ${type}: ${src}`, error.message);
            throw new Error(`Failed to load ${type} ${src}: ${error.message}`);
        }
    },

    /**
     * Dynamically load a JavaScript file by fetching and executing
     * @param {string} src - Source URL/path of the script
     * @returns {Promise} Promise that resolves when script is loaded
     */
    async loadScript(src) {
        try {
            // Check if already loaded
            const existingScript = document.querySelector(`script[data-module-src="${src}"]`);
            if (existingScript) {
                console.log(`⚡ Module already loaded: ${src}`);
                return;
            }

            // Try to get from cache first
            let scriptContent = this.getCachedModule(src);
            
            if (scriptContent) {
                console.log(`💾 Using cached module: ${src}`);
            } else {
                console.log(`📡 Fetching module content: ${src}`);
                
                // Create fetch with timeout
                const fetchWithTimeout = async (url, options, timeoutMs = this.config.timeout.fetch) => {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
                    
                    try {
                        const response = await fetch(url, {
                            ...options,
                            signal: controller.signal
                        });
                        clearTimeout(timeoutId);
                        return response;
                    } catch (error) {
                        clearTimeout(timeoutId);
                        if (error.name === 'AbortError') {
                            throw new Error(`Request timeout after ${timeoutMs}ms`);
                        }
                        throw error;
                    }
                };
                
                // Fetch the script content
                const response = await fetchWithTimeout(src, {
                    mode: 'cors',
                    cache: 'no-cache',
                    headers: {
                        'Accept': 'text/plain, text/javascript, application/javascript, */*'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                scriptContent = await response.text();
                
                if (!scriptContent.trim()) {
                    throw new Error('Empty script content');
                }

                // Cache the downloaded content
                this.cacheModule(src, scriptContent);
            }

            // Create a script element with the content
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.setAttribute('data-module-src', src);
            
            // Add source mapping comment for debugging
            const sourceMap = `\n//# sourceURL=${src}`;
            script.textContent = scriptContent + sourceMap;

            // Add to document head and execute
            document.head.appendChild(script);
            
            // Small delay to allow module to initialize
            await new Promise(resolve => setTimeout(resolve, 50));
            
            console.log(`✓ Loaded and executed module: ${src}`);
            
        } catch (error) {
            console.error(`✗ Failed to load module: ${src}`, error.message);
            throw new Error(`Failed to load ${src}: ${error.message}`);
        }
    },

    /**
     * Load all modules with smart parallel/sequential loading
     * @returns {Promise} Promise that resolves when all modules are loaded
     */
    async loadAllModules() {
        console.log('🔄 Loading VRCX-Extended modules from GitHub...');
        console.log(`📍 Repository: ${this.config.repository.baseUrl}`);
        console.log(`📁 Modules path: ${this.config.repository.paths.modules}`);
        
        // Show loading notification
        this.showLoadingNotification();
        
        this.state.loadedModules = [];
        this.state.failedModules = [];
        
        try {
            // Load each group in sequence, but modules within groups in parallel
            for (const [groupIndex, group] of this.config.dependencyGroups.entries()) {
                console.log(`📦 Loading group ${groupIndex + 1}/${this.config.dependencyGroups.length}: [${group.join(', ')}]`);
                
                // Load all modules in this group in parallel
                const groupPromises = group.map(async (moduleName) => {
                    const moduleUrl = this.getModuleUrl(moduleName);
                    console.log(`📥 Loading module: ${moduleUrl}`);
                    
                    try {
                        await this.loadScript(moduleUrl);
                        this.state.loadedModules.push(moduleName);
                        console.log(`✓ Completed: ${moduleName}`);
                        return { moduleName, success: true };
                    } catch (moduleError) {
                        console.warn(`⚠️ Failed to load module ${moduleName}:`, moduleError);
                        this.state.failedModules.push(moduleName);
                        return { moduleName, success: false, error: moduleError };
                    }
                });
                
                // Wait for all modules in this group to complete
                const groupResults = await Promise.all(groupPromises);
                
                // Small delay between groups to ensure proper initialization
                if (groupIndex < this.config.dependencyGroups.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                
                console.log(`✓ Group ${groupIndex + 1} completed: ${groupResults.filter(r => r.success).length}/${group.length} successful`);
            }
            
            // Determine results
            const totalModules = this.config.dependencyGroups.flat().length;
            const success = this.state.failedModules.length === 0;
            const criticalFailures = this.state.failedModules.filter(m => this.state.criticalModules.includes(m));
            
            // Handle results and notifications
            if (success) {
                console.log('✅ All VRCX-Extended modules loaded successfully');
                this.closeLoadingNotification();
                this.showSuccessNotification();
            } else if (criticalFailures.length > 0) {
                console.error(`❌ Critical modules failed: ${criticalFailures.join(', ')}`);
                this.closeLoadingNotification();
                this.showCriticalErrorNotification(criticalFailures);
            } else {
                console.warn(`⚠️ Loaded ${this.state.loadedModules.length}/${totalModules} modules. Failed: ${this.state.failedModules.join(', ')}`);
                this.closeLoadingNotification();
                this.showPartialFailureNotification();
            }
            
            return { 
                success, 
                loadedModules: this.state.loadedModules, 
                failedModules: this.state.failedModules,
                criticalFailures 
            };
            
        } catch (error) {
            console.error('❌ Critical error during module loading:', error);
            this.closeLoadingNotification();
            this.showLoadErrorNotification(error);
            throw error;
        }
    },

    /**
     * Validate that all required modules are available
     * @returns {boolean} True if all modules are loaded
     */
    validateModules() {
        if (!window.VRCXExtended) {
            console.error('❌ VRCXExtended namespace not found');
            return false;
        }

        const { Config, Utils, Injection, UI, Editor, Popup } = window.VRCXExtended;
        const requiredModules = { Config, Utils, Injection, UI, Popup };
        
        const missingModules = Object.entries(requiredModules)
            .filter(([name, module]) => !module)
            .map(([name]) => name);

        if (missingModules.length > 0) {
            console.error('❌ Missing VRCX-Extended modules:', missingModules.join(', '));
            return false;
        }

        console.log('✅ All required modules validated');
        return true;
    },

    /**
     * Initialize VRCX-Extended system with enhanced error handling
     */
    async initializeSystem() {
        if (!this.validateModules()) {
            return false;
        }

        const { Config, Utils, Injection, UI } = window.VRCXExtended;

        try {
            console.log('🚀 Initializing VRCX-Extended system...');
            
            // 0. Ensure Noty is available for global use
            try {
                console.log('📋 Ensuring Noty library is available...');
                await Utils.ensureNotyAvailable();
                if (typeof Noty !== 'undefined') {
                    console.log('✓ Noty library ready for global use');
                } else {
                    console.warn('⚠️ Noty not available - notifications will use fallback');
                }
            } catch (notyError) {
                console.warn('⚠️ Could not load Noty library:', notyError.message);
                console.warn('⚠️ Notifications will use fallback system');
            }
            
            // 1. Initialize injection system (sets up API and applies existing content)
            try {
                Injection.init();
                console.log('✓ Injection system initialized');
            } catch (injectionError) {
                console.error('❌ Injection system failed to initialize:', injectionError);
                // Continue with degraded functionality
                console.warn('⚠️ Continuing without injection system...');
            }
            
            // 2. Initialize UI and menu integration
            try {
                UI.initMenuIntegration();
                console.log('✓ UI system initialized');
            } catch (uiError) {
                console.error('❌ UI system failed to initialize:', uiError);
                // Try fallback initialization
                try {
                    console.log('🔄 Attempting UI fallback initialization...');
                    setTimeout(() => UI.installNativeMenuItem(), 1000);
                    console.log('✓ UI fallback initialized');
                } catch (fallbackError) {
                    console.error('❌ UI fallback also failed:', fallbackError);
                    console.warn('⚠️ UI features may be limited');
                }
            }
            
            // Set up global error handler for runtime errors
            window.addEventListener('error', (event) => {
                if (event.filename?.includes('vrcx-extended') || event.message?.includes('VRCX')) {
                    console.error('🐛 VRCX-Extended runtime error:', {
                        message: event.message,
                        filename: event.filename,
                        lineno: event.lineno,
                        colno: event.colno,
                        error: event.error
                    });
                    
                    // Try to show user-friendly notification
                    try {
                        if (Utils?.showNotification) {
                            Utils.showNotification('A minor error occurred in VRCX-Extended. Check console for details.', 'error');
                        }
                    } catch (notifError) {
                        // Ignore notification errors
                    }
                }
            });
            
            // Log successful initialization
            Utils.safeConsoleLog('log', '🎉 VRCX-Extended initialized successfully');
            Utils.safeConsoleLog('info', 'All modules loaded and system is ready');
            
            // Show final success notification
            if (typeof Noty !== 'undefined') {
                new Noty({
                    type: 'success',
                    text: '🎉 VRCX-Extended loaded successfully!'
                }).show();
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ VRCX-Extended initialization failed:', error);
            
            // Last resort: try to show basic error message
            try {
                const errorMsg = `VRCX-Extended failed to initialize: ${error.message}`;
                console.error(errorMsg);
                
                // Try multiple notification methods
                if (window.VRCXExtended?.Utils?.showNotification) {
                    window.VRCXExtended.Utils.showNotification(errorMsg, 'error');
                } else if (typeof Noty !== 'undefined') {
                    new Noty({
                        type: 'error',
                        text: errorMsg
                    }).show();
                } else if (typeof alert !== 'undefined') {
                    alert(errorMsg);
                }
            } catch (finalError) {
                console.error('❌ Even error reporting failed:', finalError);
            }
            
            return false;
        }
    },

    // Notification methods
    showLoadingNotification() {
        if (typeof Noty !== 'undefined') {
            this.state.loadingNotification = new Noty({
                type: 'info',
                text: '<i class="fa fa-spinner fa-spin"></i> Loading VRCX-Extended modules...',
                timeout: false,
                closeWith: []
            }).show();
        } else {
            // Try to load Noty if not available
            if (window.VRCXExtended?.Utils?.ensureNotyAvailable) {
                window.VRCXExtended.Utils.ensureNotyAvailable().then(() => {
                    if (typeof Noty !== 'undefined') {
                        this.state.loadingNotification = new Noty({
                            type: 'info',
                            text: '<i class="fa fa-spinner fa-spin"></i> Loading VRCX-Extended modules...',
                            timeout: false,
                            closeWith: []
                        }).show();
                    }
                }).catch(() => {
                    console.log('⏳ Loading VRCX-Extended modules... (Noty not available)');
                });
            }
        }
    },

    closeLoadingNotification() {
        if (this.state.loadingNotification && typeof this.state.loadingNotification.close === 'function') {
            this.state.loadingNotification.close();
            this.state.loadingNotification = null;
        }
    },

    showSuccessNotification() {
        if (typeof Noty !== 'undefined') {
            new Noty({
                type: 'success',
                text: '✅ All VRCX-Extended modules loaded successfully!'
            }).show();
        }
    },

    showPartialFailureNotification() {
        if (typeof Noty !== 'undefined') {
            const totalModules = this.config.dependencyGroups.flat().length;
            new Noty({
                type: 'warning',
                text: `⚠️ Some VRCX-Extended modules failed to load (${this.state.failedModules.length}/${totalModules})`
            }).show();
        }
    },

    showCriticalErrorNotification(criticalFailures) {
        if (typeof Noty !== 'undefined') {
            new Noty({
                type: 'error',
                text: `❌ Critical VRCX-Extended modules failed: ${criticalFailures.join(', ')}`
            }).show();
        }
    },

    /**
     * Load external HTML and CSS resources
     * @returns {Promise<Object>} Promise that resolves with html and css content
     */
    async loadExternalResources() {
        try {
            console.log('📋 Loading external HTML and CSS resources...');
            
            const [htmlContent, cssContent] = await Promise.all([
                this.loadExternalResource(this.getResourceUrl('html'), 'html'),
                this.loadExternalResource(this.getResourceUrl('css'), 'css')
            ]);
            
            console.log('✅ External resources loaded successfully');
            
            return {
                html: htmlContent,
                css: cssContent
            };
        } catch (error) {
            console.error('❌ Failed to load external resources:', error);
            throw error;
        }
    }
};

console.log('🔧 VRCX-Extended Module System ready');
