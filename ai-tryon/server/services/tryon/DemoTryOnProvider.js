/**
 * Demo VTO provider — uses EXACT product IDs (no random images).
 * Returns a deterministic reference for the frontend to render exact catalog images.
 */
class DemoTryOnProvider {
  async generateTryOn(customer, outfit) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (!outfit?.outfitId || !outfit?.topProductId || !outfit?.bottomProductId) {
            return reject(new Error('Outfit is missing required fields.'));
          }

          const resultRef = `outfit://${outfit.outfitId}`;
          resolve(resultRef);
        } catch (err) {
          reject(err);
        }
      }, 1200);
    });
  }
}

module.exports = new DemoTryOnProvider();
