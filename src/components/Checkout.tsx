import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Loader2, CheckCircle, CreditCard, Truck } from 'lucide-react';

export default function Checkout({ cartItems, total, onBack, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
  });
  const [gps, setGps] = useState(null);
  const [gpsError, setGpsError] = useState(null);

  useEffect(() => {
    // Get GPS location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGps({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setGpsError("Could not fetch location. Please enable GPS for better delivery.");
        }
      );
    } else {
      setGpsError("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      // 1. Create Order on Server
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });
      const orderData = await orderRes.json();

      if (!orderData) {
        alert('Server error. Are you online?');
        setLoading(false);
        return;
      }

      // Handle Mock Flow (for preview without keys)
      if (orderData.mock) {
        console.log('Mock Payment Flow Initiated');
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.id,
            razorpay_payment_id: 'pay_mock_' + Date.now(),
            razorpay_signature: 'mock_signature',
            orderDetails: {
              amount: total,
              customerName: formData.name,
              customerEmail: formData.email,
              address: `${formData.address}, ${formData.city} - ${formData.zip}`,
              gps: gps,
              items: cartItems
            },
            isMock: true
          }),
        });
        
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          onPaymentSuccess();
        } else {
          alert('Payment verification failed.');
        }
        setLoading(false);
        return;
      }

      // 2. Initialize Razorpay (Real Flow)
      const options = {
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890', // Fallback for preview if env not set
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TechMarket',
        description: 'Electronics Purchase',
        image: 'https://via.placeholder.com/150', // Replace with logo
        order_id: orderData.id,
        handler: async function (response) {
          // 3. Verify Payment on Server
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: {
                amount: total,
                customerName: formData.name,
                customerEmail: formData.email,
                address: `${formData.address}, ${formData.city} - ${formData.zip}`,
                gps: gps,
                items: cartItems
              }
            }),
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            onPaymentSuccess();
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: '9999999999',
        },
        theme: {
          color: '#000000',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      setLoading(false);

    } catch (error) {
      console.error(error);
      setLoading(false);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <button onClick={onBack} className="mb-4 md:mb-6 text-gray-500 hover:text-black flex items-center gap-1">
        &larr; Back to Cart
      </button>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8 md:mb-10 scale-90 md:scale-100">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
            <Truck className="w-5 h-5" />
          </div>
          <div className={`w-20 h-1 mx-2 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`} />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
            <CreditCard className="w-5 h-5" />
          </div>
          <div className={`w-20 h-1 mx-2 ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`} />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">{step === 1 ? 'Shipping Details' : 'Payment Method'}</h2>
          
          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input 
                    type="text" 
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                  <input 
                    type="text" 
                    name="zip"
                    required
                    value={formData.zip}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-start gap-3">
                <MapPin className={`w-5 h-5 ${gps ? 'text-green-500' : 'text-gray-400'} mt-0.5`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">GPS Location Tracking</p>
                  <p className="text-xs text-gray-500">
                    {gps ? 'Location acquired for precise delivery.' : gpsError || 'Fetching location...'}
                  </p>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-6 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-all flex items-center justify-center"
              >
                Continue to Payment
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">Shipping To:</h3>
                  <button onClick={() => setStep(1)} className="text-sm text-indigo-600 hover:underline">Edit</button>
                </div>
                <p className="text-sm text-gray-600">{formData.name}</p>
                <p className="text-sm text-gray-600">{formData.address}, {formData.city} - {formData.zip}</p>
                <p className="text-sm text-gray-600">{formData.email}</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-4 border border-black bg-indigo-50 rounded-xl cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="w-5 h-5 text-black focus:ring-black" />
                  <div className="ml-3 flex-1">
                    <span className="block font-bold text-gray-900">Razorpay Secure</span>
                    <span className="block text-xs text-gray-500">Credit/Debit Card, UPI, NetBanking</span>
                  </div>
                  <CreditCard className="w-6 h-6 text-gray-700" />
                </label>
                
                <label className="flex items-center p-4 border border-gray-200 rounded-xl opacity-50 cursor-not-allowed">
                  <input type="radio" name="payment" disabled className="w-5 h-5 text-gray-400" />
                  <div className="ml-3 flex-1">
                    <span className="block font-bold text-gray-500">Cash on Delivery</span>
                    <span className="block text-xs text-gray-400">Currently unavailable</span>
                  </div>
                </label>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ₹${total.toLocaleString('en-IN')}`}
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl h-fit">
          <h3 className="text-lg font-bold mb-4">Order Summary</h3>
          <div className="space-y-4 mb-6">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate w-40">{item.title}</span>
                <span className="font-medium">₹{item.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
            <span className="text-lg font-bold">Total</span>
            <span className="text-xl font-bold text-indigo-600">₹{total.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-6 text-xs text-gray-500">
            <p className="mb-2">Secure Payment via Razorpay</p>
            <p>By placing this order, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
