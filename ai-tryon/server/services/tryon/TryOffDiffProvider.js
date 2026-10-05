const TryOnProvider = require('./TryOnProvider');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

/**
 * Virtual Try-On via Hugging Face Gradio (IDM-VTON).
 *
 * Previous setup called rizavelioglu/tryoffdiff, which is a TRY-OFF model:
 * it extracts garments FROM a worn photo. That cannot put catalog clothes
 * onto the customer. This provider sends person + garment images to IDM-VTON
 * (top, then bottom) and saves the composite locally.
 */
class HuggingFaceVtonProvider extends TryOnProvider {
  async generateTryOn(customer, outfit) {
    const { top, bottom } = outfit;
    if (!top || !bottom) {
      throw new Error('Outfit must have both top and bottom products.');
    }

    const storageRoot = path.join(__dirname, '../../../../storage');
    const resultsDir = path.join(storageRoot, 'tryon-results');
    fs.mkdirSync(resultsDir, { recursive: true });

    const temps = [];
    const customerImagePath = await this._ensureLocalFile(storageRoot, customer.imagePath, 'Customer photo', temps);
    const topImagePath = await this._ensureLocalFile(storageRoot, top.imageUrl, `Top product image (${top.name})`, temps);
    const bottomImagePath = await this._ensureLocalFile(storageRoot, bottom.imageUrl, `Bottom product image (${bottom.name})`, temps);

    try {
      const personJpg = await this._compress(customerImagePath, temps);
      const topJpg = await this._compress(topImagePath, temps);
      const bottomJpg = await this._compress(bottomImagePath, temps);

      const { Client, handle_file } = await import('@gradio/client');
      const hfTokenTop = process.env.HF_TOKEN_TOP || process.env.HF_TOKEN;
      const hfTokenBottom = process.env.HF_TOKEN_BOTTOM || process.env.HF_TOKEN;
      
      const spaceTop = process.env.HF_VTON_SPACE || 'yisol/IDM-VTON';
      const spaceBottom = 'levihsu/OOTDiffusion';

      console.log(`[HF-VTON] Step A: Connecting to ${spaceTop} for Shirt Preview...`);
      const clientTop = await Client.connect(spaceTop, hfTokenTop ? { token: hfTokenTop } : {});
      
      console.log(`[HF-VTON] Step B: Connecting to ${spaceBottom} for Pants Preview...`);
      const clientBottom = await Client.connect(spaceBottom, hfTokenBottom ? { token: hfTokenBottom } : {});

      // A) SHIRT PREVIEW (Original Photo + Top Product)
      console.log('[HF-VTON] Generating Shirt Preview...');
      const shirtPromise = this._tryOnGarment(clientTop, handle_file, personJpg, topJpg, this._garmentPrompt(top, 'upper-body top'))
        .then(async (afterTop) => {
          const topOutName = `tryon_shirt_${uuidv4().slice(0, 8)}.jpg`;
          const topOutPath = path.join(resultsDir, topOutName);
          await this._persistRemoteImage(afterTop, topOutPath, hfTokenTop);
          return `/storage/tryon-results/${topOutName}`;
        });

      // B) PANTS PREVIEW (Original Photo + Bottom Product)
      console.log('[HF-VTON] Generating Pants Preview...');
      const pantsPromise = this._tryOnLowerBody(clientBottom, handle_file, personJpg, bottomJpg)
        .then(async (afterBottom) => {
          const bottomOutName = `tryon_pants_${uuidv4().slice(0, 8)}.jpg`;
          const bottomOutPath = path.join(resultsDir, bottomOutName);
          await this._persistRemoteImage(afterBottom, bottomOutPath, hfTokenBottom);
          return `/storage/tryon-results/${bottomOutName}`;
        })
        .catch((err) => {
          console.warn('[HF-VTON] Pants Preview failed/unsupported:', err.message);
          return 'UNSUPPORTED';
        });

      const [shirtPreview, pantsPreview] = await Promise.all([shirtPromise, pantsPromise]);

      console.log('[HF-VTON] Saved dual results:', { shirtPreview, pantsPreview });
      return { shirtPreview, pantsPreview };
    } catch (err) {
      console.error('[HF-VTON] Error:', err);
      throw new Error(`Hugging Face try-on failed: ${err.message}`);
    } finally {
      for (const tempPath of temps) {
        try {
          if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        } catch (_) {
          /* ignore */
        }
      }
    }
  }

