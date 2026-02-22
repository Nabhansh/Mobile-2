import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Search, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onSellClick: () => void;
  onLoginClick: () => void;
  onSearch: (query: string) => void;
  onCategoryClick: (category: string) => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

export default function Navbar({ 
  cartCount, 
  onCartClick, 
  onSellClick, 
  onLoginClick, 
  onSearch,
  onCategoryClick,
  user,
  onLogout
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setIsSearchOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="text-2xl font-bold tracking-tighter text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                <span className="font-mono text-lg">T</span>
              </div>
              TechMarket
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => onCategoryClick('new')} className="text-gray-600 hover:text-black font-medium transition-colors">New Arrivals</button>
            <button onClick={() => onCategoryClick('best')} className="text-gray-600 hover:text-black font-medium transition-colors">Best Sellers</button>
            <button onClick={() => onCategoryClick('deals')} className="text-gray-600 hover:text-black font-medium transition-colors">Deals</button>
            <button onClick={onSellClick} className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">Sell Product</button>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="absolute right-0 top-1/2 -translate-y-1/2 w-64">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search products..."
                    className="w-full pl-4 pr-10 py-1 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery) setIsSearchOpen(false);
                    }}
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button onClick={() => setIsSearchOpen(true)} className="text-gray-600 hover:text-black transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Hi, {user.name.split(' ')[0]}</span>
                <button onClick={onLogout} className="text-gray-600 hover:text-red-600 transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={onLoginClick} className="text-gray-600 hover:text-black transition-colors">
                <User className="w-5 h-5" />
              </button>
            )}
            
            <button onClick={onCartClick} className="relative text-gray-600 hover:text-black transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-900">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden fixed top-[60px] left-0 right-0 z-50 shadow-xl max-h-[calc(100vh-60px)] overflow-y-auto"
          >
            <div className="px-4 pt-4 pb-8 space-y-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 p-2">
                  <Search className="w-5 h-5" />
                </button>
              </form>
              
              <div className="space-y-2">
                <button onClick={() => { onCategoryClick('new'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-800 font-medium text-lg">New Arrivals</button>
                <button onClick={() => { onCategoryClick('best'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-800 font-medium text-lg">Best Sellers</button>
                <button onClick={() => { onCategoryClick('deals'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-800 font-medium text-lg">Deals</button>
                <button onClick={() => { onSellClick(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-medium text-lg">Sell Product</button>
              </div>
              
              <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                {user ? (
                  <div className="col-span-2 flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-900">Hi, {user.name}</span>
                    <button onClick={onLogout} className="text-red-600 font-medium text-sm px-3 py-1 bg-red-50 rounded-lg">Logout</button>
                  </div>
                ) : (
                  <button onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50">
                    <User className="w-5 h-5 mr-2" /> Login
                  </button>
                )}
                <button onClick={() => { onCartClick(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-900 col-span-2">
                  <ShoppingCart className="w-5 h-5 mr-2" /> View Cart ({cartCount})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
