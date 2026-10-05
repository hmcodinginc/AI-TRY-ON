import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../App';
import { getProductImageSrc, productImageFallback } from '../utils/productImage';

const Cart = () => {
  const { cartItems, removeFromCart, updateQty, clearCart } = useCart();

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const shipping = cartItems.length > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add items from the shop to see them here.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-red-600 hover:underline self-start sm:self-auto"
        >
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const imgSrc = getProductImageSrc(item.product.image, item.product.name, 200);
            return (
              <div
                key={item.key}
                className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
              >
                <Link
                  to={`/product/${item.product.productId}`}
                  className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={imgSrc}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = productImageFallback(item.product.name, 200);
                    }}
                  />
                </Link>

                <div className="flex-grow min-w-0">
                  <Link
                    to={`/product/${item.product.productId}`}
                    className="font-semibold text-gray-900 hover:underline line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    Size: {item.size} · {item.product.color}
                  </p>
                  <p className="font-semibold mt-2">${item.product.price.toFixed(2)}</p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.key)}
                    className="text-gray-400 hover:text-red-600 p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => updateQty(item.key, item.qty - 1)}
                      className="p-2 hover:bg-gray-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-3 text-sm font-medium min-w-[2rem] text-center">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.key, item.qty + 1)}
                      className="p-2 hover:bg-gray-50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    ${(item.product.price * item.qty).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              type="button"
              className="w-full mt-6 bg-black text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Checkout (Demo)
            </button>
            <Link
              to="/products"
              className="block text-center text-sm text-gray-600 hover:text-black mt-4"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
