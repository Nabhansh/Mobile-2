import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import SellProductForm from './components/SellProductForm';
import LoginModal from './components/LoginModal';
import InfoModal from './components/InfoModal';
import ChatWidget from './components/ChatWidget';
import StoreLocator from './components/StoreLocator';
import Footer from './components/Footer';
import { Loader2 } from 'lucide-react';
import { Product } from './types';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSellFormOpen, setIsSellFormOpen] = useState(false);
  const [isStoreLocatorOpen, setIsStoreLocatorOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<{ title: string; content: React.ReactNode } | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [view, setView] = useState('home'); // 'home', 'checkout', 'success'
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('New Arrivals');
  
  const productSectionRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const scrollToProducts = () => {
    productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryClick = (category: string) => {
    setView('home');
    scrollToProducts();
    
    if (category === 'new') {
      setActiveCategory('New Arrivals');
      setFilteredProducts([...products].sort((a, b) => b.id - a.id));
    } else if (category === 'best') {
      setActiveCategory('Best Sellers');
      // Randomize for demo
      setFilteredProducts([...products].sort(() => 0.5 - Math.random()));
    } else if (category === 'deals') {
      setActiveCategory('Deals');
      // Filter items under 5000 or specific logic
      setFilteredProducts(products.filter(p => p.price < 5000));
    } else {
      setActiveCategory('All Products');
      setFilteredProducts(products);
    }
  };

  const handleSearch = (query: string) => {
    setView('home');
    scrollToProducts();
    setActiveCategory(`Search: "${query}"`);
    const lower = query.toLowerCase();
    setFilteredProducts(products.filter(p => 
      p.title.toLowerCase().includes(lower) || 
      p.description.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower)
    ));
  };

  const handleFooterLinkClick = (link: string) => {
    if (link === 'sell') {
      setIsSellFormOpen(true);
      return;
    }
    if (link === 'locator') {
      setIsStoreLocatorOpen(true);
      return;
    }
    if (['new', 'best', 'deals'].includes(link)) {
      handleCategoryClick(link);
      return;
    }
    
    let title = '';
    let content = null;

    switch (link) {
      case 'contact':
        title = 'Contact Us';
        content = (
          <div className="space-y-4">
            <p>We'd love to hear from you! Reach out to us via:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Email: support@techmarket.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Address: 123 Tech Park, Cyber City, Bangalore, India</li>
            </ul>
            <p className="mt-4">Business Hours: Mon - Fri, 9 AM - 6 PM IST</p>
          </div>
        );
        break;
      case 'shipping':
        title = 'Shipping Information';
        content = (
          <div className="space-y-4">
            <p>We ship across India via trusted courier partners (BlueDart, Delhivery).</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Standard Shipping: 3-5 business days (Free on orders above ₹999)</li>
              <li>Express Shipping: 1-2 business days (₹150 extra)</li>
            </ul>
            <p>You will receive a tracking link via email once your order is dispatched.</p>
          </div>
        );
        break;
      case 'returns':
        title = 'Returns & Exchanges';
        content = (
          <div className="space-y-4">
            <p>We have a 7-day return policy for defective or damaged items.</p>
            <p>To initiate a return:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to your orders page (if logged in) or contact support.</li>
              <li>Provide photos of the issue.</li>
              <li>We will arrange a pickup within 48 hours.</li>
            </ol>
            <p>Refunds are processed to the original payment method within 5-7 days.</p>
          </div>
        );
        break;
      case 'faq':
        title = 'Frequently Asked Questions';
        content = (
          <div className="space-y-4">
            <div className="font-semibold">Q: Do you offer warranty?</div>
            <p className="mb-4">A: Yes, all products come with a standard manufacturer warranty of at least 1 year.</p>
            <div className="font-semibold">Q: Can I cancel my order?</div>
            <p className="mb-4">A: Yes, you can cancel before the item is shipped.</p>
            <div className="font-semibold">Q: Is my payment secure?</div>
            <p>A: Absolutely. We use Razorpay for 100% secure transactions.</p>
          </div>
        );
        break;
    }

    if (title && content) {
      setInfoModal({ title, content });
    }
  };

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setView('checkout');
    window.scrollTo(0, 0);
  };

  const handlePaymentSuccess = () => {
    setCart([]);
    setView('success');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar 
        cartCount={cart.length} 
        onCartClick={() => setIsCartOpen(true)}
        onSellClick={() => setIsSellFormOpen(true)}
        onLoginClick={() => setIsLoginOpen(true)}
        onSearch={handleSearch}
        onCategoryClick={handleCategoryClick}
        user={user}
        onLogout={() => setUser(null)}
      />

      {view === 'home' && (
        <>
          <Hero 
            onShopNow={scrollToProducts}
            onViewDeals={() => handleCategoryClick('deals')}
          />
          
          <main ref={productSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">{activeCategory}</h2>
                <p className="text-gray-500">
                  {filteredProducts.length} products found
                </p>
              </div>
              <div className="hidden sm:block">
                <select 
                  className="border-none bg-gray-100 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-black"
                  onChange={(e) => {
                    const val = e.target.value;
                    let sorted = [...filteredProducts];
                    if (val === 'low') sorted.sort((a, b) => a.price - b.price);
                    if (val === 'high') sorted.sort((a, b) => b.price - a.price);
                    if (val === 'latest') sorted.sort((a, b) => b.id - a.id);
                    setFilteredProducts(sorted);
                  }}
                >
                  <option value="latest">Sort by: Latest</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={addToCart} 
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 text-gray-500">
                    No products found. Try a different search or category.
                  </div>
                )}
              </div>
            )}
          </main>
        </>
      )}

      {view === 'checkout' && (
        <div className="pt-32 pb-20">
          <Checkout 
            cartItems={cart} 
            total={cart.reduce((sum, item) => sum + item.price, 0)}
            onBack={() => setView('home')}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </div>
      )}

      {view === 'success' && (
        <div className="pt-32 pb-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Payment Successful!</h2>
          <p className="text-gray-500 max-w-md mb-8">
            Thank you for your purchase. A confirmation email has been sent to your inbox.
          </p>
          <button 
            onClick={() => setView('home')}
            className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      )}

      <Footer onLinkClick={handleFooterLinkClick} />

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cart} 
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {isSellFormOpen && (
        <SellProductForm 
          onClose={() => setIsSellFormOpen(false)}
          onProductAdded={fetchProducts}
        />
      )}

      {isLoginOpen && (
        <LoginModal 
          onClose={() => setIsLoginOpen(false)}
          onLogin={setUser}
        />
      )}

      {isStoreLocatorOpen && (
        <StoreLocator 
          onClose={() => setIsStoreLocatorOpen(false)}
        />
      )}

      {infoModal && (
        <InfoModal 
          title={infoModal.title}
          content={infoModal.content}
          onClose={() => setInfoModal(null)}
        />
      )}

      <ChatWidget />
    </div>
  );
}
