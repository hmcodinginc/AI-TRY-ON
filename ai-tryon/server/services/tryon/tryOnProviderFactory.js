/**
 * tryOnProviderFactory.js
 * Selects the correct Try-On provider based on TRYON_PROVIDER env var.
 *
 * TRYON_PROVIDER=demo         → DemoTryOnProvider (no API key needed)
 * TRYON_PROVIDER=pixel        → PixelApiProvider (PIXEL_API_KEY)
 * TRYON_PROVIDER=huggingface  → IDM-VTON on Hugging Face (HF_TOKEN recommended)
 * TRYON_PROVIDER=tryoffdiff   → alias for huggingface (kept for existing .env files)
 */
const getProvider = () => {
  const selected = (process.env.TRYON_PROVIDER || 'demo').toLowerCase();

  if (selected === 'pixel') {
    console.log('[TryOn] Using PixelApiProvider');
    return require('./PixelApiProvider');
  }

  if (selected === 'tryoffdiff' || selected === 'huggingface' || selected === 'hf' || selected === 'idm-vton') {
    console.log('[TryOn] Using HuggingFace IDM-VTON provider');
    return require('./TryOffDiffProvider');
  }

  console.log('[TryOn] Using DemoTryOnProvider (set TRYON_PROVIDER=huggingface or pixel to use real API)');
  return require('./DemoTryOnProvider');
};

module.exports = { getProvider };
