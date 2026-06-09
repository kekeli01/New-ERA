/**
 * ⭐ IMPORTANT: Auth Page with Phone OTP
 * Handles customer login/registration via OTP
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, User, Mail } from 'lucide-react';
import { authAPI } from '../api';
import { useAuthStore } from '../store';
import { toast } from 'react-toastify';

export default function AuthPage() {
  const navigate = useNavigate();
  const setCustomer = useAuthStore((state) => state.setCustomer);
  
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Details
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }
    
    setLoading(true);
    try {
      await authAPI.sendOTP(phone);
      toast.success('OTP sent to your phone!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };
  
  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }
    
    setStep(3);
  };
  
  // Step 3: Complete Registration
  const handleCompleteAuth = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error('Please enter your name');
      return;
    }
    
    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(phone, otp, name, email);
      
      // Save to local storage
      localStorage.setItem('customerPhone', phone);
      
      // Update auth store
      setCustomer(response.data.customer, phone);
      
      toast.success('Welcome! 🎉');
      navigate('/catalog');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Authentication failed');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-pastry flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center text-brown mb-2">🥐 New-ERA</h1>
        <p className="text-center text-gray-600 mb-8">Sign in to order delicious pastries</p>
        
        {/* Step 1: Phone */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-brown mb-2">Phone Number</label>
              <div className="flex items-center gap-3 border-2 border-gold rounded-lg px-4 py-3">
                <Phone className="text-gold" size={20} />
                <input
                  type="tel"
                  placeholder="+233 XXXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Include country code</p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brown text-white py-3 rounded-lg font-bold hover:bg-accent transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}
        
        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-brown mb-2">Enter OTP</label>
              <div className="flex items-center gap-3 border-2 border-gold rounded-lg px-4 py-3">
                <Lock className="text-gold" size={20} />
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  className="flex-1 outline-none text-2xl tracking-widest"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Check your SMS/WhatsApp</p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-brown text-white py-3 rounded-lg font-bold hover:bg-accent transition"
            >
              Verify OTP
            </button>
            
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-3 text-brown border-2 border-brown py-2 rounded-lg font-semibold hover:bg-brown/10 transition"
            >
              Change Phone
            </button>
          </form>
        )}
        
        {/* Step 3: Complete Profile */}
        {step === 3 && (
          <form onSubmit={handleCompleteAuth}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-brown mb-2">Full Name</label>
              <div className="flex items-center gap-3 border-2 border-gold rounded-lg px-4 py-3">
                <User className="text-gold" size={20} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 outline-none"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-brown mb-2">Email (Optional)</label>
              <div className="flex items-center gap-3 border-2 border-gray-300 rounded-lg px-4 py-3">
                <Mail className="text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 outline-none"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-brown py-3 rounded-lg font-bold hover:bg-pastry transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Continue Shopping'}
            </button>
          </form>
        )}
        
        {/* Progress Indicator */}
        <div className="mt-8 flex gap-2 justify-center">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition ${
                s <= step ? 'bg-gold w-8' : 'bg-gray-300 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
