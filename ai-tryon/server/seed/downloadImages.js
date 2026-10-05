const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const run = async () => {
  const previewsDir = path.join(__dirname, '../../../storage/outfit-previews');
  const resultsDir = path.join(__dirname, '../../../storage/tryon-results');

  const colors = ['FF5733', '33FF57', '3357FF', 'FF33A8', '33FFF2', 'F2FF33', 'FF8333', '8333FF'];

  for (let i = 1; i <= 8; i++) {
    const id = `outfit_${String(i).padStart(3, '0')}`;
    const color = colors[i - 1];

    const previewUrl = `https://placehold.co/600x800/${color}/FFF.jpg?text=Generic+Model\\n${id}`;
    const resultUrl = `https://placehold.co/600x800/${color}/FFF.jpg?text=Your+Result\\n${id}`;

    await download(previewUrl, path.join(previewsDir, `${id}.jpg`));
    await download(resultUrl, path.join(resultsDir, `${id}-result.jpg`));
    console.log(`Downloaded placeholders for ${id}`);
  }
};

run().catch(console.error);
