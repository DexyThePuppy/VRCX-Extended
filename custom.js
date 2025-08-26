// ==Module==
// @name         VRCX-Extended Modular Loader
// @namespace    http://tampermonkey.net/
// @version      5.1
// @description  VRCX-Extended modular system - minimal loader for future-proofing
// @author       AI
// @match        *://*/*
// @grant        none
// ==Module==

/**
 * Minimal VRCX-Extended Loader
 * Loads the module system and then delegates all advanced functionality to modules
 */
(function() {
    'use strict';

    // System information
    const SYSTEM_INFO = {
        version: '5.1.1',
        loadedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
    };

    console.log('[VRCX-Extended] 🚀 VRCX-Extended Minimal Loader v' + SYSTEM_INFO.version);
    console.log('[VRCX-Extended] 📅 Loaded at:', SYSTEM_INFO.loadedAt);
    console.log('[VRCX-Extended] 🌐 URL:', SYSTEM_INFO.url);

    // Configuration
    const CONFIG = {
        baseUrl: 'https://raw.githubusercontent.com/DexyThePuppy/VRCX-Extended/refs/heads/main/modules/',
        moduleSystemFile: 'modules.js',
        timeout: 15000,
        // Debug mode configuration
        debugMode: false, // Set to true to enable debug mode (or use the settings UI)
        localDebugPaths: {
            modules: 'file://vrcx/extended/modules',
            html: 'file://vrcx/extended/html',
            stylesheets: 'file://vrcx/extended/stylesheet'
        }
    };

    /**
     * Get the appropriate module system URL based on debug mode
     * @returns {string} URL for the module system
     */
    function getModuleSystemUrl() {
        // Check localStorage for debug mode setting first, then fall back to CONFIG
        let isDebugMode = CONFIG.debugMode;
        try {
            const storedSettings = localStorage.getItem('vrcx_extended_settings');
            console.log('[VRCX-Extended] 🔧 getModuleSystemUrl - Raw localStorage settings:', storedSettings);
            if (storedSettings) {
                const settings = JSON.parse(storedSettings);
                console.log('[VRCX-Extended] 🔧 getModuleSystemUrl - Parsed localStorage settings:', settings);
                isDebugMode = settings.debugMode || CONFIG.debugMode;
            }
        } catch (error) {
            console.warn('[VRCX-Extended] Failed to read debug mode from localStorage:', error);
        }
        
        console.log('[VRCX-Extended] 🔧 getModuleSystemUrl - Final debug mode value:', isDebugMode);
        
        if (isDebugMode) {
            const localPath = CONFIG.localDebugPaths.modules + '/' + CONFIG.moduleSystemFile;
            console.log(`[VRCX-Extended] 🔧 Debug mode: Loading module system from local path: ${localPath}`);
            return localPath;
        } else {
            const githubUrl = CONFIG.baseUrl + CONFIG.moduleSystemFile;
            console.log(`[VRCX-Extended] 🌐 Production mode: Loading module system from GitHub: ${githubUrl}`);
            return githubUrl;
        }
    }

    /**
     * Simple module loader with fallback - only used to load the module system
     * @param {string} src - Source URL of the script
     * @returns {Promise} Promise that resolves when script is loaded
     */
    async function loadModuleSystem(src) {
        // Check localStorage for debug mode setting first, then fall back to CONFIG
        let isDebugMode = CONFIG.debugMode;
        try {
            const storedSettings = localStorage.getItem('vrcx_extended_settings');
            if (storedSettings) {
                const settings = JSON.parse(storedSettings);
                isDebugMode = settings.debugMode || CONFIG.debugMode;
            }
        } catch (error) {
            console.warn('[VRCX-Extended] Failed to read debug mode from localStorage:', error);
        }
        
        let fallbackSrc = null;
        
        // If in debug mode and this is a GitHub URL, prepare local fallback
        if (isDebugMode && src.includes('raw.githubusercontent.com')) {
            fallbackSrc = CONFIG.localDebugPaths.modules + '/' + CONFIG.moduleSystemFile;
        }
        
        // If in debug mode and this is a local file, prepare GitHub fallback
        if (isDebugMode && src.startsWith('file://')) {
            fallbackSrc = CONFIG.baseUrl + CONFIG.moduleSystemFile;
        }
        
        try {
            console.log(`[VRCX-Extended] 📡 Loading module system: ${src}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(src, {
                mode: 'cors',
                cache: 'no-cache',
                signal: controller.signal,
                headers: {
                    'Accept': 'text/plain, text/javascript, application/javascript, */*'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const content = await response.text();
            
            if (!content.trim()) {
                throw new Error('Empty module system content');
            }

            // Execute the module system
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.textContent = content + `\n//# sourceURL=${src}`;
            document.head.appendChild(script);
            
            console.log('[VRCX-Extended] ✓ Module system loaded');
            
        } catch (error) {
            // If we have a fallback source, try it
            if (fallbackSrc) {
                console.warn(`[VRCX-Extended] ⚠️ Failed to load module system from ${src}, trying fallback: ${fallbackSrc}`);
                console.warn(`[VRCX-Extended] Error: ${error.message}`);
                
                try {
                    console.log(`[VRCX-Extended] 📡 Loading module system from fallback: ${fallbackSrc}`);
                    
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);
                    
                    const response = await fetch(fallbackSrc, {
                        mode: 'cors',
                        cache: 'no-cache',
                        signal: controller.signal,
                        headers: {
                            'Accept': 'text/plain, text/javascript, application/javascript, */*'
                        }
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const content = await response.text();
                    
                    if (!content.trim()) {
                        throw new Error('Empty module system content from fallback');
                    }

                    // Execute the module system from fallback
                    const script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.textContent = content + `\n//# sourceURL=${fallbackSrc}`;
                    document.head.appendChild(script);
                    
                    console.log('[VRCX-Extended] ✓ Module system loaded from fallback');
                    
                    // Show notification about fallback if possible
                    if (typeof Noty !== 'undefined') {
                        const fallbackType = fallbackSrc.includes('raw.githubusercontent.com') ? 'GitHub' : 'local files';
                        new Noty({
                            type: 'warning',
                            text: `Module system loaded from ${fallbackType} fallback`,
                            timeout: 5000
                        }).show();
                    }
                    
                    return;
                    
                } catch (fallbackError) {
                    console.error(`[VRCX-Extended] ✗ Failed to load module system from fallback: ${fallbackSrc}`, fallbackError.message);
                    throw new Error(`Failed to load module system from both ${src} and fallback ${fallbackSrc}: ${error.message}`);
                }
            }
            
            console.error('[VRCX-Extended] ❌ Failed to load module system:', error);
            throw error;
        }
    }

    /**
     * Initialize debug settings if debug mode is enabled
     */
    function initializeDebugSettings() {
        // Check localStorage for debug mode setting first, then fall back to CONFIG
        let isDebugMode = CONFIG.debugMode;
        try {
            const storedSettings = localStorage.getItem('vrcx_extended_settings');
            console.log('[VRCX-Extended] 🔧 Raw localStorage settings:', storedSettings);
            if (storedSettings) {
                const settings = JSON.parse(storedSettings);
                console.log('[VRCX-Extended] 🔧 Parsed localStorage settings:', settings);
                isDebugMode = settings.debugMode || CONFIG.debugMode;
            }
        } catch (error) {
            console.warn('[VRCX-Extended] Failed to read debug mode from localStorage:', error);
        }
        
        console.log('[VRCX-Extended] 🔧 Final debug mode value:', isDebugMode);
        
        // Always initialize the Config object so it's available to the module system
        if (!window.VRCXExtended) {
            window.VRCXExtended = {};
        }
        
        if (!window.VRCXExtended.Config) {
            console.log('[VRCX-Extended] 🔧 Creating temporary Config object with debug mode:', isDebugMode);
            window.VRCXExtended.Config = {
                getSetting: (key) => {
                    if (key === 'debugMode') return isDebugMode;
                    if (key === 'localDebugPaths') return CONFIG.localDebugPaths;
                    return null;
                },
                getSettings: () => ({
                    debugMode: isDebugMode,
                    localDebugPaths: CONFIG.localDebugPaths
                })
            };
        } else {
            console.log('[VRCX-Extended] 🔧 Config object already exists, debug mode:', isDebugMode);
        }
        
        if (isDebugMode) {
            console.log('[VRCX-Extended] 🔧 Debug mode enabled - initializing local file paths...');
            console.log('[VRCX-Extended] 🔧 Debug settings initialized:', {
                debugMode: isDebugMode,
                localPaths: CONFIG.localDebugPaths
            });
        }
    }

    /**
     * Main initialization with retry logic
     */
    async function main() {
        try {
            // Wait for DOM
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            console.log('[VRCX-Extended] 📦 Starting VRCX-Extended...');
            
            // Initialize debug settings if enabled
            initializeDebugSettings();
            
            // Load module system with retries
            let retryCount = 0;
            const maxRetries = 2;
            
            while (retryCount <= maxRetries) {
                try {
                    const moduleSystemUrl = getModuleSystemUrl();
                    await loadModuleSystem(moduleSystemUrl);
                    break;
                } catch (loadError) {
                    retryCount++;
                    if (retryCount <= maxRetries) {
                        console.warn(`[VRCX-Extended] ⚠️ Module system load attempt ${retryCount} failed, retrying...`);
                        await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
                    } else {
                        throw new Error(`Module system failed after ${maxRetries} retries: ${loadError.message}`);
                    }
                }
            }

            // Check if module system loaded
            if (!window.VRCXExtended?.ModuleSystem) {
                throw new Error('Module system not available after loading');
            }

            console.log('[VRCX-Extended] ✓ Module system ready');
            
            // Small delay for initialization
            await new Promise(resolve => setTimeout(resolve, 100));

            // Delegate to module system for advanced loading
            const moduleSystem = window.VRCXExtended.ModuleSystem;
            const loadResult = await moduleSystem.loadAllModules();
            
            // Check for critical failures
            if (loadResult.criticalFailures && loadResult.criticalFailures.length > 0) {
                throw new Error(`Critical modules failed: ${loadResult.criticalFailures.join(', ')}`);
            }
            
            // Initialize the system
            await new Promise(resolve => setTimeout(resolve, 200));
            const initSuccess = await moduleSystem.initializeSystem();
            
            if (!initSuccess) {
                console.warn('[VRCX-Extended] ⚠️ System initialization had issues, but may still function');
                if (typeof Noty !== 'undefined') {
                    new Noty({
                        type: 'warning',
                        text: '⚠️ VRCX-Extended loaded with some issues',
                        timeout: 5000
                    }).show();
                }
            } else {
                // Verify Noty is available for global use
                if (typeof Noty !== 'undefined') {
                    console.log('[VRCX-Extended] 🎯 Noty is now globally available - you can use: new Noty({type: "success", text: "Hello!"}).show()');
                } else {
                    console.log('[VRCX-Extended] ⚠️ Noty not globally available - use VRCXExtended.Utils methods instead');
                }
            }
            
        } catch (error) {
            console.error('[VRCX-Extended] ❌ VRCX-Extended startup failed:', error);
            
            // Show error notification
            if (typeof Noty !== 'undefined') {
                new Noty({
                    type: 'error',
                    text: `[VRCX-Extended] ❌ VRCX-Extended failed to load: ${error.message}`,
                    timeout: 8000,
                    closeWith: ['click', 'button'],
                    buttons: [
                        Noty.button('Troubleshoot', 'btn btn-primary btn-sm', function() {
                            const userMessage = `VRCX-Extended failed to load.

Error: ${error.message}

Troubleshooting:
1. Check your internet connection
2. Refresh the page and try again
3. Check browser console for detailed errors
4. Disable other userscripts temporarily

If the problem persists, please report this issue with the error details from the console.`;
                            
                            alert(userMessage);
                            this.close();
                        })
                    ]
                }).show();
            } else {
                // Fallback alert
                alert(`[VRCX-Extended] VRCX-Extended failed to load: ${error.message}\n\nCheck the console for details.`);
            }
        }
    }

    /**
     * Initialize with timeout protection
     */
    function init() {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Startup timed out after ${CONFIG.timeout}ms`));
            }, CONFIG.timeout);
        });

        Promise.race([main(), timeoutPromise]).catch(error => {
            console.error('❌ VRCX-Extended startup failed or timed out:', error);
        });
    }

    // Start the system
    init();

})();
