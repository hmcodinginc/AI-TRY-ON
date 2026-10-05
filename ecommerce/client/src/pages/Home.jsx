import { Link } from 'react-router-dom';

const CATEGORY_IMAGES = {
  Shirts: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
  Jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
  Dresses: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
};

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Fashion Hero" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Discover Your Perfect Look
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mb-8">
            Modern styles designed for every occasion.
          </p>
          <Link 
            to="/products" 
            className="bg-white text-black px-8 py-3 rounded-full font-medium text-lg hover:bg-gray-100 transition-colors"
          >
            Shop Collection
          </Link>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {['Shirts', 'Jeans', 'Dresses'].map((category) => (
            <Link key={category} to={`/products?category=${category}`} className="relative h-64 rounded-lg overflow-hidden group">
              <img
                src={CATEGORY_IMAGES[category]}
                alt={category}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors z-10"></div>
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <h3 className="text-2xl font-bold text-white tracking-wide">{category}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
