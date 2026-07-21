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
let btnCount = 0;
let fetcherCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Fix buttons
    content = content.replace(/<button(?![^>]*type=)([^>]*)>/g, (match, p1) => {
        if (match.includes('onClick')) {
            return `<button type="button"${p1}>`;
        } else if (match.includes('submit') || match.includes('Submit')) {
            return `<button type="submit"${p1}>`;
        } else {
            return `<button type="button"${p1}>`; // Default to button to prevent accidental submits
        }
    });

    // Fix fetcher
    if (content.includes('const fetcher =') && !content.startsWith('const fetcher')) {
        // Extract the fetcher line and remove it from inside the component
        const fetcherRegex = /^[ \t]*const fetcher(?:Auth)?\s*=\s*\(.*?\)\s*=>.*?(?:;|(?=\n))/gm;
        const matches = [...content.matchAll(fetcherRegex)];
        if (matches.length > 0) {
            let extracted = [];
            matches.forEach(m => {
                extracted.push(m[0].trim());
                content = content.replace(m[0], ''); // Remove from component
            });
            
            // Add extracted fetchers after the imports
            const importEndRegex = /(import .*?;\n)+(?!\s*import)/;
            const importMatch = content.match(importEndRegex);
            if (importMatch) {
                const index = importMatch.index + importMatch[0].length;
                const toInsert = '\n' + extracted.join('\n') + '\n';
                content = content.slice(0, index) + toInsert + content.slice(index);
                fetcherCount++;
            }
        }
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        btnCount++;
    }
});

console.log('Fixed files: ' + btnCount + ' for buttons and fetchers.');
