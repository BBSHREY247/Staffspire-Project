const fs = require('fs');
const path = require('path');

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            if (content.includes('localStorage.setItem("user"')) {
                content = content.replace(/localStorage\.setItem\("user"/g, 'localStorage.setItem("user:v1"');
                changed = true;
            }
            if (content.includes('localStorage.getItem("user"')) {
                content = content.replace(/localStorage\.getItem\("user"/g, 'localStorage.getItem("user:v1"');
                changed = true;
            }
            if (content.includes('localStorage.setItem("staffspire_settings"')) {
                content = content.replace(/localStorage\.setItem\("staffspire_settings"/g, 'localStorage.setItem("staffspire_settings:v1"');
                changed = true;
            }
            if (content.includes('localStorage.getItem("staffspire_settings"')) {
                content = content.replace(/localStorage\.getItem\("staffspire_settings"/g, 'localStorage.getItem("staffspire_settings:v1"');
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated ' + fullPath);
            }
        }
    }
}

traverse('./frontend/src');
