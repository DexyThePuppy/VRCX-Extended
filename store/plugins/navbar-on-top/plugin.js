//
// ==PLUGIN==
// @name         Navbar on Top
// @description  Moves the navbar to the top of the app.
// @creator      VRCX Community
// @dateCreated  2025-08-26T10:30:00Z
// @dateUpdated  2025-08-26T10:30:00Z
// ==PLUGIN==
//

// Navbar on Top Plugin
(function() {
  'use strict';
  
  console.log('Navbar on Top plugin loaded!');
  
  // Configuration
  const config = {
    navbarClass: '.x-menu-container',
    appClass: '.x-app',
    asideClass: '.x-aside-container',
    mainContentClass: '.x-main-container',
    transitionDuration: '300ms'
  };
  
  // Plugin state
  let isInitialized = false;
  let originalStyles = {};
  let navbarElement = null;
  let appElement = null;
  let asideElement = null;
  
  /**
   * Initialize the plugin
   */
  function init() {
    if (isInitialized) return;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    // Find required elements
    navbarElement = document.querySelector(config.navbarClass);
    appElement = document.querySelector(config.appClass);
    asideElement = document.querySelector(config.asideClass);
    
    if (!navbarElement || !appElement) {
      console.warn('Navbar on Top: Required elements not found, retrying...');
      setTimeout(init, 1000);
      return;
    }
    
    // Store original styles
    storeOriginalStyles();
    
    // Apply navbar modifications
    moveNavbarToTop();
    
    // Add CSS styles
    addStyles();
    
    // Set up observers for dynamic content
    setupObservers();
    
    // Fix tooltip positioning for existing menu items
    setTimeout(fixTooltipPositioning, 50);
    
    isInitialized = true;
    console.log('Navbar on Top plugin initialized successfully!');
  }
  
  /**
   * Store original styles for potential restoration
   */
  function storeOriginalStyles() {
    originalStyles.navbar = {
      position: navbarElement.style.position,
      top: navbarElement.style.top,
      left: navbarElement.style.left,
      width: navbarElement.style.width,
      height: navbarElement.style.height,
      transform: navbarElement.style.transform,
      zIndex: navbarElement.style.zIndex
    };
    
    originalStyles.app = {
      display: appElement.style.display,
      flexDirection: appElement.style.flexDirection,
      alignItems: appElement.style.alignItems
    };
    
    if (asideElement) {
      originalStyles.aside = {
        marginTop: asideElement.style.marginTop,
        height: asideElement.style.height
      };
    }
  }
  
  /**
   * Move navbar to the top of the application
   */
  function moveNavbarToTop() {
    // Move navbar outside of app container to the top
    if (navbarElement.parentNode === appElement) {
      appElement.parentNode.insertBefore(navbarElement, appElement);
    }
    
    // Apply navbar styles for top positioning
    navbarElement.style.setProperty('position', 'fixed', 'important');
    navbarElement.style.setProperty('top', '0', 'important');
    navbarElement.style.setProperty('left', '0', 'important');
    navbarElement.style.setProperty('width', '100%', 'important');
    navbarElement.style.setProperty('height', '60px', 'important');
    navbarElement.style.setProperty('z-index', '1000', 'important');
    
          // Modify navbar menu to be horizontal
      const menuElement = navbarElement.querySelector('.el-menu');
      if (menuElement) {
        menuElement.style.setProperty('display', 'flex', 'important');
        menuElement.style.setProperty('flex-direction', 'row', 'important');
        menuElement.style.setProperty('align-items', 'center', 'important');
        menuElement.style.setProperty('height', '100%', 'important');
        menuElement.style.setProperty('padding', '0 0px', 'important');
        menuElement.style.setProperty('margin', '0', 'important');
      
      // Make menu items horizontal
      const menuItems = menuElement.querySelectorAll('.el-menu-item');
      menuItems.forEach(item => {
        item.style.setProperty('display', 'flex', 'important');
        item.style.setProperty('align-items', 'center', 'important');
        item.style.setProperty('justify-content', 'center', 'important');
        item.style.setProperty('height', '100%', 'important');
        item.style.setProperty('min-width', '60px', 'important');
        item.style.setProperty('padding', '0 0px', 'important');
        item.style.setProperty('margin', '0', 'important');
        
        // Adjust icon positioning
        const icon = item.querySelector('i');
        if (icon) {
          icon.style.setProperty('margin-right', '0', 'important');
        }
      });
    }
    
    // Adjust app container to account for top navbar
    appElement.style.setProperty('margin-top', '60px', 'important');
    appElement.style.setProperty('min-height', 'calc(100vh - 60px)', 'important');
    
    // Adjust aside container if it exists
    if (asideElement) {
      asideElement.style.setProperty('margin-top', '0', 'important');
      asideElement.style.setProperty('height', 'calc(100vh - 60px)', 'important');
    }
  }
  
  /**
   * Add CSS styles for the top navbar
   */
  function addStyles() {
    const styleId = 'navbar-on-top-styles';
    
    // Remove existing styles if they exist
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Navbar on Top Plugin Styles */
      .x-menu-container {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 60px !important;
        z-index: 1000 !important;
      }
      
      .x-menu-container .el-menu {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        height: 100% !important;
        padding: 0 0px !important;
        margin: 0 !important;
      }
      
      .el-menu-item:before {
        display: none !important;
      }
      
      .x-menu-container .el-menu-item {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 100% !important;
        min-width: 60px !important;
        padding: 0 0px !important;
        margin: 0 !important;
      }
      
      .x-menu-container .el-menu-item i {
        margin-right: 0 !important;
      }
      
      .x-app {
        margin-top: 60px !important;
        height: calc(100vh - 60px) !important;
      }
      
      .x-aside-container {
        margin-top: 0 !important;
        height: calc(100vh - 60px) !important;
      }
      
      /* Hide tooltips that appear on the right side */
      .el-tooltip__popper[x-placement^='right'] {
        display: none !important;
      }
    `;
    
    document.head.appendChild(style);
  }
  
    /**
   * Fix tooltip positioning for top navbar
   */
  function fixTooltipPositioning() {
    // Set up a global observer to catch all tooltip creations and attribute changes
    const tooltipObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && 
                node.classList && 
                node.classList.contains('el-tooltip__popper')) {
              
              // Fix the tooltip positioning
              const trigger = document.querySelector('.el-menu-item');
              if (trigger) {
                const rect = trigger.getBoundingClientRect();
                const tooltipRect = node.getBoundingClientRect();
                
                // Position tooltip below the menu item
                const left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                const top = rect.bottom + 8;
                
                node.style.setProperty('left', left + 'px', 'important');
                node.style.setProperty('top', top + 'px', 'important');
                node.style.setProperty('transform', 'none', 'important');
                node.style.setProperty('transform-origin', 'top center', 'important');
                node.setAttribute('x-placement', 'bottom');
                
                // Fix arrow positioning
                const arrow = node.querySelector('.popper__arrow');
                if (arrow) {
                  arrow.style.setProperty('top', '-4px', 'important');
                  arrow.style.setProperty('left', '50%', 'important');
                  arrow.style.setProperty('transform', 'translateX(-50%)', 'important');
                  arrow.style.setProperty('right', 'auto', 'important');
                  arrow.style.setProperty('bottom', 'auto', 'important');
                }
              }
            }
          });
        } else if (mutation.type === 'attributes' && 
                   mutation.attributeName === 'aria-hidden' &&
                   mutation.target.classList.contains('el-tooltip__popper')) {
          
          // Tooltip visibility changed
          if (mutation.target.getAttribute('aria-hidden') === 'false') {
            const trigger = document.querySelector('.el-menu-item:hover, .el-menu-item:focus');
            if (trigger) {
              const rect = trigger.getBoundingClientRect();
              const tooltipRect = mutation.target.getBoundingClientRect();
              
              // Position tooltip below the menu item
              const left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
              const top = rect.bottom + 8;
              
              mutation.target.style.setProperty('left', left + 'px', 'important');
              mutation.target.style.setProperty('top', top + 'px', 'important');
              mutation.target.style.setProperty('transform', 'none', 'important');
              mutation.target.style.setProperty('transform-origin', 'top center', 'important');
              mutation.target.setAttribute('x-placement', 'bottom');
              
              // Fix arrow positioning
              const arrow = mutation.target.querySelector('.popper__arrow');
              if (arrow) {
                arrow.style.setProperty('top', '-4px', 'important');
                arrow.style.setProperty('left', '50%', 'important');
                arrow.style.setProperty('transform', 'translateX(-50%)', 'important');
                arrow.style.setProperty('right', 'auto', 'important');
                arrow.style.setProperty('bottom', 'auto', 'important');
              }
            }
          }
        }
      });
    });
    
    // Observe the body for tooltip additions and attribute changes
    tooltipObserver.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['aria-hidden'] 
    });
  }
  
  /**
   * Set up observers for dynamic content changes
   */
  function setupObservers() {
    // Observe for new menu items being added
    const menuObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('el-menu-item')) {
                             // Apply styles to new menu items
               node.style.setProperty('display', 'flex', 'important');
               node.style.setProperty('align-items', 'center', 'important');
               node.style.setProperty('justify-content', 'center', 'important');
               node.style.setProperty('height', '100%', 'important');
               node.style.setProperty('min-width', '60px', 'important');
               node.style.setProperty('padding', '0 15px', 'important');
               node.style.setProperty('margin', '0', 'important');
               
               const icon = node.querySelector('i');
               if (icon) {
                 icon.style.setProperty('margin-right', '0', 'important');
               }
              
              // Fix tooltip positioning for new items
              setTimeout(fixTooltipPositioning, 50);
            }
          });
        }
      });
    });
    
    const menuElement = navbarElement.querySelector('.el-menu');
    if (menuElement) {
      menuObserver.observe(menuElement, { childList: true, subtree: true });
    }
    
    // Initial tooltip fix
    setTimeout(fixTooltipPositioning, 100);
    
    // Continuously fix tooltip positioning for navbar items
    setInterval(() => {
      // Check for any visible tooltip
      const tooltip = document.querySelector('.el-tooltip__popper[aria-hidden="false"]');
      if (tooltip) {
        // Check if there's a hovered menu item
        const trigger = document.querySelector('.el-menu-item:hover, .el-menu-item:focus');
        if (trigger) {
          // Check if the tooltip has wrong placement or needs fixing
          const currentPlacement = tooltip.getAttribute('x-placement');
          const currentTransformOrigin = tooltip.style.transformOrigin;
          
          // Fix if placement is wrong or transform origin is incorrect
          if (currentPlacement !== 'bottom' || currentTransformOrigin !== 'top center') {
            const rect = trigger.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            // Position tooltip below the menu item
            const left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            const top = rect.bottom + 8;
            
            tooltip.style.setProperty('left', left + 'px', 'important');
            tooltip.style.setProperty('top', top + 'px', 'important');
            tooltip.style.setProperty('transform', 'none', 'important');
            tooltip.style.setProperty('transform-origin', 'top center', 'important');
            tooltip.setAttribute('x-placement', 'bottom');
            
            // Fix arrow positioning
            const arrow = tooltip.querySelector('.popper__arrow');
            if (arrow) {
              arrow.style.setProperty('top', '-4px', 'important');
              arrow.style.setProperty('left', '50%', 'important');
              arrow.style.setProperty('transform', 'translateX(-50%)', 'important');
              arrow.style.setProperty('right', 'auto', 'important');
              arrow.style.setProperty('bottom', 'auto', 'important');
            }
          }
        }
      }
    }, 16); // ~60fps for smooth positioning
  }
  

  
  // Initialize when script loads
  init();
  
  // Expose init function for potential plugin management
  window.NavbarOnTopPlugin = {
    init
  };
  
})();