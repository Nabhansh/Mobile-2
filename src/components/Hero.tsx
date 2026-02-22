import React from 'react';
import { motion } from 'motion/react';

interface HeroProps {
  onShopNow: () => void;
  onViewDeals: () => void;
}

export default function Hero({ onShopNow, onViewDeals }: HeroProps) {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=2021&auto=format&fit=crop" 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl mx-auto md:mx-0"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight mb-4 md:mb-6 leading-tight">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Tech is Here.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 md:mb-8 font-light px-4 md:px-0">
            Discover the latest in premium electronics. From powerful laptops to immersive audio, upgrade your lifestyle today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start px-4 md:px-0">
            <button 
              onClick={onShopNow}
              className="w-full sm:w-auto px-8 py-3 md:py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-transform hover:scale-105 active:scale-95 text-sm md:text-base"
            >
              Shop Now
            </button>
            <button 
              onClick={onViewDeals}
              className="w-full sm:w-auto px-8 py-3 md:py-4 bg-transparent border border-white text-white font-semibold rounded-full hover:bg-white/10 transition-transform hover:scale-105 active:scale-95 text-sm md:text-base"
            >
              View Deals
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
