# VRCX-Extended

A modular extension system for VRCX that allows you to create and manage custom plugins and themes.

## Features

- **Modular Architecture**: Loads modules dynamically from GitHub or local files
- **Plugin System**: Create and manage custom JavaScript plugins
- **Theme System**: Create and manage custom CSS themes
- **Settings Management**: Configure caching and debug options
- **Debug Mode**: Load modules from local file paths for development

## Debug Mode

VRCX-Extended includes a debug mode that allows you to load modules from local file paths instead of GitHub. This is useful for development and testing.

### Enabling Debug Mode

1. Open VRCX-Extended settings (click the VRCX-Extended menu item in VRCX)
2. Go to the "Settings" tab
3. Check "Enable debug mode (load from local files)"
4. Refresh the page

### Local File Structure

When debug mode is enabled, VRCX-Extended expects the following file structure:

```
file://vrcx/extended/
├── modules/
│   ├── config.js
│   ├── editor.js
│   ├── injection.js
│   ├── modules.js
│   ├── popup.js
│   ├── ui.js
│   └── utils.js
├── html/
│   └── popup.html
└── stylesheet/
    └── popup.css
```

### Setting Up Local Files

To use debug mode, you need to make the VRCX-Extended files available at the local file paths. This can be done by:

1. **Symlinking**: Create symbolic links from your development directory to the expected paths
2. **File Protocol**: Serve the files using a local file server
3. **Browser Extension**: Configure your browser to allow access to local files

### Important Notes

- Debug mode requires a page refresh to take effect
- Local files must be accessible via the `file://` protocol
- The module system will fall back to GitHub if local files are not available
- Debug mode is disabled by default for security reasons

## Installation

1. Install Tampermonkey or Greasemonkey
2. Install the VRCX-Extended userscript
3. Open VRCX and look for the VRCX-Extended menu item

## Usage

1. Click the VRCX-Extended menu item in VRCX
2. Use the popup window to manage plugins and themes
3. Create new plugins or themes using the built-in editor
4. Configure settings including debug mode and caching options

## Development

For development and testing:

1. Enable debug mode in settings
2. Set up local file paths as described above
3. Make changes to your local files
4. Refresh VRCX to see changes immediately

## License

This project is open source and available under the MIT License.
