import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { getProductImageSrc, productImageFallback } from '../utils/productImage';

const ProductCard = ({ product }) => {
  const imgSrc = getProductImageSrc(product.image, product.name, 500);

  return (
    <div className="group flex flex-col bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/product/${product.productId}`} className="product-image-container">
        <img 
          src={imgSrc} 
          alt={product.name} 
          className="product-image group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = productImageFallback(product.name, 500);
          }}
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <Link to={`/product/${product.productId}`} className="font-medium text-gray-900 hover:underline line-clamp-1">
            {product.name}
          </Link>
          <span className="font-semibold whitespace-nowrap ml-2">${product.price.toFixed(2)}</span>
        </div>
        <div className="text-sm text-gray-500 mb-2">{product.category} &bull; {product.color}</div>
        
        <div className="mt-auto flex items-center pt-2">
          <Star className="h-4 w-4 fill-current text-yellow-400" />
          <span className="ml-1 text-sm text-gray-600">{product.rating} ({product.reviewCount})</span>
        </div>
        
        <Link 
          to={`/product/${product.productId}`}
          className="mt-4 w-full bg-black text-white text-center py-2 rounded text-sm hover:bg-gray-800 transition-colors"
        >
          View Product
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
