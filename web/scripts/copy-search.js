const fs = require('fs');
const path = require('path');

const src = path.join(process.cwd(), 'out', 'pagefind');
const dest = path.join(process.cwd(), 'public', 'pagefind');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log('Pagefind assets synced to public/pagefind');
}
