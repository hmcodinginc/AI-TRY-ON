import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

const AI_BASE = 'http://127.0.0.1:6001';
const imgUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${AI_BASE}${url}`;
};


const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://127.0.0.1:6001/api/products');
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => categoryFilter ? p.category === categoryFilter : true)
    .sort((a, b) => {
      if (sortOption === 'price_asc') return a.price - b.price;
      if (sortOption === 'price_desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Synced Products</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-md text-sm w-full sm:w-64"
            />
          </div>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="">Sort by...</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div>Loading products...</div>
      ) : products.length === 0 ? (
        <div className="bg-white p-8 text-center rounded border">
          <p className="text-gray-500">No products synced yet. Go to Dashboard to sync.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-8 text-center rounded border">
          <p className="text-gray-500">No products match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map(p => (
            <div key={p.merchantProductId} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow flex flex-col">
              <div className="product-image-container">
                <img 
                  src={imgUrl(p.imageUrl)} 
                  alt={p.name} 
                  className="product-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/400x400/f3f4f6/374151?text=${encodeURIComponent(p.name)}`;
                  }}
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-900 truncate" title={p.name}>{p.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{p.category} &bull; {p.subcategory} &bull; {p.color}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="font-bold">${p.price.toFixed(2)}</span>
                  <span className={`text-xs px-2 py-1 rounded ${p.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
