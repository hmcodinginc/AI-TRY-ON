const fs = require('fs');
const https = require('https');
const path = require('path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
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
  
  for (let i = 0; i < 8; i++) {
    const id = `outfit_${String(i + 1).padStart(3, '0')}`;
    const dest = path.join(resultsDir, `${id}-result.jpg`);
    console.log(`Downloading ${id}...`);
    try {
      // Use loremflickr to get actual fashion models. Add random string to avoid caching.
      await download(`https://loremflickr.com/600/800/fashion,model?random=${i}`, dest);
      console.log(`Saved ${dest}`);
    } catch (e) {
      console.error(`Failed ${id}`, e);
    }
  }
};

run();
