# VRCX-Extended File System Integration

This document describes the file system integration for VRCX-Extended, which allows creating, editing, and deleting plugins and themes directly in the VRCX file system using the `file://vrcx/` protocol.

## Overview

VRCX-Extended now supports direct file system operations for plugins and themes, allowing you to:

- **Create** new plugin (.js) and theme (.css) files
- **Edit** existing files with a built-in code editor
- **Delete** files from the file system
- **List** all available plugins and themes
- **Read** file contents for editing

## File System Paths

The system uses the following VRCX file system paths:

- **Plugins**: `file://vrcx/plugins/`
- **Themes**: `file://vrcx/themes/`

## Features

### 1. File System Operations

#### Reading Files
```javascript
// Read a plugin file
const content = await fetch('file://vrcx/plugins/my_plugin.js');
const pluginCode = await content.text();

// Read a theme file
const themeContent = await fetch('file://vrcx/themes/my_theme.css');
const themeCode = await themeContent.text();
```

#### Writing Files
```javascript
// Create or update a plugin file
const response = await fetch('file://vrcx/plugins/my_plugin.js', {
    method: 'PUT',
    body: '// My plugin code here\nconsole.log("Hello VRCX!");',
    headers: {
        'Content-Type': 'text/plain'
    }
});

// Create or update a theme file
const themeResponse = await fetch('file://vrcx/themes/my_theme.css', {
    method: 'PUT',
    body: '/* My theme styles */\nbody { background: #1a1a1a; }',
    headers: {
        'Content-Type': 'text/plain'
    }
});
```

#### Deleting Files
```javascript
// Delete a plugin file
const deleteResponse = await fetch('file://vrcx/plugins/my_plugin.js', {
    method: 'DELETE'
});

// Delete a theme file
const themeDeleteResponse = await fetch('file://vrcx/themes/my_theme.css', {
    method: 'DELETE'
});
```

#### Listing Files
```javascript
// List all plugins
const pluginsResponse = await fetch('file://vrcx/plugins/');
const pluginsHtml = await pluginsResponse.text();

// List all themes
const themesResponse = await fetch('file://vrcx/themes/');
const themesHtml = await themesResponse.text();
```

### 2. VRCX-Extended File System

The system includes a comprehensive FileSystem module with all file operations:

```javascript
// Access the file system module
const fs = window.VRCXExtended.FileSystem;

// Core file operations
const content = await fs.readFile('file://vrcx/plugins/my_plugin.js');
await fs.writeFile('file://vrcx/plugins/my_plugin.js', 'new content');
await fs.deleteFile('file://vrcx/plugins/my_plugin.js');

// List files in a directory
const plugins = await fs.listFiles(fs.PATHS.PLUGINS);
const themes = await fs.listFiles(fs.PATHS.THEMES);

// Create new files
await fs.createPlugin('My Plugin', 'console.log("Hello!");');
await fs.createTheme('My Theme', 'body { background: #1a1a1a; }');

// Check if file exists
const exists = await fs.fileExists('file://vrcx/plugins/my_plugin.js');

// Get file information
const info = fs.getFileInfo('file://vrcx/plugins/my_plugin.js');

// Sanitize filename
const safeName = fs.sanitizeFileName('My Cool Plugin!'); // Returns: my_cool_plugin
```

### 3. UI Integration

The popup interface now includes:

- **File System Integration**: Automatically detects and lists files from the VRCX directories
- **Hybrid Storage**: Combines file system data with localStorage metadata
- **Real-time Updates**: Changes are immediately reflected in both file system and UI
- **Fallback Support**: Falls back to localStorage-only mode if file system is unavailable

## Usage

### Creating a New Plugin

1. Open the VRCX-Extended popup
2. Navigate to the "Plugins" section
3. Click "Create New"
4. Enter plugin name and description
5. Write your JavaScript code in the editor
6. Click "Save" - the file will be created in `file://vrcx/plugins/`

### Creating a New Theme

1. Open the VRCX-Extended popup
2. Navigate to the "Themes" section
3. Click "Create New"
4. Enter theme name and description
5. Write your CSS code in the editor
6. Click "Save" - the file will be created in `file://vrcx/themes/`

### Editing Existing Files

1. Open the VRCX-Extended popup
2. Navigate to the appropriate section (Plugins or Themes)
3. Click the edit icon (⚙️) next to any file
4. Modify the code in the editor
5. Click "Save" - the file will be updated in the file system

### Deleting Files

1. Open the VRCX-Extended popup
2. Navigate to the appropriate section
3. Click the delete icon (🗑️) next to any file
4. Confirm the deletion
5. The file will be removed from the file system

## File Naming

Files are automatically sanitized for safe file system operations:

- Invalid characters are replaced with underscores
- Spaces are converted to underscores
- Multiple underscores are collapsed to single
- Leading/trailing underscores are removed
- Names are converted to lowercase

Example: "My Cool Plugin!" becomes "my_cool_plugin.js"

## Error Handling

The system includes comprehensive error handling:

- **File System Unavailable**: Falls back to localStorage-only mode
- **Network Errors**: Shows appropriate error messages
- **Permission Errors**: Handles access restrictions gracefully
- **Invalid Content**: Validates file content before saving

## Testing

You can test the file system functionality using the provided test file:

```javascript
// Run the test file in the browser console
// This will test all file system operations
```

Or manually test specific operations:

```javascript
// Test basic file operations
testVrcxFileSystem();

// Test VRCX-Extended module integration
testVrcxExtendedFileSystem();
```

## Technical Details

### CEF Integration

The file system operations work through VRCX's CEF (Chromium Embedded Framework) integration, which provides:

- Custom URL scheme handling (`file://vrcx/`)
- Directory listing capabilities
- File read/write operations
- Proper MIME type handling

### Security Considerations

- File operations are restricted to VRCX directories
- File names are sanitized to prevent path traversal
- Content is validated before writing
- Error handling prevents data loss

### Performance

- File operations are asynchronous
- Directory listings are cached
- Failed operations fall back gracefully
- UI updates are optimized for responsiveness

## Troubleshooting

### File System Not Available

If file system operations fail:

1. Check that VRCX is running with proper permissions
2. Verify the `file://vrcx/` protocol is working
3. Check browser console for error messages
4. The system will automatically fall back to localStorage-only mode

### Files Not Appearing

If created files don't appear in the UI:

1. Refresh the VRCX-Extended popup
2. Check that files were created in the correct directory
3. Verify file permissions
4. Check browser console for error messages

### Permission Errors

If you encounter permission errors:

1. Ensure VRCX has write permissions to its directories
2. Check that the plugins/themes directories exist
3. Try running VRCX as administrator if needed
4. Verify antivirus software isn't blocking file operations

## Future Enhancements

Planned improvements include:

- **File Import/Export**: Bulk import/export functionality
- **Version Control**: File versioning and backup
- **Advanced Editor**: Syntax highlighting and auto-completion
- **File Templates**: Pre-built templates for common use cases
- **Search and Filter**: Advanced file management features
