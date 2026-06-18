import fs from 'fs';

let cjs = fs.readFileSync('scripts/buildDocs.cjs', 'utf8');
const replaceStart = cjs.indexOf("const templatePath = path.join(__dirname, '../index.html');");
const bottom = "const templatePath = path.join(__dirname, '../template.html');\nconst outPath = path.join(__dirname, '../index.html');\nlet html = fs.readFileSync(templatePath, 'utf8');\nhtml = html.replace('${navHtml}', navHtml);\nhtml = html.replace('${cardsHtml}', cardsHtml);\nfs.writeFileSync(outPath, html);\nconsole.log('Successfully built index.html from template.html with all ' + endpoints.length + ' endpoints.');\n";
cjs = cjs.substring(0, replaceStart) + bottom;
fs.writeFileSync('scripts/buildDocs.cjs', cjs);
console.log("buildDocs.cjs updated successfully!");
