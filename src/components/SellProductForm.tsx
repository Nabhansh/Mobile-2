import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Loader2, X } from 'lucide-react';

export default function SellProductForm({ onClose, onProductAdded }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Accessories',
    image: '',
    seller_name: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      });

      if (response.ok) {
        onProductAdded();
        onClose();
      } else {
        alert('Failed to list product');
      }
    } catch (error) {
      console.error(error);
      alert('Error listing product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold">Sell Your Product</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. iPhone 13 Pro Max"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe condition, features, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input 
                type="number" 
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option>Mobile Phones</option>
                <option>Laptops</option>
                <option>Power Banks</option>
                <option>Chargers</option>
                <option>Speakers</option>
                <option>Headphones</option>
                <option>Accessories</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input 
              type="url" 
              name="image"
              required
              value={formData.image}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Paste a direct image link (e.g. from Unsplash or Imgur)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (Seller)</label>
            <input 
              type="text" 
              name="seller_name"
              required
              value={formData.seller_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'List Product'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
