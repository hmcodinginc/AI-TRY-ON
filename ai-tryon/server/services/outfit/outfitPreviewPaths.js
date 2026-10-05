function getPreviewFilename(topProductId, bottomProductId) {
  return `${topProductId}__${bottomProductId}.jpg`;
}

module.exports = { getPreviewFilename };
