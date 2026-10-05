import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../utils/config';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fallback for API URL since we don't have .env setup fully on frontend yet
        let url = `${API_URL}/api/products`;
        if (categoryParam) {
          url = `${API_URL}/api/products/category/${categoryParam}`;
        }
        
        const { data } = await axios.get(url);
        
        let filteredData = data;
        if (searchParam) {
          filteredData = data.filter(p => p.name.toLowerCase().includes(searchParam.toLowerCase()));
        }
        
        setProducts(filteredData);
      } catch (err) {
        setError('Failed to fetch products. Is the backend running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, searchParam]);

  const handleCategoryChange = (e) => {
    if (e.target.value) {
      setSearchParams({ category: e.target.value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          {categoryParam ? `${categoryParam} Collection` : 'All Products'}
        </h1>
        
        <div className="mt-4 md:mt-0 flex space-x-4">
          <select 
            className="border border-gray-300 rounded px-3 py-2 bg-white"
            value={categoryParam || ''}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            <option value="Shirts">Shirts</option>
            <option value="T-Shirts">T-Shirts</option>
            <option value="Jeans">Jeans</option>
            <option value="Pants">Pants</option>
            <option value="Jackets">Jackets</option>
            <option value="Dresses">Dresses</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-center">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
