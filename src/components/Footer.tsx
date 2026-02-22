import React from 'react';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

interface FooterProps {
  onLinkClick: (link: string) => void;
}

export default function Footer({ onLinkClick }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black">
                <span className="font-mono text-lg font-bold">T</span>
              </div>
              <span className="text-xl font-bold">TechMarket</span>
            </div>
            <p className="text-gray-400 mb-6">
              Your premium destination for buying and selling top-tier electronics. Quality guaranteed.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Shop</h3>
            <ul className="space-y-4 text-gray-400">
              <li><button onClick={() => onLinkClick('new')} className="hover:text-white transition-colors">New Arrivals</button></li>
              <li><button onClick={() => onLinkClick('best')} className="hover:text-white transition-colors">Best Sellers</button></li>
              <li><button onClick={() => onLinkClick('deals')} className="hover:text-white transition-colors">Deals</button></li>
              <li><button onClick={() => onLinkClick('sell')} className="hover:text-white transition-colors">Sell Your Tech</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Support</h3>
            <ul className="space-y-4 text-gray-400">
              <li><button onClick={() => onLinkClick('contact')} className="hover:text-white transition-colors">Contact Us</button></li>
              <li><button onClick={() => onLinkClick('locator')} className="hover:text-white transition-colors flex items-center gap-2"><MapPin className="w-4 h-4" /> Store Locator</button></li>
              <li><button onClick={() => onLinkClick('shipping')} className="hover:text-white transition-colors">Shipping Info</button></li>
              <li><button onClick={() => onLinkClick('returns')} className="hover:text-white transition-colors">Returns & Exchanges</button></li>
              <li><button onClick={() => onLinkClick('faq')} className="hover:text-white transition-colors">FAQs</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Contact</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>123 Tech Park, Cyber City,<br />Bangalore, India 560100</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:support@techmarket.com" className="hover:text-white transition-colors">support@techmarket.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} TechMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
