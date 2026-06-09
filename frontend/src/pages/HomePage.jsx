/**
 * ⭐ IMPORTANT: Home Page
 * Landing page with hero section and featured pastries
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Clock, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brown to-accent text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
            🥐 Welcome to New-ERA Pastries
          </h1>
          <p className="text-xl text-cream mb-8 max-w-2xl mx-auto">
            Fresh, delicious pastries delivered to your doorstep. Order now and taste the difference!
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/catalog"
              className="bg-gold text-brown px-8 py-4 rounded-lg font-bold text-lg hover:bg-pastry transition flex items-center gap-2"
            >
              Browse Menu <ArrowRight size={20} />
            </Link>
            <Link
              to="/auth"
              className="bg-white text-brown px-8 py-4 rounded-lg font-bold text-lg hover:bg-cream transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-brown">Why Choose Us?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-gold hover:shadow-xl transition">
              <Truck className="text-gold mb-4" size={40} />
              <h3 className="text-xl font-bold text-brown mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Get your pastries delivered hot and fresh within 30-45 minutes
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-gold hover:shadow-xl transition">
              <Clock className="text-gold mb-4" size={40} />
              <h3 className="text-xl font-bold text-brown mb-2">Fresh Daily</h3>
              <p className="text-gray-600">
                Baked fresh every morning with premium ingredients
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-gold hover:shadow-xl transition">
              <Award className="text-gold mb-4" size={40} />
              <h3 className="text-xl font-bold text-brown mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Award-winning recipes passed down through generations
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Preview */}
      <section className="bg-cream py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-brown">Our Categories</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Cakes', emoji: '🎂', color: 'from-pink-400 to-red-400' },
              { name: 'Cookies', emoji: '🍪', color: 'from-yellow-400 to-orange-400' },
              { name: 'Bread', emoji: '🍞', color: 'from-amber-400 to-yellow-600' },
              { name: 'Seasonal', emoji: '✨', color: 'from-purple-400 to-pink-400' }
            ].map((cat) => (
              <Link
                key={cat.name}
                to={`/catalog?category=${cat.name.toLowerCase()}`}
                className={`bg-gradient-to-br ${cat.color} text-white p-8 rounded-lg text-center hover:shadow-lg transform hover:scale-105 transition`}
              >
                <div className="text-5xl mb-2">{cat.emoji}</div>
                <h3 className="font-bold text-xl">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-brown text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl text-cream mb-8">
            Join thousands of happy customers enjoying delicious pastries
          </p>
          
          <Link
            to="/catalog"
            className="bg-gold text-brown px-8 py-4 rounded-lg font-bold text-lg hover:bg-pastry transition inline-block"
          >
            Browse Our Menu
          </Link>
        </div>
      </section>
    </div>
  );
}
