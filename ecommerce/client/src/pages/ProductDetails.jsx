import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ArrowLeft, Wand2, ShoppingCart, CheckCircle } from 'lucide-react';
import { useCart } from '../App';
import { API_URL, TRYON_APP_URL, TRYON_API_URL } from '../utils/config';
import { getProductImageSrc, productImageFallback } from '../utils/productImage';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [tryOnUrl, setTryOnUrl] = useState(`${TRYON_APP_URL}/outfit-studio`);
  const [tryOnReady, setTryOnReady] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (err) {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const resolveTryOnLink = async () => {
      setTryOnReady(false);
      try {
        const { data } = await axios.get(`${TRYON_API_URL}/api/outfits/for-product/${id}`);
        if (!cancelled && data?.outfitId) {
          setTryOnUrl(`${TRYON_APP_URL}/try-on/${data.outfitId}`);
        } else if (!cancelled) {
          setTryOnUrl(`${TRYON_APP_URL}/outfit-studio`);
        }
      } catch {
        if (!cancelled) {
          setTryOnUrl(`${TRYON_APP_URL}/outfit-studio`);
        }
      } finally {
        if (!cancelled) setTryOnReady(true);
      }
    };
    resolveTryOnLink();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">{error}</div>
        <Link to="/products" className="text-blue-600 hover:underline">Back to Products</Link>
      </div>
    );
  }

  const imgSrc = getProductImageSrc(product.image, product.name, 700);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/products" className="inline-flex items-center text-gray-500 hover:text-black mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
      </Link>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Product Image */}
        <div className="w-full md:w-1/2">
          <div className="product-image-container rounded-2xl border border-gray-100 shadow-sm">
            <img
              src={imgSrc}
              alt={product.name}
              className="product-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = productImageFallback(product.name, 700);
              }}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">{product.category} · {product.subcategory}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-500">{product.rating} ({product.reviewCount} reviews)</span>
          </div>

          <div className="text-3xl font-bold text-gray-900 mb-6">${product.price.toFixed(2)}</div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          {/* Color */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Color</h3>
            <span className="px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium bg-gray-50">{product.color}</span>
          </div>

          {/* Size */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Select Size</h3>
              <button className="text-xs text-indigo-600 hover:underline">Size guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 text-sm rounded-md font-medium border transition-colors ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-600 bg-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock */}
          <div className="mb-6 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-500 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Added to cart banner */}
          {addedToCart && (
            <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              Added to cart! <Link to="/cart" className="underline ml-1">View Cart</Link>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || !selectedSize}
              className="w-full bg-black text-white py-3.5 px-8 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingCart className="h-5 w-5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <a
              href={tryOnUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 px-8 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm ${tryOnReady ? '' : 'pointer-events-none opacity-70'}`}
            >
              <Wand2 className="h-5 w-5" />
              {tryOnReady ? '✨ Try This Outfit — AI Virtual Try-On' : 'Loading try-on…'}
            </a>
            <p className="text-xs text-center text-gray-400">
              See how this looks on you instantly with our AI Virtual Try-On
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
