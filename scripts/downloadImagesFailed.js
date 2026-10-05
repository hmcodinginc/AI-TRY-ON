const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../storage/products');

// Alternative URLs for failed ones
const products = [
  { id: 'P-1003', file: 'P-1003-black-slim-shirt.jpg',  url: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=600&q=80' },
  { id: 'P-5001', file: 'P-5001-denim-jacket.jpg',       url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    const request = client.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch(e) {}
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    request.on('error', err => { try { fs.unlinkSync(dest); } catch(e) {} reject(err); });
  });
}

(async () => {
  for (const p of products) {
    const dest = path.join(OUT_DIR, p.file);
    process.stdout.write(`  Downloading ${p.id} → ${p.file} ... `);
    try {
      await download(p.url, dest);
      const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
      console.log(size > 0 ? `OK (${Math.round(size/1024)}KB)` : 'EMPTY!');
    } catch(e) {
      console.log(`FAILED: ${e.message}`);
    }
  }
  console.log('Done!');
})();
