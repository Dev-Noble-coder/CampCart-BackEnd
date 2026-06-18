const fs = require('fs');
let content = fs.readFileSync('scripts/buildDocs.cjs', 'utf8');
content = content.replace(/\\\`/g, '`');
fs.writeFileSync('scripts/buildDocs.cjs', content);
