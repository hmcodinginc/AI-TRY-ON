const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../storage/products');

const products = [
  // P-1001 already has my-new-brown-shirt.jpg — skip
  { id: 'P-1002', file: 'P-1002-white-oxford-shirt.jpg',    url: 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?auto=format&fit=crop&w=600&q=80' },
  { id: 'P-1003', file: 'P-1003-black-slim-shirt.jpg',      url: 'https://images.unsplash.com/photo-1588806296836-e8d1976008ab?auto=format&fit=crop&w=600&q=80' },
  { id: 'P-2001', file: 'P-2001-white-oversized-tshirt.jpg',url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80' },
  { id: 'P-2002', file: 'P-2002-black-basic-tshirt.jpg',    url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80' },
  { id: 'P-3001', file: 'P-3001-blue-straight-jeans.jpg',   url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80' },
  { id: 'P-3002', file: 'P-3002-black-slim-jeans.jpg',      url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80' },
  { id: 'P-4001', file: 'P-4001-beige-chinos.jpg',          url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80' },
  { id: 'P-4002', file: 'P-4002-black-formal-trousers.jpg', url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80' },
  { id: 'P-5001', file: 'P-5001-denim-jacket.jpg',          url: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0eb?auto=format&fit=crop&w=600&q=80' },
  { id: 'P-5002', file: 'P-5002-black-bomber-jacket.jpg',   url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80' },
  { id: 'P-6001', file: 'P-6001-black-summer-dress.jpg',    url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80' },
  { id: 'P-6002', file: 'P-6002-floral-midi-dress.jpg',     url: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?auto=format&fit=crop&w=600&q=80' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      const size = fs.statSync(dest).size;
      if (size > 10000) { console.log(`  SKIP (exists): ${path.basename(dest)}`); return resolve(); }
    }
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
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    request.on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  
  for (const p of products) {
    const dest = path.join(OUT_DIR, p.file);
    try {
      process.stdout.write(`  Downloading ${p.id} → ${p.file} ... `);
      await download(p.url, dest);
      const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
      console.log(size > 0 ? `OK (${Math.round(size/1024)}KB)` : 'EMPTY!');
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
    }
  }
  console.log('\nDone!');
})();
