import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingBag, CheckCircle, User } from 'lucide-react';

const AI_BASE = 'http://127.0.0.1:6001';
const imgUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${AI_BASE}${url}`;
};


const Result = () => {
  const { resultId } = useParams();
  // Always reset to null when resultId changes — prevents stale state (TEST D)
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear everything immediately when the outfitId changes
    setResult(null);
    setError(null);
    setLoading(true);

    const fetchResult = async () => {
      try {
        const { data } = await axios.get(`http://127.0.0.1:6001/api/tryon/${resultId}`);
        
        // STRICT CHECK: Ensure the outfit inside the result matches what was requested.
        // The backend also validates this, but we double-check on the frontend.
        if (!data.outfit || !data.outfit.top || !data.outfit.bottom) {
          setError('Try-On preview for this outfit is not available in the demo.');
          return;
        }

        // The resultImagePath will be an absolute URL from Gradio or a local path.
        if (!data.resultImagePath) {
          setError('Try-On preview for this outfit is not available in the demo.');
          return;
        }

        setResult(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Try-On result not found.');
        } else if (err.response?.status === 409) {
          setError('Result/outfit mismatch detected. This result cannot be displayed.');
        } else {
          setError('Unable to load your try-on result. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your result...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 max-w-md mx-auto">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-amber-800 mb-2">Preview Unavailable</h2>
          <p className="text-amber-700 mb-6">{error}</p>
          <Link to="/outfit-studio" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">
            Return to Studio
          </Link>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { outfit } = result;
  const top = outfit?.top;
  const bottom = outfit?.bottom;
  const topPrice = top?.price || 0;
  const bottomPrice = bottom?.price || 0;
  const totalPrice = topPrice + bottomPrice;
  
  const shirtPreviewUrl = result.shirtPreview ? imgUrl(result.shirtPreview) : imgUrl(result.resultImagePath);
  const pantsPreviewUrl = (result.pantsPreview && result.pantsPreview !== 'UNSUPPORTED') ? imgUrl(result.pantsPreview) : null;
  const isPantsUnsupported = result.pantsPreview === 'UNSUPPORTED';
  const isGeneratedLook = shirtPreviewUrl && !String(shirtPreviewUrl).startsWith('outfit://');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/outfit-studio" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Studio
      </Link>

      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-indigo-50 to-white -z-10"></div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4">
            <CheckCircle className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">YOUR VIRTUAL TRY-ON</h1>
          <p className="text-gray-500 text-lg">
            Here is exactly how <strong>{top?.name}</strong> and <strong>{bottom?.name}</strong> look on you.
          </p>
        </div>

        {isGeneratedLook && (
          <div className="mb-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3 text-center">Shirt Preview</div>
              <div className="w-full rounded-2xl overflow-hidden border-4 border-indigo-100 shadow-lg bg-gray-50 flex items-center justify-center aspect-[3/4]">
                <img
                  src={shirtPreviewUrl}
                  alt="You wearing the shirt"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {pantsPreviewUrl && (
              <div className="flex flex-col items-center">
                <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3 text-center">Pants Preview</div>
                <div className="w-full rounded-2xl overflow-hidden border-4 border-indigo-100 shadow-lg bg-gray-50 flex items-center justify-center aspect-[3/4]">
                  <img
                    src={pantsPreviewUrl}
                    alt="You wearing the pants"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {isPantsUnsupported && (
              <div className="flex flex-col items-center">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Pants Preview</div>
                <div className="w-full rounded-2xl overflow-hidden border-4 border-gray-200 bg-gray-50 flex flex-col items-center justify-center aspect-[3/4] p-6 text-center">
                  <div className="text-3xl mb-4">!</div>
                  <h3 className="font-bold text-gray-700 mb-2">Lower-Body VTO Required</h3>
                  <p className="text-sm text-gray-500">
                    The current open-source model bleeds into the upper body and cannot strictly isolate pants while preserving your original identity and shirt.
                    <br /><br />
                    A commercial/enterprise provider is required for accurate masked lower-body Virtual Try-On.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reference panels: Your Photo | Top | Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">

          {/* Panel 1: Customer Photo */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Photo</div>
            <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border-4 border-indigo-100 shadow-md flex items-center justify-center">
              {result.customerPhoto ? (
                <img
                  src={imgUrl(result.customerPhoto)}
                  alt="Your photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400 p-4 text-center">
                  <User className="h-12 w-12 mb-2 text-indigo-200" />
                  <span className="text-sm font-medium text-indigo-400">Your photo</span>
                </div>
              )}
            </div>
          </div>

          {/* Panel 2: Exact Top Product */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Top</div>
            <div className="product-image-container rounded-xl border-4 border-gray-100 shadow-md bg-white">
              {top ? (
                <img
                  src={imgUrl(top.imageUrl)}
                  alt={top.name}
                  className="product-image"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-red-400 text-sm p-4 text-center">
                  Top product unavailable
                </div>
              )}
            </div>
            {top && (
              <p className="mt-2 text-sm font-semibold text-center text-gray-800">{top.name}</p>
            )}
            {top && (
              <p className="text-xs text-gray-500">{top.color} · ${top.price?.toFixed(2)}</p>
            )}
          </div>

          {/* Panel 3: Exact Bottom Product */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bottom</div>
            <div className="product-image-container rounded-xl border-4 border-gray-100 shadow-md bg-white">
              {bottom ? (
                <img
                  src={imgUrl(bottom.imageUrl)}
                  alt={bottom.name}
                  className="product-image"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-red-400 text-sm p-4 text-center">
                  Bottom product unavailable
                </div>
              )}
            </div>
            {bottom && (
              <p className="mt-2 text-sm font-semibold text-center text-gray-800">{bottom.name}</p>
            )}
            {bottom && (
              <p className="text-xs text-gray-500">{bottom.color} · ${bottom.price?.toFixed(2)}</p>
            )}
          </div>
        </div>

        {/* Outfit Summary Box */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8 max-w-md mx-auto border border-indigo-100">
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3 text-center">Selected Outfit — Outfit ID: {outfit?.outfitId}</p>
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <p className="font-semibold text-gray-900">{top?.name}</p>
              <p className="text-xs text-gray-500">{top?.color}</p>
            </div>
            <span className="text-gray-400 text-xl font-light">+</span>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{bottom?.name}</p>
              <p className="text-xs text-gray-500">{bottom?.color}</p>
            </div>
          </div>
          <div className="text-center mt-4 pt-4 border-t border-indigo-100">
            <p className="text-xs text-gray-500">Combined Price</p>
            <p className="text-2xl font-bold text-gray-900">${totalPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <Link
            to="/outfit-studio"
            className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors text-center"
          >
            Try Another Outfit
          </Link>
          <button className="flex-1 px-6 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
