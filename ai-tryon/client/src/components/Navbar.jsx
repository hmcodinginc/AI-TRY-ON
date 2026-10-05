import { Link, useLocation } from 'react-router-dom';
import { Layers, Shirt, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'text-indigo-600 font-semibold' : 'text-gray-500 hover:text-indigo-500';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold tracking-tight text-gray-900 flex items-center">
              <Layers className="h-6 w-6 text-indigo-600 mr-2" />
              AI Try-On <span className="font-light ml-1 text-gray-500">Platform</span>
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className={`flex items-center ${isActive('/')}`}>
              <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
            </Link>
            <Link to="/products" className={`flex items-center ${isActive('/products')}`}>
              <Shirt className="h-4 w-4 mr-1" /> Synced Products
            </Link>
            <Link to="/outfit-studio" className={`flex items-center ${isActive('/outfit-studio')}`}>
              <User className="h-4 w-4 mr-1" /> Outfit Studio
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
