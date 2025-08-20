// Test file for VRCX file system operations
// This file can be run in the browser console to test file access

console.log('🧪 Testing VRCX File System Operations...');

// Test function to check file system access
async function testVrcxFileSystem() {
    console.log('📁 Testing VRCX file system access...');
    
    try {
        // Test 1: List plugins directory
        console.log('1️⃣ Testing plugins directory listing...');
        const pluginsResponse = await fetch('file://vrcx/plugins/');
        console.log('Plugins response status:', pluginsResponse.status);
        console.log('Plugins response ok:', pluginsResponse.ok);
        
        if (pluginsResponse.ok) {
            const pluginsHtml = await pluginsResponse.text();
            console.log('Plugins directory content length:', pluginsHtml.length);
            console.log('Plugins directory preview:', pluginsHtml.substring(0, 200) + '...');
        }
        
        // Test 2: List themes directory
        console.log('2️⃣ Testing themes directory listing...');
        const themesResponse = await fetch('file://vrcx/themes/');
        console.log('Themes response status:', themesResponse.status);
        console.log('Themes response ok:', themesResponse.ok);
        
        if (themesResponse.ok) {
            const themesHtml = await themesResponse.text();
            console.log('Themes directory content length:', themesHtml.length);
            console.log('Themes directory preview:', themesHtml.substring(0, 200) + '...');
        }
        
        // Test 3: Try to create a test file
        console.log('3️⃣ Testing file creation...');
        const testFileName = 'test_plugin_' + Date.now() + '.js';
        const testContent = '// Test plugin created by VRCX-Extended\nconsole.log("Hello from test plugin!");';
        
        const createResponse = await fetch('file://vrcx/plugins/' + testFileName, {
            method: 'PUT',
            body: testContent,
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        
        console.log('Create response status:', createResponse.status);
        console.log('Create response ok:', createResponse.ok);
        
        if (createResponse.ok) {
            console.log('✅ Test file created successfully!');
            
            // Test 4: Try to read the created file
            console.log('4️⃣ Testing file reading...');
            const readResponse = await fetch('file://vrcx/plugins/' + testFileName);
            console.log('Read response status:', readResponse.status);
            
            if (readResponse.ok) {
                const readContent = await readResponse.text();
                console.log('✅ File read successfully!');
                console.log('File content:', readContent);
                
                // Test 5: Try to delete the test file
                console.log('5️⃣ Testing file deletion...');
                const deleteResponse = await fetch('file://vrcx/plugins/' + testFileName, {
                    method: 'DELETE'
                });
                
                console.log('Delete response status:', deleteResponse.status);
                console.log('Delete response ok:', deleteResponse.ok);
                
                if (deleteResponse.ok) {
                    console.log('✅ Test file deleted successfully!');
                } else {
                    console.log('❌ Failed to delete test file');
                }
            } else {
                console.log('❌ Failed to read test file');
            }
        } else {
            console.log('❌ Failed to create test file');
        }
        
        console.log('🎉 File system test completed!');
        
    } catch (error) {
        console.error('❌ File system test failed:', error);
    }
}

// Test function to check if VRCX-Extended file system is available
function testVrcxExtendedFileSystem() {
    console.log('🔧 Testing VRCX-Extended File System module...');
    
    if (window.VRCXExtended && window.VRCXExtended.ModuleSystem && window.VRCXExtended.ModuleSystem.FileSystem) {
        console.log('✅ VRCX-Extended File System module found!');
        console.log('Available methods:', Object.keys(window.VRCXExtended.ModuleSystem.FileSystem));
        
        // Test the file system methods
        const fs = window.VRCXExtended.ModuleSystem.FileSystem;
        
        // Test listFiles
        fs.listFiles(fs.PATHS.PLUGINS).then(files => {
            console.log('📁 Plugins directory files:', files);
        }).catch(error => {
            console.error('❌ Failed to list plugins:', error);
        });
        
        fs.listFiles(fs.PATHS.THEMES).then(files => {
            console.log('🎨 Themes directory files:', files);
        }).catch(error => {
            console.error('❌ Failed to list themes:', error);
        });
        
    } else {
        console.log('❌ VRCX-Extended File System module not found');
        console.log('VRCXExtended available:', !!window.VRCXExtended);
        console.log('ModuleSystem available:', !!(window.VRCXExtended && window.VRCXExtended.ModuleSystem));
    }
}

// Run tests
console.log('🚀 Starting VRCX file system tests...');
testVrcxFileSystem();
testVrcxExtendedFileSystem();

// Export test functions for manual testing
window.testVrcxFileSystem = testVrcxFileSystem;
window.testVrcxExtendedFileSystem = testVrcxExtendedFileSystem;
