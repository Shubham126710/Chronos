const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.includes('[id]') && file.endsWith('route.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./app/api');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\{ params \}: \{ params: \{ id: string \} \}/g, '{ params }: { params: Promise<{ id: string }> }');
  content = content.replace(/const \{ id \} = params;/g, 'const { id } = await params;');
  fs.writeFileSync(file, content);
});
console.log('Fixed ' + files.length + ' files');
