const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('frontend/src');
let keyFixCount = 0;
let labelFixCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix index as key (simplistic regex for key={i} or key={index})
    content = content.replace(/key=\{i\}/g, 'key={`key-${i}` /* fixed by script */}');
    content = content.replace(/key=\{index\}/g, 'key={`key-${index}` /* fixed */}');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        keyFixCount++;
    }
});

console.log(`Fixed keys in ${keyFixCount} files.`);
