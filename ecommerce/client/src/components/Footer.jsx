const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t mt-12 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">AISTYLE</h3>
            <p className="text-gray-500 text-sm">
              Discover your perfect look with modern styles designed for every occasion.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-black">New Arrivals</a></li>
              <li><a href="#" className="hover:text-black">Men</a></li>
              <li><a href="#" className="hover:text-black">Women</a></li>
              <li><a href="#" className="hover:text-black">Accessories</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-black">Contact Us</a></li>
              <li><a href="#" className="hover:text-black">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-black">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-gray-500 mb-2">Subscribe to get special offers and updates.</p>
            <div className="flex">
              <input type="email" placeholder="Email" className="border px-3 py-2 text-sm w-full focus:outline-none" />
              <button className="bg-black text-white px-4 py-2 text-sm">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} AISTYLE. Demo Application.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
