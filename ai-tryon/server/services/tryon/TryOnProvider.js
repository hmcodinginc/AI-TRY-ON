class TryOnProvider {
  /**
   * Generates a try-on image.
   * @param {Object} customer - The customer object containing the input image info.
   * @param {Object} outfit - The outfit object containing top and bottom products.
   * @returns {Promise<String>} - The path to the generated result image.
   */
  async generateTryOn(customer, outfit) {
    throw new Error('generateTryOn() must be implemented by subclass');
  }
}

module.exports = TryOnProvider;
