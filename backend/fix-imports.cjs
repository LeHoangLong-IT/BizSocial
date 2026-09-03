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
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content.replace(/from\s+['"](\.[^'"]+)['"]/g, (match, p1) => {
    if (p1.endsWith('.js')) return match;
    return `from '${p1}.js'`;
  });
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log(`Updated ${f}`);
  }
});
