import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Upload, User, Wand2, Image as ImageIcon, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const AI_BASE = 'http://127.0.0.1:6001';
const imgUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${AI_BASE}${url}`;
};

const TryOn = () => {
  const { outfitId } = useParams();
  const navigate = useNavigate();
  
  const [photoData, setPhotoData] = useState({ hasPhoto: false, imageUrl: null });
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Upload states
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Try-on generation state
  const [generating, setGenerating] = useState(false);

  const merchantId = 'merchant_demo';
  const merchantUserId = 'user_001';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [photoRes, outfitRes] = await Promise.all([
        axios.get(`http://127.0.0.1:6001/api/customers/${merchantId}/${merchantUserId}/photo`),
        axios.get(`http://127.0.0.1:6001/api/outfits/${outfitId}`)
      ]);
      
      if (photoRes.data.success) {
        setPhotoData({ hasPhoto: photoRes.data.hasPhoto, imageUrl: photoRes.data.imageUrl });
      }
      setOutfit(outfitRes.data);
    } catch (error) {
      setError('Outfit not found or server error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [outfitId]);

  const handleFileSelect = (e) => {
    setError(null);
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      setError('Please upload an image smaller than 5 MB.');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selected.type)) {
      setError('Invalid file type. Only JPEG, PNG and WEBP are allowed.');
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      setUploading(true);
      setError(null);
      const { data } = await axios.post(`http://127.0.0.1:6001/api/customers/${merchantId}/${merchantUserId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setSuccessMsg('Photo saved successfully');
        setFile(null);
        setPreview(null);
        await fetchData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://127.0.0.1:6001/api/customers/${merchantId}/${merchantUserId}/photo`);
      setPhotoData({ hasPhoto: false, imageUrl: null });
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleChangePhoto = () => {
    setFile(null);
    setPreview(null);
    document.getElementById('photo-upload').click();
  };

  const handleGenerate = async () => {
    if (!outfit) return;
    try {
      setGenerating(true);
      setError(null);
      const { data } = await axios.post('http://127.0.0.1:6001/api/tryon', {
        merchantId,
        merchantUserId,
        topProductId: outfit.topProductId,
        bottomProductId: outfit.bottomProductId
      }, { timeout: 180000 });
      // Important: clear generating state BEFORE navigating, so back button works nicely
      setGenerating(false);
      navigate(`/result/${data.resultId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create the try-on preview. Please try again.');
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/outfit-studio" className="inline-flex items-center text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Studio
      </Link>

      <div className="bg-white p-8 rounded-xl shadow-sm border">
        <h1 className="text-3xl font-bold text-center mb-8">Virtual Try-On Setup</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" /> {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" /> {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* LEFT: OUTFIT SUMMARY */}
          {outfit && (
            <div className="bg-gray-50 p-6 rounded-lg border flex flex-col items-center">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">Selected Outfit</h3>
              <div className="w-full max-w-[200px] outfit-image-container bg-white rounded-md shadow-sm mb-4 border">
                 <div className="h-1/2 w-full border-b">
                   <img 
                      src={imgUrl(outfit.top?.imageUrl)} 
                      alt="Top" 
                      className="outfit-preview-image"
                      onError={(e) => { e.target.onerror=null; e.target.src = "https://placehold.co/200x200/f3f4f6/374151?text=Top" }}
                   />
                 </div>
                 <div className="h-1/2 w-full">
                   <img 
                      src={imgUrl(outfit.bottom?.imageUrl)} 
                      alt="Bottom" 
                      className="outfit-preview-image"
                      onError={(e) => { e.target.onerror=null; e.target.src = "https://placehold.co/200x200/f3f4f6/374151?text=Bottom" }}
                   />
                 </div>
              </div>
              <p className="font-semibold text-center text-indigo-700">{outfit.top?.name}</p>
              <p className="text-sm text-gray-500 mb-2">+</p>
              <p className="font-semibold text-center text-indigo-700">{outfit.bottom?.name}</p>
            </div>
          )}

          {/* RIGHT: PHOTO UPLOAD FLOW */}
          <div>
            {!photoData.hasPhoto && !preview && (
              <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-10 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Upload Your Photo</h2>
                <p className="text-gray-500 mb-6 text-sm">We need a full-body photo. (Max 5MB)</p>
                
                <input 
                  id="photo-upload"
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button 
                  onClick={() => document.getElementById('photo-upload').click()}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 flex items-center mx-auto shadow-sm"
                >
                  <Upload className="h-4 w-4 mr-2" /> Select Image
                </button>
              </div>
            )}

            {preview && !uploading && (
              <div className="text-center">
                <h2 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">Image Preview</h2>
                <div className="w-48 h-64 mx-auto bg-gray-100 rounded-md overflow-hidden border-4 border-gray-200 mb-6 shadow-inner">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex flex-col gap-3">
                  <input 
                    id="photo-upload"
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button 
                    onClick={handleUpload}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 shadow-sm font-bold"
                  >
                    Upload Photo
                  </button>
                  <button 
                    onClick={() => { setPreview(null); setFile(null); }}
                    className="px-6 py-2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Choose Another
                  </button>
                </div>
              </div>
            )}
            
            {uploading && (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Uploading securely...</p>
              </div>
            )}

            {photoData.hasPhoto && !preview && !uploading && (
              <div className="text-center">
                <h2 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">Your Photo</h2>
                <div className="w-48 h-64 mx-auto bg-gray-100 rounded-md overflow-hidden border-4 border-indigo-100 mb-6 shadow-md relative group">
                  <img src={photoData.imageUrl} alt="Saved" className="w-full h-full object-cover" />
                  <button 
                    onClick={handleDelete}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Delete Photo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  <input 
                    id="photo-upload"
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button 
                    onClick={handleGenerate}
                    disabled={generating}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:opacity-95 shadow-xl w-full flex justify-center items-center transform transition-transform hover:-translate-y-1"
                  >
                    {generating ? (
                      <><Wand2 className="h-5 w-5 mr-2 animate-spin" /> Generating your look...</>
                    ) : (
                      <><Wand2 className="h-5 w-5 mr-2" /> ✨ Generate Try-On</>
                    )}
                  </button>
                  <button 
                    onClick={handleChangePhoto}
                    className="px-6 py-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryOn;
