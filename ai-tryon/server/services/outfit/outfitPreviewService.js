const fs = require('fs');
const path = require('path');
const { getPreviewFilename } = require('./outfitPreviewPaths');

const PREVIEWS_DIR = path.join(__dirname, '../../../../storage/outfit-previews');

/**
 * Local preview assets keyed by topProductId + bottomProductId.
 * No unrelated fallback images.
 */
function getOutfitPreview(topProductId, bottomProductId) {
  const filename = getPreviewFilename(topProductId, bottomProductId);
  const absolutePath = path.join(PREVIEWS_DIR, filename);

  if (fs.existsSync(absolutePath)) {
    return {
      previewStatus: 'ready',
      previewImage: `/storage/outfit-previews/${filename}`,
    };
  }

  return {
    previewStatus: 'unavailable',
    previewImage: null,
  };
}

module.exports = { getOutfitPreview, PREVIEWS_DIR };
