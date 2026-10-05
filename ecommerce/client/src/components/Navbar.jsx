import { Link } from 'react-router-dom';
import { ShoppingCart, Wand2 } from 'lucide-react';
import { useCart } from '../App';
import { TRYON_APP_URL } from '../utils/config';

const Navbar = () => {
  const { cartItems } = useCart();
  const totalQty = cartItems.reduce((sum, i) => sum + i.qty, 0);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-tighter">
            AI<span className="text-gray-500">STYLE</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex space-x-8">
            <Link to="/products" className="text-gray-700 hover:text-black font-medium transition-colors">All Products</Link>
            <Link to="/products?category=Shirts" className="text-gray-700 hover:text-black font-medium transition-colors">Shirts</Link>
            <Link to="/products?category=Jeans" className="text-gray-700 hover:text-black font-medium transition-colors">Jeans</Link>
            <Link to="/products?category=Dresses" className="text-gray-700 hover:text-black font-medium transition-colors">Dresses</Link>
          </div>

          {/* Right icons */}
          <div className="flex items-center space-x-4">
            {/* AI Try-On CTA */}
            <a
              href={`${TRYON_APP_URL}/outfit-studio`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity shadow-sm"
            >
              <Wand2 className="h-4 w-4" />
              AI Try-On
            </a>

            {/* Cart */}
            <Link to="/cart" className="text-gray-500 hover:text-black relative">
              <ShoppingCart className="h-5 w-5" />
              {totalQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {totalQty > 9 ? '9+' : totalQty}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
