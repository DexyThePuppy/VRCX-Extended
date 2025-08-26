//
// ==PLUGIN==
// @name         User Profile Card Background
// @description  Creates background divs with avatar images for friend items using the card-bg class.
// @creator      SocialVR Labs
// @dateCreated  2025-08-26T11:45:00Z
// @dateUpdated  2025-08-26T13:30:00Z
// ==PLUGIN==
//

// User Profile Card Background Plugin
(function() {
  'use strict';
  
  console.log('User Profile Card Background plugin loaded!');
  
  // Inject CSS styles
  function injectCSS() {
    const cssContent = `
      /* User Profile Card Background Plugin Styles */
      .x-friend-item.card-bg {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
        z-index: 1;
      }

      .x-friend-item.card-bg::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.15;
        border-radius: inherit;
        background-image: var(--avatar-bg-image);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        mask: linear-gradient(to right, transparent 0%, rgba(255,255,255,1) 100%);
        -webkit-mask: linear-gradient(to right, transparent 0%, rgba(255,255,255,1) 100%);
        border-radius: 12px;
      }


    `;
    
    const style = document.createElement('style');
    style.setAttribute('data-vrcxmods', 'plugin');
    style.id = 'vrcx-plugin-user-profile-card-bg-css';
    style.textContent = cssContent;
    document.head.appendChild(style);
  }
  
  // Function to add background styling to friend item
  function createCardBackground(friendItem) {
    // Find the avatar image within the friend item
    const avatarImg = friendItem.querySelector('.avatar img');
    
    if (!avatarImg) {
      return;
    }
    
    // Check if card-bg class already exists to avoid duplicates
    if (friendItem.classList.contains('card-bg')) {
      return;
    }
    
    // Add the card-bg class to the friend item
    friendItem.classList.add('card-bg');
    
    // Set the background image URL as a CSS custom property for the ::before pseudo-element
    friendItem.style.setProperty('--avatar-bg-image', `url(${avatarImg.src})`);
    
    // Store the current image URL for comparison
    friendItem.setAttribute('data-current-avatar-url', avatarImg.src);
    
    // Add gap to parent container
    addGapToParent(friendItem);
  }
  
  // Function to add gap styling to parent containers
  function addGapToParent(friendItem) {
    const parent = friendItem.parentElement;
    if (parent) {
      parent.style.gap = '3px';
      parent.style.display = 'flex';
      parent.style.flexDirection = 'column';
      parent.setAttribute('data-vrcx-gap-added', 'true');
    }
  }
  
  // Function to check and update image URLs
  function checkImageUpdates() {
    const friendItems = document.querySelectorAll('.x-friend-item.card-bg');
    
    friendItems.forEach(friendItem => {
      const avatarImg = friendItem.querySelector('.avatar img');
      if (!avatarImg) return;
      
      const currentUrl = friendItem.getAttribute('data-current-avatar-url');
      const newUrl = avatarImg.src;
      
      // If the URL has changed, update the background
      if (currentUrl !== newUrl) {
        friendItem.style.setProperty('--avatar-bg-image', `url(${newUrl})`);
        friendItem.setAttribute('data-current-avatar-url', newUrl);
        console.log('Updated avatar background for friend item:', newUrl);
      }
    });
  }
  
  // Function to process all existing friend items
  function processExistingFriendItems() {
    const friendItems = document.querySelectorAll('.x-friend-item');
    friendItems.forEach(createCardBackground);
    
    // Also process parent containers for existing items
    friendItems.forEach(addGapToParent);
  }
  
  // Function to observe DOM changes and process new friend items
  function observeFriendItems() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node is an element
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the node itself is a friend item
            if (node.classList && node.classList.contains('x-friend-item')) {
              createCardBackground(node);
            }
            
            // Check for friend items within the added node
            const friendItems = node.querySelectorAll ? node.querySelectorAll('.x-friend-item') : [];
            friendItems.forEach(createCardBackground);
          }
        });
      });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Initialize the plugin
  function init() {
    // Inject CSS styles first
    injectCSS();
    
    // Process existing friend items
    processExistingFriendItems();
    
    // Set up observer for new friend items
    observeFriendItems();
    
    // Set up periodic check for image URL changes
    setInterval(checkImageUpdates, 500);
    
    console.log('User Profile Card Background plugin initialized!');
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();