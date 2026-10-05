import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import OutfitStudio from './pages/OutfitStudio';
import TryOn from './pages/TryOn';
import Result from './pages/Result';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/outfit-studio" element={<OutfitStudio />} />
            <Route path="/try-on/:outfitId" element={<TryOn />} />
            <Route path="/result/:resultId" element={<Result />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
