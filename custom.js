// ==UserScript==
// @name         VRCX-Extended Modular Loader
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  VRCX-Extended modular system - dynamically loads modules from GitHub
// @author       AI
// @match        *://*/*
// @grant        none
// ==UserScript==

/**
 * Main entry point for VRCX-Extended
 * Dynamically loads all modules and orchestrates initialization
 */
(function() {
    'use strict';

    // System information
    const SYSTEM_INFO = {
        version: '5.0',
        loadedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
    };

    console.log('🚀 VRCX-Extended Modular Loader v' + SYSTEM_INFO.version);
    console.log('📅 Loaded at:', SYSTEM_INFO.loadedAt);
    console.log('🌐 URL:', SYSTEM_INFO.url);

    // Module loading configuration
    const MODULE_CONFIG = {
        // Base URL for GitHub raw content
        baseUrl: 'https://raw.githubusercontent.com/DexyThePuppy/VRCX-Extended/refs/heads/main/modules/',
        
        // Module load order (dependencies first)
        modules: [
            'config.js',
            'utils.js',
            'injection.js',
            'ui.js',
            'editor.js',
            'popup.js'
        ],
        
        // Timeout for module loading (ms)
        timeout: 15000
    };

    /**
     * Dynamically load a JavaScript file
     * @param {string} src - Source URL/path of the script
     * @returns {Promise} Promise that resolves when script is loaded
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                console.log(`⚡ Module already loaded: ${src}`);
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.type = 'text/javascript';
            script.crossOrigin = 'anonymous'; // Allow cross-origin loading
            
            // Set timeout for individual script loading
            const timeout = setTimeout(() => {
                script.remove();
                reject(new Error(`Timeout loading ${src}`));
            }, 10000);
            
            script.onload = () => {
                clearTimeout(timeout);
                console.log(`✓ Loaded module: ${src}`);
                resolve();
            };
            
            script.onerror = (error) => {
                clearTimeout(timeout);
                script.remove();
                console.error(`✗ Failed to load module: ${src}`, error);
                reject(new Error(`Failed to load ${src}`));
            };

            // Add to document head
            document.head.appendChild(script);
        });
    }

    /**
     * Load all modules sequentially
     * @returns {Promise} Promise that resolves when all modules are loaded
     */
    async function loadAllModules() {
        console.log('🔄 Loading VRCX-Extended modules from GitHub...');
        console.log(`📍 Base URL: ${MODULE_CONFIG.baseUrl}`);
        
        const loadedModules = [];
        const failedModules = [];
        
        try {
            // Load modules in order
            for (const moduleName of MODULE_CONFIG.modules) {
                const moduleUrl = MODULE_CONFIG.baseUrl + moduleName;
                console.log(`📥 Loading module: ${moduleUrl}`);
                
                try {
                    await loadScript(moduleUrl);
                    loadedModules.push(moduleName);
                    
                    // Small delay between modules to ensure proper initialization
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (moduleError) {
                    console.warn(`⚠️ Failed to load module ${moduleName}:`, moduleError);
                    failedModules.push(moduleName);
                    
                    // Continue loading other modules instead of failing completely
                    continue;
                }
            }
            
            if (failedModules.length === 0) {
                console.log('✅ All VRCX-Extended modules loaded successfully');
            } else {
                console.warn(`⚠️ Loaded ${loadedModules.length}/${MODULE_CONFIG.modules.length} modules. Failed: ${failedModules.join(', ')}`);
            }
            
            return { success: failedModules.length === 0, loadedModules, failedModules };
            
        } catch (error) {
            console.error('❌ Critical error during module loading:', error);
            throw error;
        }
    }

    /**
     * Validate that all required modules are available
     * @returns {boolean} True if all modules are loaded
     */
    function validateModules() {
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
    }

    /**
     * Initialize VRCX-Extended system
     */
    function initializeSystem() {
        if (!validateModules()) {
            return;
        }

        const { Config, Utils, Injection, UI } = window.VRCXExtended;

        try {
            console.log('🚀 Initializing VRCX-Extended system...');
            
            // 1. Initialize injection system (sets up API and applies existing content)
            Injection.init();
            console.log('✓ Injection system initialized');
            
            // 2. Initialize UI and menu integration
            UI.initMenuIntegration();
            console.log('✓ UI system initialized');
            
            // Log successful initialization
            Utils.safeConsoleLog('log', '🎉 VRCX-Extended initialized successfully');
            Utils.safeConsoleLog('info', 'All modules loaded and system is ready');
            
        } catch (error) {
            console.error('❌ VRCX-Extended initialization failed:', error);
        }
    }

    /**
     * Main initialization sequence
     */
    async function main() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            console.log('📦 Starting VRCX-Extended Modular System...');
            
            // Load all modules
            const loadResult = await loadAllModules();
            
            if (!loadResult.success) {
                console.warn(`⚠️ Some modules failed to load. Attempting to continue with available modules...`);
            }
            
            // Small delay to ensure modules are fully initialized
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Initialize the system
            initializeSystem();
            
        } catch (error) {
            console.error('❌ VRCX-Extended startup failed:', error);
            
            // Fallback: show user-friendly error
            if (typeof alert !== 'undefined') {
                alert('VRCX-Extended failed to load. Please check the console for details.');
            }
        }
    }

    /**
     * Timeout wrapper for module loading
     */
    function mainWithTimeout() {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Module loading timed out after ${MODULE_CONFIG.timeout}ms`));
            }, MODULE_CONFIG.timeout);
        });

        Promise.race([main(), timeoutPromise]).catch(error => {
            console.error('❌ VRCX-Extended startup failed or timed out:', error);
        });
    }

    // Start the initialization process
    mainWithTimeout();

})();
