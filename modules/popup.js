// ==UserScript==
// @name         VRCX-Extended Popup Window Manager
// @description  Manages the popup window and its HTML content for VRCX-Extended
// ==UserScript==

/**
 * Popup window management for VRCX-Extended
 * Handles window creation and HTML template generation
 */
window.VRCXExtended = window.VRCXExtended || {};

window.VRCXExtended.Popup = {
  /**
   * Open the manager window
   */
  openManagerWindow() {
    const config = window.VRCXExtended.Config;
    window.open('about:blank', config.UI.POPUP_NAME, config.UI.POPUP_FEATURES);
    setTimeout(() => this.buildManagerWindow(), 100);
  },

  /**
   * Build the manager window with HTML content
   */
  buildManagerWindow() {
    const config = window.VRCXExtended.Config;
    const win = window.open('', config.UI.POPUP_NAME);
    if (!win) return;

    const html = this.generateHTML();
    win.document.write(html);
    win.document.close();
  },

  /**
   * Generate the complete HTML for the popup window
   * @returns {string} Complete HTML document
   */
  generateHTML() {
    const config = window.VRCXExtended.Config;
    
    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>VRCX-Extended</title>

  <!-- Element-UI stylesheet for native look (CSS only; we don't use Vue JS) -->
  <link rel="stylesheet" href="${config.EXTERNAL.ELEMENT_UI_CSS}">

  <!-- CodeMirror -->
  <link rel="stylesheet" href="${config.EXTERNAL.CODEMIRROR.CSS}">
  
  <script src="${config.EXTERNAL.CODEMIRROR.JS}"></script>
  <script src="${config.EXTERNAL.CODEMIRROR.CSS_MODE}"></script>
  <script src="${config.EXTERNAL.CODEMIRROR.JS_MODE}"></script>
  <script src="${config.EXTERNAL.CODEMIRROR.CLOSEBRACKETS}"></script>
  <script src="${config.EXTERNAL.CODEMIRROR.CLOSETAG}"></script>
  <script src="${config.EXTERNAL.CODEMIRROR.MATCHBRACKETS}"></script>
  <script src="${config.EXTERNAL.CODEMIRROR.ACTIVELINE}"></script>

  <style>
    ${this.generateCSS()}
  </style>
</head>
<body class="x-container theme-${config.UI.DEFAULT_THEME}">
  <!-- Hidden toolbar -->
  <div class="toolbar" style="display: none;">
    <button id="refreshAll" class="el-button"><i class="el-icon-refresh"></i> Reload All</button>
    <div class="spacer"></div>
    <span class="muted">VRCX-Extended</span>
  </div>

  <div class="mods-layout">
    <aside class="sidebar">
      <div class="menu-item active" data-section="plugins"><i class="el-icon-document"></i> Plugins</div>
      <div class="menu-item" data-section="themes"><i class="el-icon-brush"></i> Themes</div>
      <div class="menu-item" data-section="settings"><i class="el-icon-setting"></i> Settings</div>
    </aside>

    <section class="content">
      <div class="content-header">
        <div class="title"><strong id="sectionTitle">Plugins</strong></div>
        <div>
          <button id="createBtn" class="btn primary"><i class="el-icon-plus"></i> Create New</button>
        </div>
      </div>
      <div id="list" class="content-list"></div>
    </section>
  </div>

  <!-- Modal root -->
  <div id="modalRoot" style="display:none;"></div>

<script>
${this.generateJavaScript()}
</script>

</body>
</html>
    `;
  },

  /**
   * Generate CSS styles for the popup window
   * @returns {string} CSS content
   */
  generateCSS() {
    return `
    /* Essential utility variables */
    :root {
      /* Layout & Animation */
      --shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      --shadow-elevated: 0 4px 8px rgba(0,0,0,0.16), 0 2px 4px rgba(0,0,0,0.12);
      --border-radius: 8px;
      --border-radius-small: 4px;
      --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      
      /* Fallback font for non-Material 3 components */
      --font-primary: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      
      /* Essential fallback colors for legacy components */
      --bg-1: #353535;
      --bg-2: #333;
      --bg-3: #212121;
      --bg-4: #101010;
      --text-0: #fff;
      --text-1: #fff;
      --text-2: #fff;
      --text-3: #fff;
      --text-4: #bbb;
      --border: #5f5f5f;
      --border-hover: #777;
      --hover: #505050;
      --accent-1: #66b1ff;
      --accent-2: #66b1ff;
      --accent-3: #4da3ff;
      --red-2: #ea6962;
      --green-2: #67c23a;
    }

    /* Material 3 Theme (Default) */
    :root.theme-material3 {
      /* Core MD3 Variables */
      --bg-1: rgb(79, 55, 139);
      --bg-2: rgb(49, 48, 51);
      --bg-3: rgb(40, 39, 43);
      --bg-4: rgb(28, 27, 31);
      --text-0: rgb(55, 30, 115);
      --text-1: rgb(230, 225, 229);
      --text-2: rgb(230, 225, 229);
      --text-3: rgb(220, 213, 227);
      --text-4: rgb(147, 143, 153);
      --border: rgb(73, 69, 79);
      --border-hover: rgb(74, 68, 88);
      --hover: rgba(147, 143, 153, 0.08);
      --accent-1: rgb(208, 188, 255);
      --accent-2: rgb(208, 188, 255);
      --accent-3: rgb(103, 80, 164);
      --red-2: rgb(242, 184, 181);
      --green-2: rgb(204, 194, 220);
      --font-primary: 'Google Sans', 'Noto Sans', 'Noto Sans TC', 'Noto Sans JP', 'Noto Sans SC', 'Roboto', sans-serif;
      
      /* Material Design 3 Color System */
      --md-sys-color-primary: 208, 188, 255;
      --md-sys-color-on-primary: 55, 30, 115;
      --md-sys-color-primary-container: 79, 55, 139;
      --md-sys-color-on-primary-container: 234, 221, 255;
      --md-sys-color-secondary: 204, 194, 220;
      --md-sys-color-secondary-container: 74, 68, 88;
      --md-sys-color-on-secondary-container: 232, 222, 248;
      --md-sys-color-error: 242, 184, 181;
      --md-sys-color-surface: 28, 27, 31;
      --md-sys-color-on-surface: 230, 225, 229;
      --md-sys-color-surface-variant: 73, 69, 79;
      --md-sys-color-on-surface-variant: 220, 213, 227;
      --md-sys-color-background: 28, 27, 31;
      --md-sys-color-on-background: 230, 225, 229;
      --md-sys-color-outline: 147, 143, 153;
      --md-sys-color-outline-variant: 68, 71, 70;
      --md-sys-color-inverse-surface: 230, 225, 229;
      --md-sys-color-inverse-on-surface: 49, 48, 51;
      --md-sys-color-inverse-primary: 103, 80, 164;
      
      /* Surface Elevation Levels */
      --md-sys-color-surface-1: 40, 39, 43;
      --md-sys-color-surface-2: 49, 48, 51;
      --md-sys-color-surface-3: 58, 56, 61;
      --md-sys-color-surface-4: 63, 61, 66;
      
      /* Typography Scale */
      --md-sys-typescale-headline-medium-font: 'Google Sans', 'Noto Sans', 'Noto Sans TC', 'Noto Sans JP', 'Noto Sans SC', 'Roboto', sans-serif;
      --md-sys-typescale-headline-medium-line-height: 36px;
      --md-sys-typescale-headline-medium-size: 28px;
      --md-sys-typescale-headline-medium-weight: 500;
      --md-sys-typescale-title-medium-font: 'Google Sans', 'Noto Sans', 'Noto Sans TC', 'Noto Sans JP', 'Noto Sans SC', 'Roboto', sans-serif;
      --md-sys-typescale-title-medium-line-height: 24px;
      --md-sys-typescale-title-medium-size: 16px;
      --md-sys-typescale-title-medium-weight: 600;
      --md-sys-typescale-label-large-font: 'Google Sans', 'Noto Sans', 'Noto Sans TC', 'Noto Sans JP', 'Noto Sans SC', 'Roboto', sans-serif;
      --md-sys-typescale-label-large-line-height: 20px;
      --md-sys-typescale-label-large-size: 14px;
      --md-sys-typescale-label-large-weight: 600;
      --md-sys-typescale-body-large-font: 'Google Sans', 'Noto Sans', 'Noto Sans TC', 'Noto Sans JP', 'Noto Sans SC', 'Roboto', sans-serif;
      --md-sys-typescale-body-large-line-height: 24px;
      --md-sys-typescale-body-large-size: 16px;
      --md-sys-typescale-body-large-weight: 400;
      --md-sys-typescale-body-medium-font: 'Google Sans', 'Noto Sans', 'Noto Sans TC', 'Noto Sans JP', 'Noto Sans SC', 'Roboto', sans-serif;
      --md-sys-typescale-body-medium-line-height: 20px;
      --md-sys-typescale-body-medium-size: 14px;
      --md-sys-typescale-body-medium-weight: 400;
    }

    /* Preferences Style */
    html, body { 
      height: 100%; 
      margin: 0; 
      padding: 0;
      box-sizing: border-box;
      background: #1e1e1e;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      color: #ffffff;
    }
    
    *, *::before, *::after {
      box-sizing: border-box;
    }
    
    body.x-container { 
      display: flex; 
      flex-direction: row;
      background: #1e1e1e;
      color: #ffffff; 
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
      font-size: 13px;
      line-height: 1.5;
    }

    /* Hidden toolbar */
    .toolbar { 
      display: none;
    }
    
    .mods-layout { 
      flex: 1; 
      display: flex; 
      min-height: 100vh; 
      overflow: hidden;
    }

    /* Sidebar */
    .sidebar { 
      width: 260px; 
      border-right: 1px solid #2a2a2a; 
      padding: 20px 0; 
      background: #161616;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .sidebar .menu-item { 
      margin: 0 12px;
      padding: 8px 16px; 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      color: #a0a0a0;
      transition: all 0.15s ease;
      border-radius: 6px;
      font-weight: 400;
      font-size: 13px;
      position: relative;
    }
    
    .sidebar .menu-item:hover { 
      background-color: #2a2a2a; 
      color: #ffffff;
    }
    
    .sidebar .menu-item.active { 
      background: #ff6b35;
      color: #ffffff;
      font-weight: 500;
    }
    
    .sidebar .menu-item i {
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    /* Content Area */
    .content { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      min-width: 0; 
      background: #1e1e1e;
      overflow: hidden;
    }
    
    /* Content Header */
    .content-header { 
      padding: 20px 30px; 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      border-bottom: 1px solid #2a2a2a; 
      background: #1e1e1e;
    }

    .content-header .title {
      font-size: 22px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }
    
    /* Content List - Grid Layout */
    .content-list { 
      padding: 30px; 
      overflow: auto; 
      background: #1e1e1e;
      scrollbar-width: thin;
      scrollbar-color: #3a3a3a transparent;
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
      gap: 16px;
    }
    
    .content-list::-webkit-scrollbar {
      width: 8px;
    }
    
    .content-list::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .content-list::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 4px;
    }
    
    .content-list::-webkit-scrollbar-thumb:hover {
      background: var(--border-hover);
    }

    /* Plugin/Theme Cards */
    .card { 
      border: 1px solid #3a3a3a; 
      border-radius: 12px; 
      padding: 20px; 
      background: #2a2a2a; 
      display: flex; 
      flex-direction: column; 
      gap: 12px;
      transition: all 0.2s ease;
      overflow: hidden;
      position: relative;
      height: fit-content;
    }
    
    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--accent-1), var(--accent-2));
      opacity: 0;
      transition: var(--transition);
    }
    
    .card:hover { 
      transform: translateY(-1px);
      box-shadow: 0 8px 16px hsl(0 calc(1*0%) 0% /0.24);
    }
    
    .card:hover::before {
      opacity: 1;
    }
    
    /* Plugin/Theme Card Header */
    .card-title { 
      display: flex; 
      align-items: flex-start; 
      justify-content: space-between; 
      margin-bottom: 8px;
    }
    
    .card-title .name { 
      font-weight: 600; 
      font-size: 16px;
      color: #d4af37;
      flex: 1;
      margin: 0;
      line-height: 1.3;
    }
    
    .card-actions { 
      display: flex; 
      align-items: center; 
      gap: 4px; 
      flex-shrink: 0;
    }
    
    /* Card Description */
    .card-description {
      color: #a0a0a0;
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 16px;
    }
    
    /* Card Bottom Actions */
    .card-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
    }
    
    /* Card Action Icons */
    .card-settings, .card-delete {
      color: #7a7a7a;
      font-size: 16px;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.15s ease;
    }
    
    .card-settings:hover {
      color: #ffffff;
      background: #3a3a3a;
    }
    
    .card-delete:hover {
      color: #ff453a;
      background: #3a3a3a;
    }

    /* Toggle Switch */
    .switch { 
      position: relative; 
      display: inline-block; 
      width: 42px; 
      height: 24px; 
    }
    
    .switch input { 
      display: none; 
    }
    
    .slider { 
      position: absolute; 
      cursor: pointer; 
      top: 0; 
      left: 0; 
      right: 0; 
      bottom: 0; 
      background: #4a4a4a; 
      transition: all 0.2s ease; 
      border-radius: 12px; 
      border: none;
    }
    
    .slider:before { 
      position: absolute; 
      content: ""; 
      height: 20px; 
      width: 20px; 
      left: 2px; 
      top: 2px; 
      background: #ffffff; 
      transition: all 0.2s ease; 
      border-radius: 50%; 
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    input:checked + .slider { 
      background: #ff6b35; 
    }
    
    input:checked + .slider:before { 
      transform: translateX(18px); 
    }

    .switch:hover .slider {
      opacity: 0.8; 
    }

    .muted { 
      opacity: 0.7; 
      font-size: 13px; 
      color: var(--text-4);
      line-height: 1.4;
    }
    
    .spacer { 
      flex: 1; 
    }

    /* Editor modal */
    /* Modern Modal Backdrop */
    .modal-backdrop { 
      position: fixed; 
      inset: 0; 
      background: rgba(0, 0, 0, 0.75); 
      backdrop-filter: blur(12px);
      display: flex; 
      align-items: center; 
      justify-content: center; 
      z-index: 9999; 
      animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: translateY(32px) scale(0.96); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }
    
    /* Streamlined Modal Container */
    .modal { 
      width: min(900px, 90vw); 
      height: min(700px, 85vh); 
      background: #1a1a1a; 
      border: 1px solid #333; 
      border-radius: 16px; 
      display: flex; 
      flex-direction: column; 
      overflow: hidden; 
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2);
      animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    /* Modern Header */
    .modal-header { 
      padding: 24px 32px; 
      display: flex; 
      align-items: center; 
      gap: 16px; 
      border-bottom: 1px solid #333; 
      background: #1a1a1a;
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
      position: relative;
    }
    
    .modal-header::before {
      content: '';
      position: absolute;
      left: 32px;
      bottom: -1px;
      width: 60px;
      height: 2px;
      background: #ff6b35;
      border-radius: 1px;
    }
    
        /* Enhanced Body */
    .modal-body { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      min-height: 0; 
      background: #1a1a1a;
    }
    
    /* Refined Form Fields */
    .field { 
      display: flex; 
      flex-direction: column;
      gap: 16px; 
      padding: 32px; 
      background: #1a1a1a;
      border-bottom: 1px solid #333;
    }
    
    /* Modern Input Fields */
    .field input[type="text"] { 
      background: #2a2a2a; 
      border: 2px solid #404040; 
      color: #ffffff; 
      padding: 16px 20px; 
      border-radius: 10px; 
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
      font-size: 15px;
      font-weight: 400;
      transition: all 0.2s ease;
    }
    
    .field input[type="text"]:focus { 
      border-color: #ff6b35; 
      outline: none;
      box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
      background: #2d2d2d;
    }
    
    .field input[type="text"]::placeholder {
      color: #888;
      font-weight: 400;
    }
    /* Enhanced Editor */
    .editor-host { 
      flex: 1; 
      min-height: 0; 
      margin: 0 32px 32px 32px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #404040;
      background: #2a2a2a;
    }
    
    /* Enhanced Code Editor */
    .CodeMirror { 
      height: 100% !important; 
      background: #2a2a2a !important;
      color: #ffffff !important;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace !important;
      font-size: 14px !important;
      line-height: 1.6 !important;
      border: none !important;
    }
    
    .CodeMirror .CodeMirror-gutters { 
      background: #333 !important; 
      border-right: 1px solid #404040 !important;
      padding-right: 8px !important;
    }
    
    .CodeMirror .CodeMirror-linenumber { 
      color: #888 !important;
      padding: 0 8px !important;
    }
    
    .CodeMirror .CodeMirror-cursor {
      border-left: 2px solid #ff6b35 !important;
    }
    
    .CodeMirror .CodeMirror-selected {
      background: rgba(255, 107, 53, 0.2) !important;
    }

    /* Modern Footer */
    .modal-footer { 
      padding: 24px 32px; 
      border-top: 1px solid #333; 
      display: flex; 
      gap: 16px; 
      justify-content: flex-end; 
      background: #1a1a1a;
    }

    /* Buttons */
    .btn { 
      padding: 6px 16px; 
      border-radius: 6px; 
      border: 1px solid #4a4a4a; 
      background: #3a3a3a; 
      color: #ffffff; 
      cursor: pointer; 
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
      font-weight: 400;
      font-size: 13px;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    
    .btn:hover { 
      background: #4a4a4a; 
      border-color: #5a5a5a;
    }
    
    .btn.primary { 
      background: #ff6b35; 
      border-color: #ff6b35; 
      color: #ffffff;
      font-weight: 500;
    }
    
    .btn.primary:hover { 
      background: #e55a2b; 
      border-color: #e55a2b;
    }
    
    .btn.ghost { 
      background: transparent; 
      border-color: transparent;
      color: var(--text-4);
    }
    
    .btn.ghost:hover {
      background: var(--hover);
      color: var(--text-2);
    }
    
    .icon-btn { 
      width: 36px; 
      height: 36px; 
      display: inline-flex; 
      align-items: center; 
      justify-content: center; 
      border-radius: var(--border-radius-small); 
      border: 2px solid var(--border); 
      background: var(--bg-1); 
      cursor: pointer; 
      transition: var(--transition);
    }
    
    .icon-btn:hover { 
      background: var(--hover); 
      color: var(--text-1);
      border-color: var(--border-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .el-icon-edit, .el-icon-plus, .el-icon-delete, .el-icon-document, .el-icon-brush { 
      font-style: normal; 
    }

    /* Element UI button overrides */
    .el-button { 
      background-color: var(--bg-1) !important;
      border-color: var(--border) !important;
      color: var(--text-3) !important;
      border-radius: 0.6rem !important;
      font-family: var(--font-primary) !important;
    }
    .el-button:hover { 
      background-color: var(--hover) !important;
      color: var(--text-1) !important;
    }
    .el-button--primary { 
      background-color: var(--accent-2) !important;
      border-color: var(--accent-2) !important;
      color: var(--text-0) !important;
    }
    .el-button--primary:hover { 
      background-color: var(--accent-3) !important;
      border-color: var(--accent-3) !important;
    }
    `;
  },

  /**
   * Generate JavaScript for the popup window
   * @returns {string} JavaScript content
   */
  generateJavaScript() {
    const config = window.VRCXExtended.Config;
    
    return `
(function(){
  'use strict';

  // ================================
  // POPUP WINDOW CONFIGURATION
  // ================================

  // Storage interop (uses opener's localStorage)
  const KEYS = ${JSON.stringify(config.KEYS)};

  // Create the popup manager
  window.VRCXExtended = window.VRCXExtended || {};
  
  window.VRCXExtended.PopupManager = {
    getSection() { 
      return document.querySelector('.sidebar .menu-item.active')?.dataset.section || 'plugins'; 
    },
    
    setSection(sec) {
      document.querySelectorAll('.sidebar .menu-item').forEach(mi => 
        mi.classList.toggle('active', mi.dataset.section === sec)
      );
      
      const titles = {
        'plugins': 'Plugins',
        'themes': 'Themes', 
        'settings': 'Settings'
      };
      document.getElementById('sectionTitle').textContent = titles[sec] || 'Unknown';
      
      // Show/hide create button based on section
      const createBtn = document.getElementById('createBtn');
      createBtn.style.display = (sec === 'plugins' || sec === 'themes') ? 'inline-flex' : 'none';
      
      this.renderContent(sec);
    },

    renderContent(section) {
      const list = document.getElementById('list');
      list.innerHTML = '';
      
      switch(section) {
        case 'plugins':
        case 'themes':
          this.renderList(section);
          break;
        case 'settings':
          this.renderSettings();
          break;
        default:
          list.innerHTML = '<div class="muted">Unknown section</div>';
      }
    },

    renderList(section) {
      const list = document.getElementById('list');
      const storageKey = section === 'plugins' ? KEYS.PLUGINS : KEYS.THEMES;
      const data = this.readJSON(storageKey, []);
      
      // Use simplified UI rendering since we don't have full modules
      this.simpleRenderList(data, section, list);
    },

    renderSettings() {
      const list = document.getElementById('list');
      // Use simplified settings rendering
      this.simpleRenderSettings(list);
    },

    simpleRenderList(data, section, listElement) {
      listElement.innerHTML = '';
      const sortedData = data.slice().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

      if (!sortedData.length) {
        const empty = document.createElement('div');
        empty.className = 'muted';
        empty.textContent = 'No items yet. Click Create to add your first one.';
        listElement.appendChild(empty);
        return;
      }

      sortedData.forEach(item => {
        const card = this.createSimpleCard(item, section);
        listElement.appendChild(card);
      });
    },

    createSimpleCard(item, section) {
      const card = document.createElement('div');
      card.className = 'card';

      const title = document.createElement('div');
      title.className = 'card-title';

      const name = document.createElement('div');
      name.className = 'name';
      name.title = item.name;
      name.textContent = item.name || '(untitled)';

      const actions = document.createElement('div');
      actions.className = 'card-actions';

      const deleteIcon = document.createElement('i');
      deleteIcon.className = 'el-icon-delete card-delete';
      deleteIcon.title = 'Delete';
      deleteIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete "' + item.name + '"?')) {
          const storageKey = section === 'plugins' ? KEYS.PLUGINS : KEYS.THEMES;
          const allItems = this.readJSON(storageKey, []);
          const index = allItems.findIndex(x => x.id === item.id);
          
          if (index !== -1) {
            allItems.splice(index, 1);
            this.writeJSON(storageKey, allItems);
            this.renderCurrentSection();
            
            if (section === 'plugins' && window.opener?.$app?.refreshVrcxPlugins) {
              window.opener.$app.refreshVrcxPlugins();
            }
            if (section === 'themes' && window.opener?.$app?.refreshVrcxThemes) {
              window.opener.$app.refreshVrcxThemes();
            }
          }
        }
      });

      const settingsIcon = document.createElement('i');
      settingsIcon.className = 'el-icon-setting card-settings';
      settingsIcon.title = 'Edit';
      settingsIcon.addEventListener('click', () => this.openSimpleEditor(item));

      actions.appendChild(deleteIcon);
      actions.appendChild(settingsIcon);
      title.appendChild(name);
      title.appendChild(actions);

      const description = document.createElement('div');
      description.className = 'card-description';
      if (section === 'plugins') {
        description.textContent = item.description || 'Custom JavaScript plugin for VRCX';
      } else {
        description.textContent = item.description || 'Custom CSS theme for VRCX';
      }

      const bottom = document.createElement('div');
      bottom.className = 'card-bottom';

      const meta = document.createElement('div');
      meta.className = 'muted';
      meta.style.fontSize = '11px';
      meta.textContent = new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString();

      const label = document.createElement('label');
      label.className = 'switch';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!item.enabled;
      const slider = document.createElement('span');
      slider.className = 'slider';
      label.appendChild(checkbox);
      label.appendChild(slider);

      checkbox.addEventListener('change', () => {
        const storageKey = section === 'plugins' ? KEYS.PLUGINS : KEYS.THEMES;
        const allItems = this.readJSON(storageKey, []);
        const index = allItems.findIndex(x => x.id === item.id);
        
        if (index !== -1) {
          allItems[index].enabled = checkbox.checked;
          allItems[index].updatedAt = this.nowIso();
          this.writeJSON(storageKey, allItems);
          
          if (section === 'plugins' && window.opener?.$app?.refreshVrcxPlugins) {
            window.opener.$app.refreshVrcxPlugins();
          }
          if (section === 'themes' && window.opener?.$app?.refreshVrcxThemes) {
            window.opener.$app.refreshVrcxThemes();
          }
        }
      });

      bottom.appendChild(meta);
      bottom.appendChild(label);

      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(bottom);

      return card;
    },

    simpleRenderSettings(listElement) {
      listElement.innerHTML = '';
      
      const settingsContainer = document.createElement('div');
      settingsContainer.style.gridColumn = '1 / -1';
      settingsContainer.style.maxWidth = '600px';
      settingsContainer.style.margin = '0 auto';
      
      const storageCard = document.createElement('div');
      storageCard.className = 'card';
      
      const storageTitle = document.createElement('div');
      storageTitle.className = 'card-title';
      storageTitle.innerHTML = '<h3 style="margin: 0; color: var(--text-2, hsl(38, 47%, 80%));">Storage Management</h3>';
      
      const storageContent = document.createElement('div');
      storageContent.style.display = 'flex';
      storageContent.style.flexDirection = 'column';
      storageContent.style.gap = '12px';
      
      const storageInfo = document.createElement('div');
      storageInfo.className = 'muted';
      storageInfo.textContent = 'Reset all plugins and themes data. This action cannot be undone.';
      
      const resetBtn = document.createElement('button');
      resetBtn.className = 'btn';
      resetBtn.style.backgroundColor = 'var(--red-2, #ea6962)';
      resetBtn.style.borderColor = 'var(--red-2, #ea6962)';
      resetBtn.style.color = 'var(--text-0, #282828)';
      resetBtn.style.alignSelf = 'flex-start';
      resetBtn.textContent = '⚠️ Reset All Data';
      
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all VRCX Mods data?\\n\\nThis will permanently delete all your plugins and themes. This action cannot be undone.')) {
          window.opener.localStorage.removeItem('vrcx_mm_plugins');
          window.opener.localStorage.removeItem('vrcx_mm_themes');
          
          if (window.opener?.$app?.refreshVrcxAll) {
            window.opener.$app.refreshVrcxAll();
          }
          
          alert('All VRCX Mods data has been reset.');
          this.renderCurrentSection();
        }
      });
      
      storageContent.appendChild(storageInfo);
      storageContent.appendChild(resetBtn);
      storageCard.appendChild(storageTitle);
      storageCard.appendChild(storageContent);
      settingsContainer.appendChild(storageCard);
      listElement.appendChild(settingsContainer);
    },

    openSimpleEditor(item) {
      const section = this.getSection();
      const isPlugin = section === 'plugins';

      const root = document.getElementById('modalRoot');
      root.style.display = 'block';
      root.innerHTML = '';
      
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';

      const modal = document.createElement('div');
      modal.className = 'modal';

      const header = document.createElement('div');
      header.className = 'modal-header';
      header.innerHTML = '<strong>'+(item?.id ? 'Edit ' : 'Create ')+(isPlugin?'Plugin':'Theme')+'</strong>';

      const body = document.createElement('div');
      body.className = 'modal-body';

      const field = document.createElement('div');
      field.className = 'field';
      
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = (isPlugin?'Plugin':'Theme') + ' name';
      nameInput.value = item?.name || '';
      nameInput.id = 'editor-name-input';
      field.appendChild(nameInput);

      const descriptionInput = document.createElement('input');
      descriptionInput.type = 'text';
      descriptionInput.placeholder = 'Description (optional)';
      descriptionInput.value = item?.description || '';
      descriptionInput.style.marginTop = '12px';
      descriptionInput.id = 'editor-description-input';
      field.appendChild(descriptionInput);

      const editorHost = document.createElement('div');
      editorHost.className = 'editor-host';
      const textarea = document.createElement('textarea');
      textarea.id = 'editor-textarea';
      textarea.value = item?.code || '';
      editorHost.appendChild(textarea);

      body.appendChild(field);
      body.appendChild(editorHost);

      const footer = document.createElement('div');
      footer.className = 'modal-footer';
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn ghost';
      cancelBtn.textContent = 'Cancel';
      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn primary';
      saveBtn.textContent = 'Save';

      footer.appendChild(cancelBtn);
      footer.appendChild(saveBtn);

      modal.appendChild(header);
      modal.appendChild(body);
      modal.appendChild(footer);
      backdrop.appendChild(modal);
      root.appendChild(backdrop);

      // Initialize CodeMirror
      let editor = null;
      setTimeout(() => {
        try {
          editor = CodeMirror.fromTextArea(textarea, {
            lineNumbers: true,
            mode: isPlugin ? 'javascript' : 'css',
            styleActiveLine: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            autoCloseTags: !isPlugin,
            theme: 'default',
            value: item?.code || ''
          });
          
          setTimeout(() => {
            if (editor) {
              editor.refresh();
              editor.setSize('100%', '100%');
              editor.focus();
            }
          }, 50);
          
        } catch (error) {
          console.error('CodeMirror initialization error:', error);
        }
      }, 100);

      const closeEditor = () => {
        if (editor) {
          try {
            editor.toTextArea();
          } catch(e) {
            console.warn('Error disposing CodeMirror:', e);
          }
        }
        root.style.display = 'none';
        root.innerHTML = '';
      };

      cancelBtn.addEventListener('click', closeEditor);
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeEditor(); });

      saveBtn.addEventListener('click', () => {
        const storageKey = isPlugin ? KEYS.PLUGINS : KEYS.THEMES;
        const data = this.readJSON(storageKey, []);
        const name = nameInput.value.trim() || (isPlugin? 'Untitled Plugin' : 'Untitled Theme');
        const description = descriptionInput.value.trim();
        
        let code = '';
        if (editor) {
          try {
            code = editor.getValue();
          } catch(e) {
            code = textarea.value;
          }
        } else {
          code = textarea.value;
        }

        if (item?.id) {
          const index = data.findIndex(x => x.id === item.id);
          if (index !== -1) {
            data[index].name = name;
            data[index].description = description;
            data[index].code = code;
            data[index].updatedAt = this.nowIso();
          }
        } else {
          data.push({
            id: this.uid(),
            name,
            description,
            code,
            enabled: true,
            createdAt: this.nowIso(),
            updatedAt: this.nowIso(),
          });
        }

        this.writeJSON(storageKey, data);
        
        if (isPlugin && window.opener?.$app?.refreshVrcxPlugins) {
          window.opener.$app.refreshVrcxPlugins();
        }
        if (!isPlugin && window.opener?.$app?.refreshVrcxThemes) {
          window.opener.$app.refreshVrcxThemes();
        }

        closeEditor();
        this.renderCurrentSection();
      });
      
      modal.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          saveBtn.click();
        }
        if (e.key === 'Escape') {
          closeEditor();
        }
      });
    },

    renderCurrentSection() {
      this.renderContent(this.getSection());
    },

    // Utility functions
    readJSON(key, fallback) {
      try {
        const v = window.opener.localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch {
        return fallback;
      }
    },

    writeJSON(key, val) {
      window.opener.localStorage.setItem(key, JSON.stringify(val));
    },

    nowIso() {
      return new Date().toISOString();
    },

    uid() {
      return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  };

  // ================================
  // INITIALIZATION
  // ================================

  // Setup event listeners
  document.querySelectorAll('.sidebar .menu-item').forEach(mi => 
    mi.addEventListener('click', () => window.VRCXExtended.PopupManager.setSection(mi.dataset.section))
  );
  document.getElementById('createBtn').addEventListener('click', () => 
    window.VRCXExtended.PopupManager.openSimpleEditor(null)
  );

  // Apply Material 3 theme
  document.body.className = 'x-container theme-material3';

  // Initial render
  window.VRCXExtended.PopupManager.setSection('plugins');
  
  // Test console logging
  console.log('VRCX-Extended initialized successfully');
})();
    `;
  }
};
