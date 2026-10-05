import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wand2, Search } from 'lucide-react';

const AI_BASE = 'http://127.0.0.1:6001';

// If imageUrl is a relative path like /storage/... prefix with the AI backend host
const imgUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${AI_BASE}${url}`;
};

const OutfitStudio = () => {
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');

  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        const { data } = await axios.get('http://127.0.0.1:6001/api/outfits');
        setOutfits(data.outfits || []);
      } catch (error) {
        console.error('Failed to load outfits');
      } finally {
        setLoading(false);
      }
    };
    fetchOutfits();
  }, []);

  const filteredOutfits = outfits.filter(o => {
    const matchTop = o.top?.name?.toLowerCase().includes(search.toLowerCase());
    const matchBottom = o.bottom?.name?.toLowerCase().includes(search.toLowerCase());
    const matchSearch = matchTop || matchBottom;
    
    if (genderFilter === 'All') return matchSearch;
    return matchSearch && o.gender === genderFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">MEN'S OUTFIT STUDIO</h1>
          <p className="text-gray-500 mt-1">Discover complete looks from our Men's & Unisex collection.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search outfits..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border rounded-md text-sm w-full shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredOutfits.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border shadow-sm">
          <p className="text-gray-500 text-lg">No outfits match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOutfits.map(outfit => {
            const totalPrice = (outfit.top?.price || 0) + (outfit.bottom?.price || 0);
            
            return (
              <div key={outfit.combinationId} className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col group">
                
                {/* OUTFIT PREVIEW IMAGES */}
                <div className="h-[480px] w-full flex flex-col bg-white relative group border-b border-gray-100">
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded shadow-sm text-gray-700 tracking-wide uppercase z-10">
                    Men's Outfit
                  </div>
                  
                  {/* TOP GARMENT */}
                  <div className="h-1/2 w-full p-2 relative overflow-hidden flex items-center justify-center border-b border-gray-200 border-dashed">
                    <img 
                      src={imgUrl(outfit.top?.imageUrl)} 
                      alt={outfit.top?.name} 
                      className="w-full h-full object-contain scale-[1.2] group-hover:scale-[1.25] transition-transform duration-500 drop-shadow-sm mix-blend-multiply"
                      onError={(e) => { e.target.onerror=null; e.target.src = `https://placehold.co/400x300/f3f4f6/374151?text=${encodeURIComponent(outfit.top?.name||'Top')}` }}
                    />
                  </div>
                  
                  {/* BOTTOM GARMENT */}
                  <div className="h-1/2 w-full p-2 relative overflow-hidden flex items-center justify-center">
                    <img 
                      src={imgUrl(outfit.bottom?.imageUrl)} 
                      alt={outfit.bottom?.name} 
                      className="w-full h-full object-contain scale-[1.2] group-hover:scale-[1.25] transition-transform duration-500 drop-shadow-sm mix-blend-multiply"
                      onError={(e) => { e.target.onerror=null; e.target.src = `https://placehold.co/400x300/f3f4f6/374151?text=${encodeURIComponent(outfit.bottom?.name||'Bottom')}` }}
                    />
                  </div>
                </div>
                
                {/* OUTFIT DETAILS CARD */}
                <div className="p-6 flex-grow flex flex-col bg-white">
                  <div className="mb-4">
                    <p className="text-sm font-bold text-gray-900 mb-1">{outfit.top?.name}</p>
                    <p className="text-sm font-bold text-gray-900">+ {outfit.bottom?.name}</p>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-end mb-6">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Combined Price</p>
                      <p className="font-bold text-xl text-indigo-600">${totalPrice.toFixed(2)}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                      Available
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/try-on/${outfit.combinationId}`)}
                    className="w-full bg-black text-white py-3.5 rounded-lg font-bold hover:bg-indigo-600 transition-colors flex justify-center items-center shadow-md group-hover:shadow-lg"
                  >
                    <Wand2 className="h-5 w-5 mr-2" />
                    AI TRY ON
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OutfitStudio;
