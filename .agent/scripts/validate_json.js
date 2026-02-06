const fs = require('fs');
const path = require('path');

const files = ['messages/en.json', 'messages/et.json'];
let hasError = false;

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        JSON.parse(content);
        console.log(`✅ ${file} is valid JSON`);
    } catch (e) {
        console.error(`❌ ${file} has error:`, e.message);
        hasError = true;
    }
});

if (hasError) process.exit(1);
