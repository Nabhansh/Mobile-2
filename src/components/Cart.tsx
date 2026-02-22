import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, MapPin, CreditCard, ShoppingBag } from 'lucide-react';

export default function Cart({ isOpen, onClose, cartItems, onRemoveItem, onCheckout }) {
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">Your cart is empty.</p>
                  <button onClick={onClose} className="mt-4 text-indigo-600 font-medium hover:underline">
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <motion.div 
                    key={`${item.id}-${index}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-4"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                        <p className="text-sm text-gray-500">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <button 
                        onClick={() => onRemoveItem(index)}
                        className="self-start text-red-500 text-sm flex items-center hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-xl font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
                <button 
                  onClick={onCheckout}
                  className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-transform active:scale-95 flex items-center justify-center"
                >
                  Checkout <CreditCard className="w-5 h-5 ml-2" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
