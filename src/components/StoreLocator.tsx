import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Search, Loader2, X, Navigation } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface StoreLocatorProps {
  onClose: () => void;
}

export default function StoreLocator({ onClose }: StoreLocatorProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; groundingChunks: any[] } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    try {
      // Get location if possible
      let location = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
      } catch (e) {
        console.log('Location access denied or failed, searching without it');
      }

      const res = await fetch('/api/ai/maps-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Failed to search stores');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            <h2 className="text-xl font-bold">Store Locator</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find electronics stores near me..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !query}
              className="px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </form>

          <div className="overflow-y-auto max-h-[400px]">
            {result ? (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown>{result.text}</ReactMarkdown>
                </div>
                
                {result.groundingChunks && result.groundingChunks.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Sources & Locations</h3>
                    <div className="grid gap-3">
                      {result.groundingChunks.map((chunk, idx) => {
                        if (chunk.web?.uri) {
                          return (
                            <a 
                              key={idx} 
                              href={chunk.web.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                            >
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm mr-3 text-indigo-600">
                                <Navigation className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{chunk.web.title}</p>
                                <p className="text-xs text-gray-500 truncate">{chunk.web.uri}</p>
                              </div>
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Enter a query to find nearby stores, service centers, or tech hubs.</p>
                <p className="text-xs mt-2">Powered by Google Maps Grounding</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
