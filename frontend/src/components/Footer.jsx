/**
 * ⭐ IMPORTANT: Footer Component
 */

import React from 'react';
import { Phone, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brown text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold text-gold mb-4">🥐 New-ERA Pastries</h3>
            <p className="text-gray-300">
              Fresh, delicious pastries made with love. Order now for delivery or pickup!
            </p>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-bold text-gold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span>+233 XXX XXX XXX</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>Accra, Ghana</span>
              </div>
            </div>
          </div>
          
          {/* Hours */}
          <div>
            <h4 className="font-bold text-gold mb-4">Hours</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>Mon-Sat: 8AM - 8PM</span>
              </div>
              <div className="text-sm">Sunday: Closed</div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; 2026 New-ERA Pastries. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
