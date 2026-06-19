import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// Replace nav sections
const navStartStr = '<div class="nav-section">';
const navStartIdx = html.indexOf(navStartStr);
const navEndIdx = html.indexOf('</aside>');
if (navStartIdx !== -1 && navEndIdx !== -1) {
    html = html.substring(0, navStartIdx) + '${navHtml}\n        ' + html.substring(navEndIdx);
}

// Replace endpoint cards
const cardsStartStr = '<div class="endpoint-card"';
const cardsStartIdx = html.indexOf(cardsStartStr);
const cardsEndIdx = html.indexOf('</main>');
if (cardsStartIdx !== -1 && cardsEndIdx !== -1) {
    html = html.substring(0, cardsStartIdx) + '<div id="endpoints-container">\n                ${cardsHtml}\n            </div>\n        ' + html.substring(cardsEndIdx);
}

fs.writeFileSync('template.html', html);
console.log("Template generated successfully!");
