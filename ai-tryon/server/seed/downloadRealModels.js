const fs = require('fs');
const https = require('https');
const path = require('path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const run = async () => {
  const resultsDir = path.join(__dirname, '../../../storage/tryon-results');
  
  // Real fashion model images from Unsplash
  const images = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1485230405346-71acb9518d9c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&w=600&q=80'
  ];

  for (let i = 0; i < 8; i++) {
    const id = `outfit_${String(i + 1).padStart(3, '0')}`;
    const dest = path.join(resultsDir, `${id}-result.jpg`);
    console.log(`Downloading ${id}...`);
    try {
      await download(images[i], dest);
      console.log(`Saved ${dest}`);
    } catch (e) {
      console.error(`Failed ${id}`, e);
    }
  }
};

run();
