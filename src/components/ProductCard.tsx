import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleQuickSummary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (summary) {
      setSummary(null); // Toggle off
      return;
    }
    
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/ai/quick-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productTitle: product.title, 
          productDescription: product.description 
        })
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        
        <button 
          onClick={() => onAddToCart(product)}
          className="absolute bottom-4 right-4 w-12 h-12 bg-white text-black rounded-full shadow-lg flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-black hover:text-white z-10"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button 
          onClick={handleQuickSummary}
          className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm text-indigo-600 rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white z-10"
          title="AI Quick Insight"
        >
          {loadingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        </button>
      </div>

      <div className="p-3 md:p-5">
        <div className="text-[10px] md:text-xs font-medium text-indigo-600 mb-1 md:mb-2 uppercase tracking-wider">{product.category}</div>
        <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
        
        <AnimatePresence mode="wait">
          {summary ? (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs md:text-sm text-indigo-600 font-medium mb-2 md:mb-3 italic bg-indigo-50 p-2 rounded-lg"
            >
              ✨ {summary}
            </motion.p>
          ) : (
            <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3 line-clamp-2">{product.description}</p>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <span className="text-sm md:text-xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="text-[10px] md:text-xs text-gray-400 hidden sm:inline">Sold by {product.seller_name}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
