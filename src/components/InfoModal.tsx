import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface InfoModalProps {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}

export default function InfoModal({ title, content, onClose }: InfoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {content}
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
