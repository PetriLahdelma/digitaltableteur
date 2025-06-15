const fs = require('fs');
const figma = JSON.parse(fs.readFileSync('figma.json', 'utf8'));
const texts = [];
function walk(node){
  if(node.characters && typeof node.characters === 'string') {
    texts.push(node.characters);
  }
  if(node.children) node.children.forEach(walk);
}
walk(figma.document);
const projects = [];
const titles = new Set();
texts.forEach(t => {
  const yearMatch = t.match(/(19|20)\d{2}/);
  if(yearMatch){
    const title = t.split(/[\.\n]/)[0].trim();
    if(!titles.has(title) && title.length > 3 && title.length < 100){
      titles.add(title);
      projects.push({title, description: t.trim(), year: yearMatch[0]});
    }
  }
});
fs.writeFileSync('src/data/workData.json', JSON.stringify(projects, null, 2));
console.log('extracted', projects.length, 'projects');
