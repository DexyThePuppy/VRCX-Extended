// ==UserScript==
// @name         VRCX-Extended Main
// @description  Main orchestrator for VRCX-Extended modular system
// ==UserScript==

/**
 * Main entry point for VRCX-Extended
 * Dynamically loads all modules and orchestrates initialization
 */
(function() {
    'use strict';

    // Module loading configuration
    const MODULE_CONFIG = {
        // Base path for modules (relative to this script)
        basePath: '',
        
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
        timeout: 10000
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
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.type = 'text/javascript';
            
            script.onload = () => {
                console.log(`✓ Loaded module: ${src}`);
                resolve();
            };
            
            script.onerror = (error) => {
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
        console.log('🔄 Loading VRCX-Extended modules...');
        
        try {
            // Load modules in order
            for (const moduleName of MODULE_CONFIG.modules) {
                const modulePath = MODULE_CONFIG.basePath + moduleName;
                await loadScript(modulePath);
                
                // Small delay between modules to ensure proper initialization
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            console.log('✅ All VRCX-Extended modules loaded successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to load VRCX-Extended modules:', error);
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
            await loadAllModules();
            
            // Small delay to ensure modules are fully initialized
            await new Promise(resolve => setTimeout(resolve, 100));
            
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