  async _tryOnGarment(client, handle_file, personPath, garmentPath, description) {
    const personInput = {
      background: handle_file(personPath),
      layers: [],
      composite: null
    };

      const garment = handle_file(garmentPath);
      const payload = {
        dict: personInput,
        garm_img: garment,
        garment_des: description,
        is_checked: true,
        is_checked_crop: false,
        denoise_steps: 20,
        seed: 42
      };
      const result = await client.predict('/tryon', payload);
      const imageRef = this._extractImageRef(result);
      if (imageRef) return imageRef;
      throw new Error('The upper-body model returned no image.');
  }

  async _tryOnLowerBody(client, handle_file, personPath, garmentPath) {
    // levihsu/OOTDiffusion frequently bleeds into the upper body and background,
    // failing to strictly preserve the original shirt and identity for pants-only try-on.
    // As per requirements, we do not pretend the open-source model can do this.
    // A commercial/enterprise provider is required for true masked lower-body VTO.
    throw new Error('UNSUPPORTED_LOWER_BODY');
  }

  async _assertTryOnParamNames(client) {
    let params = [];
    try {
      const api = typeof client.view_api === 'function' ? await client.view_api() : null;
      const endpoint = api?.named_endpoints?.['/tryon'] || api?.named_endpoints?.tryon;
      params = (endpoint?.parameters || []).map((p) => p.parameter_name || p.label || p.component);
    } catch (err) {
      console.warn('[HF-VTON] Could not inspect live API schema:', err.message);
      return;
    }
    console.log('[HF-VTON] Live /tryon parameter names:', params);
    this.lastApiParams = params;
    if (params.includes('imgs') && !params.includes('dict')) {
      throw new Error('Live IDM-VTON /tryon API uses imgs, expected dict.');
    }
  }

  _extractImageRef(result) {
    const walk = (node) => {
      if (!node) return null;
      if (typeof node === 'string' && (node.startsWith('http') || node.startsWith('/') || fs.existsSync(node))) {
        return node;
      }
      if (typeof node === 'object') {
        if (node.url) return node.url;
        if (node.path && (String(node.path).startsWith('http') || fs.existsSync(node.path))) return node.path;
        if (Array.isArray(node)) {
          for (const item of node) {
            const found = walk(item);
            if (found) return found;
          }
        }
      }
      return null;
    };

    return walk(result?.data) || walk(result);
  }

  async _persistRemoteImage(imageRef, destPath, hfToken) {
    if (imageRef && fs.existsSync(imageRef) && !String(imageRef).startsWith('http')) {
      await sharp(imageRef).jpeg({ quality: 90 }).toFile(destPath);
      return destPath;
    }

    const headers = {};
    if (hfToken) headers.Authorization = `Bearer ${hfToken}`;

    const response = await axios.get(imageRef, {
      responseType: 'arraybuffer',
      headers,
      timeout: 120000
    });
    fs.writeFileSync(destPath, Buffer.from(response.data));
    return destPath;
  }

  async _compress(srcPath, temps) {
    const dest = path.join(__dirname, '../../../../storage', `temp_${Date.now()}_${Math.random().toString(16).slice(2)}.jpg`);
    await sharp(srcPath)
      .resize({ width: 768, height: 1024, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(dest);
    temps.push(dest);
    return dest;
  }

  _garmentPrompt(product, fallback) {
    const parts = [product?.name, product?.color, product?.category].filter(Boolean);
    return parts.length ? parts.join(', ') : fallback;
  }

  _resolveImagePath(storageRoot, imagePathOrUrl) {
    if (!imagePathOrUrl) return null;
    const relative = String(imagePathOrUrl).replace(/^https?:\/\/[^/]+/, '').replace(/^\/storage\//, '');
    return path.join(storageRoot, relative);
  }

  async _ensureLocalFile(storageRoot, imagePathOrUrl, label, temps) {
    if (!imagePathOrUrl) {
      throw new Error(`${label} is missing.`);
    }

    const asUrl = String(imagePathOrUrl);
    if (/^https?:\/\//i.test(asUrl) && !asUrl.includes('/storage/')) {
      const dest = path.join(storageRoot, `temp_dl_${Date.now()}_${Math.random().toString(16).slice(2)}.jpg`);
      const response = await axios.get(asUrl, { responseType: 'arraybuffer', timeout: 30000 });
      fs.writeFileSync(dest, Buffer.from(response.data));
      temps.push(dest);
      return dest;
    }

    const filePath = this._resolveImagePath(storageRoot, imagePathOrUrl);
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error(`${label} not found on disk: ${filePath}`);
    }
    return filePath;
  }
}

module.exports = new HuggingFaceVtonProvider();
