/**
 * ⭐ IMPORTANT: Cart Page
 * Shows items added to cart with qty adjustment and checkout button
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQty, getCartTotal } = useCartStore();
  
  const total = getCartTotal();
  
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-brown mb-8">🛒 Shopping Cart</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-brown mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Browse our menu and add some delicious pastries!</p>
            
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 bg-brown text-white px-8 py-3 rounded-lg font-bold hover:bg-accent transition"
            >
              <ArrowLeft size={20} />
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-brown mb-8">🛒 Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6 flex gap-4">
                {/* Image */}
                <div className="w-24 h-24 bg-pastry rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="text-4xl">🥐</div>
                </div>
                
                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-brown">{item.name}</h3>
                  <p className="text-gray-600">{item.category_name}</p>
                  <p className="text-xl font-bold text-gold mt-2">
                    GHS {parseFloat(item.price).toFixed(2)}
                  </p>
                </div>
                
                {/* Quantity */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                  >
                    <Minus size={18} />
                  </button>
                  
                  <span className="w-8 text-center font-bold text-lg">{item.qty}</span>
                  
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                  >
                    <Plus size={18} />
                  </button>
                  
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 bg-red-200 hover:bg-red-300 rounded-lg transition ml-4"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-24">
            <h2 className="text-2xl font-bold text-brown mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6 pb-6 border-b-2 border-gold">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">GHS {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery (calculated at checkout)</span>
                <span className="font-semibold">TBD</span>
              </div>
            </div>
            
            <div className="flex justify-between mb-6 text-lg">
              <span className="font-bold text-brown">Estimated Total</span>
              <span className="text-2xl font-bold text-gold">GHS {total.toFixed(2)}</span>
            </div>
            
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-brown text-white py-3 rounded-lg font-bold hover:bg-accent transition"
            >
              Proceed to Checkout
            </button>
            
            <Link
              to="/catalog"
              className="block text-center mt-3 text-brown border-2 border-brown py-2 rounded-lg hover:bg-brown/10 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
