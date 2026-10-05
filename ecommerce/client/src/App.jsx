import { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';

// Global Cart Context
export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

function App() {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, size) => {
    setCartItems(prev => {
      const key = `${product.productId}-${size}`;
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { key, product, size, qty: 1 }];
    });
  };

  const removeFromCart = (key) => {
    setCartItems(prev => prev.filter(i => i.key !== key));
  };

  const updateQty = (key, qty) => {
    if (qty < 1) return removeFromCart(key);
    setCartItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart }}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartContext.Provider>
  );
}

export default App;
