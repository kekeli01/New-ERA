/**
 * ⭐ IMPORTANT: Checkout Page
 * Delivery type selection, payment method, and order creation
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Phone } from 'lucide-react';
import { useCartStore, useAuthStore } from '../store';
import { ordersAPI } from '../api';
import { toast } from 'react-toastify';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const { customer } = useAuthStore();
  const total = useCartStore((state) => state.getCartTotal());
  
  const [step, setStep] = useState(1); // 1: Delivery, 2: Payment, 3: Review
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('pay_on_pickup');
  const [deliveryZone, setDeliveryZone] = useState('Zone A (Central)');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  
  const deliveryFees = {
    'Zone A (Central)': 5.00,
    'Zone B (Suburban)': 10.00,
    'Zone C (Outskirts)': 15.00
  };
  
  const deliveryFee = deliveryType === 'delivery' ? (deliveryFees[deliveryZone] || 0) : 0;
  const finalTotal = total + deliveryFee;
  
  const handlePlaceOrder = async () => {
    if (deliveryType === 'delivery' && !deliveryAddress) {
      toast.error('Please enter delivery address');
      return;
    }
    
    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        pastry_id: item.id,
        qty: item.qty
      }));
      
      const response = await ordersAPI.createOrder(
        orderItems,
        deliveryType,
        paymentMethod,
        deliveryAddress,
        deliveryZone
      );
      
      toast.success('Order placed successfully! 🎉');
      useCartStore.getState().clearCart();
      navigate(`/orders`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };
  
  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-brown mb-8">📋 Checkout</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery */}
            <div className={`bg-white rounded-lg shadow-lg p-6 ${step > 1 ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  step >= 1 ? 'bg-brown' : 'bg-gray-400'
                }`}>
                  1
                </div>
                <h2 className="text-2xl font-bold text-brown">Delivery Method</h2>
              </div>
              
              {step === 1 && (
                <div className="space-y-4">
                  {/* Pickup Option */}
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                    deliveryType === 'pickup' ? 'border-brown bg-brown/5' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      value="pickup"
                      checked={deliveryType === 'pickup'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div>
                      <h3 className="font-bold text-brown">Pickup</h3>
                      <p className="text-sm text-gray-600">Pick up your order at our shop</p>
                    </div>
                  </label>
                  
                  {/* Delivery Option */}
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                    deliveryType === 'delivery' ? 'border-brown bg-brown/5' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      value="delivery"
                      checked={deliveryType === 'delivery'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div>
                      <h3 className="font-bold text-brown">Delivery</h3>
                      <p className="text-sm text-gray-600">We'll deliver to your address</p>
                    </div>
                  </label>
                  
                  {/* Delivery Zone (if delivery selected) */}
                  {deliveryType === 'delivery' && (
                    <div className="mt-4 space-y-3">
                      <label className="block font-semibold text-brown">Delivery Zone</label>
                      <select
                        value={deliveryZone}
                        onChange={(e) => setDeliveryZone(e.target.value)}
                        className="w-full border-2 border-gold rounded-lg px-4 py-2 outline-none"
                      >
                        {Object.entries(deliveryFees).map(([zone, fee]) => (
                          <option key={zone} value={zone}>
                            {zone} - GHS {fee.toFixed(2)}
                          </option>
                        ))}
                      </select>
                      
                      <label className="block font-semibold text-brown mt-4">Delivery Address</label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your delivery address"
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-gold"
                        rows="3"
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-brown text-white py-3 rounded-lg font-bold hover:bg-accent transition mt-4"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}
              
              {step > 1 && (
                <div className="text-gray-600">
                  <MapPin className="inline mr-2" size={20} />
                  {deliveryType === 'pickup' ? 'Pickup' : `Delivery to ${deliveryZone}`}
                </div>
              )}
            </div>
            
            {/* Step 2: Payment */}
            <div className={`bg-white rounded-lg shadow-lg p-6 ${step > 2 ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  step >= 2 ? 'bg-brown' : 'bg-gray-400'
                }`}>
                  2
                </div>
                <h2 className="text-2xl font-bold text-brown">Payment Method</h2>
              </div>
              
              {step === 2 && (
                <div className="space-y-4">
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                    paymentMethod === 'mtn_momo' ? 'border-brown bg-brown/5' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      value="mtn_momo"
                      checked={paymentMethod === 'mtn_momo'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div>
                      <h3 className="font-bold text-brown">MTN Mobile Money</h3>
                      <p className="text-sm text-gray-600">Pay securely with your MTN account</p>
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                    paymentMethod === 'pay_on_pickup' ? 'border-brown bg-brown/5' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      value="pay_on_pickup"
                      checked={paymentMethod === 'pay_on_pickup'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div>
                      <h3 className="font-bold text-brown">Pay on {deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}</h3>
                      <p className="text-sm text-gray-600">Pay cash when you receive your order</p>
                    </div>
                  </label>
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 text-brown border-2 border-brown py-3 rounded-lg font-bold hover:bg-brown/10 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-brown text-white py-3 rounded-lg font-bold hover:bg-accent transition"
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              )}
              
              {step > 2 && (
                <div className="text-gray-600">
                  <CreditCard className="inline mr-2" size={20} />
                  {paymentMethod === 'mtn_momo' ? 'MTN Mobile Money' : `Pay on ${deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}`}
                </div>
              )}
            </div>
            
            {/* Step 3: Review */}
            <div className={`bg-white rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  step >= 3 ? 'bg-brown' : 'bg-gray-400'
                }`}>
                  3
                </div>
                <h2 className="text-2xl font-bold text-brown">Review Order</h2>
              </div>
              
              {step >= 3 && (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b border-gray-200">
                      <span>{item.name} x{item.qty}</span>
                      <span>GHS {(parseFloat(item.price) * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Summary Sidebar */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-24">
            <h2 className="text-2xl font-bold text-brown mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6 pb-6 border-b-2 border-gold">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">GHS {total.toFixed(2)}</span>
              </div>
              
              {deliveryType === 'delivery' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold">GHS {deliveryFee.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mb-6 text-lg">
              <span className="font-bold text-brown">Total</span>
              <span className="text-2xl font-bold text-gold">GHS {finalTotal.toFixed(2)}</span>
            </div>
            
            {step === 3 && (
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-brown text-white py-3 rounded-lg font-bold hover:bg-accent transition disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
