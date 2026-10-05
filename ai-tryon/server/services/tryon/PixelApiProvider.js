const axios = require('axios');
const path = require('path');
const fs = require('fs');
const TryOnProvider = require('./TryOnProvider');

const BASE_URL = process.env.PIXEL_API_BASE_URL || 'https://api.pixelapi.dev/v1';
const API_KEY = process.env.PIXEL_API_KEY;
const TIMEOUT_MS = 120000; // 120 seconds

const b64 = (p) => fs.readFileSync(p).toString("base64");

class PixelApiProvider extends TryOnProvider {
  async generateTryOn(customer, outfit) {
    if (!API_KEY) {
      throw new Error('PIXEL_API_KEY is not configured. Set it in your .env file.');
    }

    const { top, bottom } = outfit;
    if (!top || !bottom) {
      throw new Error('Outfit must have both top and bottom products to use PixelAPI.');
    }

    const storageRoot = path.join(__dirname, '../../../../storage');
    const customerImagePath = this._resolveImagePath(storageRoot, customer.imagePath);
    const topImagePath = this._resolveImagePath(storageRoot, top.imageUrl);
    const bottomImagePath = this._resolveImagePath(storageRoot, bottom.imageUrl);

    this._assertFileExists(customerImagePath, 'Customer photo');
    this._assertFileExists(topImagePath, `Top product image (${top.name})`);
    this._assertFileExists(bottomImagePath, `Bottom product image (${bottom.name})`);

    try {
      // Step 1: Generate Upperbody (Top)
      console.log('[PixelAPI] Starting upperbody try-on...');
      let currentPersonImageB64 = b64(customerImagePath);
      const topResultUrl = await this._processGarment(currentPersonImageB64, topImagePath, 'upperbody');
      
      if (!topResultUrl) throw new Error('Failed to generate top garment try-on');

      // Step 2: Download the intermediate result to use as the new person image
      console.log('[PixelAPI] Downloading intermediate top result...');
      const topResultImage = await axios.get(topResultUrl, { responseType: 'arraybuffer' });
      currentPersonImageB64 = Buffer.from(topResultImage.data, 'binary').toString('base64');

      // Step 3: Generate Lowerbody (Bottom)
      console.log('[PixelAPI] Starting lowerbody try-on...');
      const finalResultUrl = await this._processGarment(currentPersonImageB64, bottomImagePath, 'lowerbody');

      return finalResultUrl;
    } catch (err) {
      throw new Error(this._humanizeError(err));
    }
  }

  async _processGarment(personImageB64, garmentImagePath, category) {
    const payload = {
      person_image: personImageB64,
      garment_image: b64(garmentImagePath),
      category: category,
      n_samples: 1,
    };

    const response = await axios.post(
      `${BASE_URL}/virtual-tryon`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: TIMEOUT_MS,
      }
    );

    const data = response.data;

    if (data.output_url) {
      return data.output_url;
    } else if (data.job_id) {
      const pollUrl = data.poll_url ? (data.poll_url.startsWith('http') ? data.poll_url : `https://api.pixelapi.dev${data.poll_url}`) : `${BASE_URL}/virtual-tryon/jobs/${data.job_id}`;
      return await this._pollForResult(pollUrl);
    } else {
      throw new Error('Unexpected PixelAPI response format: no output_url or job_id');
    }
  }

  async _pollForResult(pollUrl, maxAttempts = 30, intervalMs = 4000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise(r => setTimeout(r, intervalMs));

      const statusRes = await axios.get(pollUrl, {
        headers: { 'Authorization': `Bearer ${API_KEY}` },
        timeout: 15000,
      });

      const { status, output_url, error_message } = statusRes.data;

      if (status === 'completed' && output_url) return output_url;
      if (status === 'failed') throw new Error(error_message || 'PixelAPI processing failed.');
    }
    throw new Error('Try-on is taking longer than expected. Please try again in a moment.');
  }

  _resolveImagePath(storageRoot, imagePathOrUrl) {
    if (!imagePathOrUrl) return null;
    const relative = imagePathOrUrl.replace(/^\/storage\//, '');
    return path.join(storageRoot, relative);
  }

  _assertFileExists(filePath, label) {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error(`${label} file not found on disk: ${filePath}. Cannot send to PixelAPI.`);
    }
  }

  _humanizeError(err) {
    if (!err.response) {
      if (err.code === 'ECONNABORTED') return 'Try-On service timed out. Please try again.';
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') return 'Try-On service is temporarily unavailable. Please try again.';
      return err.message || 'Unable to generate this try-on right now.';
    }

    const status = err.response.status;
    const data = err.response.data;
    const msg = data && data.message ? data.message : (data && data.error ? data.error : JSON.stringify(data));
    
    return `API Error (${status}): ${msg || err.message}`;
  }
}

module.exports = new PixelApiProvider();
