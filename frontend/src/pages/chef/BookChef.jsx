
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FavoriteButton from '../../components/FavoriteButton';
import { buildApiEndpoint } from '../../utils/apiConfig';
import { useThemeAwareStyle } from '../../utils/themeUtils';

// OpenRouteService API key (store securely in production)
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

const BookChef = () => {
  const { theme, classes, isDark, getClass } = useThemeAwareStyle();
  const { id } = useParams();
  const navigate = useNavigate();
  const [chefs, setChefs] = useState([]);
  const [selectedChef, setSelectedChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({ 
    address: '', 
    city: '', 
    state: '', 
    lat: '', 
    lon: '' 
  });
  const [locationError, setLocationError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  // Auto-generate complete address when city and state change
  useEffect(() => {
    if (userLocation.city && userLocation.state) {
      const autoAddress = `${userLocation.city}, ${userLocation.state}`;
      setUserLocation(prev => ({ ...prev, address: autoAddress }));
    }
  }, [userLocation.city, userLocation.state]);

  const [bookingDetails, setBookingDetails] = useState({
    serviceType: '', // New field for service type
    date: '',
    time: '',
    duration: 2, // New field for duration in hours
    guestCount: '',
    addOns: [],
    notes: '',
    location: '' // New: store address string
  });

  // Service type options with different pricing structures
  const serviceTypes = [
    {
      id: 'birthday',
      name: 'Birthday Party',
      icon: '🎂',
      description: 'Celebrate special birthdays with custom menus and party atmosphere',
      baseMultiplier: 1.5, // 50% more than base rate
      minDuration: 3,
      maxDuration: 8,
      features: ['Custom birthday menu', 'Party presentation', 'Birthday cake coordination']
    },
    {
      id: 'marriage',
      name: 'Marriage Ceremony',
      icon: '💒',
      description: 'Grand wedding celebrations with multi-course traditional meals',
      baseMultiplier: 2.5, // 150% more than base rate
      minDuration: 6,
      maxDuration: 12,
      features: ['Multi-course menu', 'Traditional cuisine', 'Large quantity cooking', 'Premium service']
    },
    {
      id: 'daily',
      name: 'Daily Cook',
      icon: '🍽️',
      description: 'Regular home cooking for daily meals and weekly meal prep',
      baseMultiplier: 0.8, // 20% less than base rate for regular service
      minDuration: 2,
      maxDuration: 6,
      features: ['Home-style cooking', 'Meal planning', 'Grocery assistance', 'Flexible timing']
    }
  ];

  // Dynamic add-ons based on service type
  const getAddOnsForService = (serviceType) => {
    const baseAddOns = [
      { name: 'Cleanup', price: 150, icon: '🧹', description: 'Complete post-meal cleanup service' }
    ];

    const serviceSpecificAddOns = {
      birthday: [
        { name: 'Party Decor', price: 500, icon: '🎨', description: 'Birthday party table decoration' },
        { name: 'Birthday Cake', price: 800, icon: '🎂', description: 'Custom birthday cake' },
        { name: 'Photography', price: 1200, icon: '📸', description: 'Party photography service' }
      ],
      marriage: [
        { name: 'Wedding Decor', price: 2000, icon: '💐', description: 'Elegant wedding decoration' },
        { name: 'Traditional Setup', price: 1500, icon: '🏺', description: 'Traditional ceremony setup' },
        { name: 'Catering Staff', price: 3000, icon: '👥', description: 'Additional serving staff' },
        { name: 'Premium Ingredients', price: 2500, icon: '⭐', description: 'Premium quality ingredients' }
      ],
      daily: [
        { name: 'Grocery Shopping', price: 200, icon: '🛒', description: 'Weekly grocery shopping' },
        { name: 'Meal Planning', price: 300, icon: '📋', description: 'Weekly meal planning service' },
        { name: 'Utensils Care', price: 150, icon: '🍴', description: 'Kitchen utensils maintenance' }
      ]
    };

    return [...baseAddOns, ...(serviceSpecificAddOns[serviceType] || [])];
  };

  // Geocode address to lat/lon using OpenRouteService
  const geocodeAddress = async (address) => {
    try {
      setLocationLoading(true);
      const res = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates;
        return { lat: coords[1], lon: coords[0] };
      }
      return null;
    } catch (e) {
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  // Calculate distance (meters) between two [lon, lat] points using OpenRouteService
  const getDistance = async (from, to) => {
    try {
      const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
        method: 'POST',
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coordinates: [from, to] })
      });
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        return data.routes[0].summary.distance;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const fetchAndSortChefs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const res = await fetch(buildApiEndpoint('/chefs'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch chefs: ${res.status}`);
        }
        
        const response = await res.json();
        console.log('📋 BookChef - Full API response:', response);
        
        const chefsData = response.chefs || response.data || [];
        console.log('📊 BookChef - Extracted chefs data:', chefsData);
        
        let chefList = Array.isArray(chefsData) ? chefsData : [];
        console.log('🔢 BookChef - Chef list length:', chefList.length);

        // If user location is set and geocoded, sort chefs by closest serviceable location
        if (userLocation.lat && userLocation.lon) {
          // For each chef, find the closest serviceable location
          const chefDistances = await Promise.all(chefList.map(async (chef) => {
            // If chef has serviceableLocations (array of address strings)
            if (Array.isArray(chef.serviceableLocations) && chef.serviceableLocations.length > 0) {
              // Geocode all chef locations (cache for performance in real app)
              const chefLocCoords = await Promise.all(chef.serviceableLocations.map(addr => geocodeAddress(addr)));
              // For each, get distance to user
              const distances = await Promise.all(chefLocCoords.map(async (coord) => {
                if (!coord) return Number.POSITIVE_INFINITY;
                return await getDistance([coord.lon, coord.lat], [userLocation.lon, userLocation.lat]);
              }));
              // Find minimum distance
              const minDist = Math.min(...distances);
              return { ...chef, distance: minDist };
            } else {
              // No serviceable locations, put at end
              return { ...chef, distance: Number.POSITIVE_INFINITY };
            }
          }));
          // Sort by distance
          chefList = chefDistances.sort((a, b) => a.distance - b.distance);
        }
        
        setChefs(chefList);
        if (id && Array.isArray(chefList)) {
          const chefById = chefList.find(c => c._id === id);
          setSelectedChef(chefById);
        }
      } catch (err) {
        console.error('Error fetching chefs:', err);
        setChefs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAndSortChefs();
  }, [id, userLocation.lat, userLocation.lon]);

  const toggleAddOn = (addOnName) => {
    setBookingDetails(prev => ({
      ...prev,
      addOns: prev.addOns.includes(addOnName)
        ? prev.addOns.filter(a => a !== addOnName)
        : [...prev.addOns, addOnName]
    }));
  };

  const calculateTotal = () => {
    if (!selectedChef || !bookingDetails.serviceType) return 0;
    
    const selectedService = serviceTypes.find(service => service.id === bookingDetails.serviceType);
    if (!selectedService) return 0;

    // Base price calculation
    let basePrice = selectedChef.pricePerHour || selectedChef.rate || 1200;
    
    // Apply service type multiplier
    basePrice *= selectedService.baseMultiplier;
    
    // Calculate for duration
    const duration = parseInt(bookingDetails.duration) || selectedService.minDuration;
    let totalBasePrice = basePrice * duration;

    // Guest count adjustments
    const guestCount = parseInt(bookingDetails.guestCount) || 1;
    let guestMultiplier = 1;
    
    if (bookingDetails.serviceType === 'marriage') {
      // Marriage events scale significantly with guest count
      if (guestCount > 100) guestMultiplier = 2.0;
      else if (guestCount > 50) guestMultiplier = 1.5;
      else if (guestCount > 25) guestMultiplier = 1.2;
    } else if (bookingDetails.serviceType === 'birthday') {
      // Birthday parties moderate scaling
      if (guestCount > 20) guestMultiplier = 1.3;
      else if (guestCount > 10) guestMultiplier = 1.15;
    } else if (bookingDetails.serviceType === 'daily') {
      // Daily cook - minimal scaling
      if (guestCount > 6) guestMultiplier = 1.1;
    }

    totalBasePrice *= guestMultiplier;

    // Weekend premium (only for special events)
    if (bookingDetails.date && (bookingDetails.serviceType === 'birthday' || bookingDetails.serviceType === 'marriage')) {
      const selectedDate = new Date(bookingDetails.date);
      const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
      if (isWeekend) {
        totalBasePrice *= 1.2; // 20% weekend premium
      }
    }

    // Add-ons calculation
    const currentAddOns = getAddOnsForService(bookingDetails.serviceType);
    const addOnTotal = bookingDetails.addOns.reduce((total, addOnName) => {
      const addOn = currentAddOns.find(opt => opt.name === addOnName);
      return total + (addOn ? addOn.price : 0);
    }, 0);

    // Service fee calculation
    let serviceFee = 0;
    if (bookingDetails.serviceType === 'marriage') {
      serviceFee = Math.max(500, totalBasePrice * 0.1); // 10% or ₹500 minimum
    } else if (bookingDetails.serviceType === 'birthday') {
      serviceFee = Math.max(200, totalBasePrice * 0.08); // 8% or ₹200 minimum
    } else {
      serviceFee = Math.max(100, totalBasePrice * 0.05); // 5% or ₹100 minimum
    }

    // GST calculation (18%)
    const subtotal = totalBasePrice + addOnTotal + serviceFee;
    const gst = subtotal * 0.18;

    return Math.round(subtotal + gst);
  };

  // Helper function to get pricing breakdown
  const getPricingBreakdown = () => {
    if (!selectedChef || !bookingDetails.serviceType) return null;
    
    const selectedService = serviceTypes.find(service => service.id === bookingDetails.serviceType);
    if (!selectedService) return null;

    let basePrice = selectedChef.pricePerHour || selectedChef.rate || 1200;
    basePrice *= selectedService.baseMultiplier;
    
    const duration = parseInt(bookingDetails.duration) || selectedService.minDuration;
    const guestCount = parseInt(bookingDetails.guestCount) || 1;
    
    let guestMultiplier = 1;
    if (bookingDetails.serviceType === 'marriage') {
      if (guestCount > 100) guestMultiplier = 2.0;
      else if (guestCount > 50) guestMultiplier = 1.5;
      else if (guestCount > 25) guestMultiplier = 1.2;
    } else if (bookingDetails.serviceType === 'birthday') {
      if (guestCount > 20) guestMultiplier = 1.3;
      else if (guestCount > 10) guestMultiplier = 1.15;
    } else if (bookingDetails.serviceType === 'daily') {
      if (guestCount > 6) guestMultiplier = 1.1;
    }

    const baseTotal = basePrice * duration * guestMultiplier;
    
    const currentAddOns = getAddOnsForService(bookingDetails.serviceType);
    const addOnTotal = bookingDetails.addOns.reduce((total, addOnName) => {
      const addOn = currentAddOns.find(opt => opt.name === addOnName);
      return total + (addOn ? addOn.price : 0);
    }, 0);

    let serviceFee = 0;
    if (bookingDetails.serviceType === 'marriage') {
      serviceFee = Math.max(500, baseTotal * 0.1);
    } else if (bookingDetails.serviceType === 'birthday') {
      serviceFee = Math.max(200, baseTotal * 0.08);
    } else {
      serviceFee = Math.max(100, baseTotal * 0.05);
    }

    const subtotal = baseTotal + addOnTotal + serviceFee;
    const gst = subtotal * 0.18;

    return {
      baseRate: basePrice,
      duration,
      guestMultiplier,
      baseTotal,
      addOnTotal,
      serviceFee,
      subtotal,
      gst,
      total: Math.round(subtotal + gst)
    };
  };

  const handleBooking = async () => {
    console.log('Current booking details:', bookingDetails); // Debug log
    
    if (!selectedChef) return alert("No chef selected");
    
    if (!bookingDetails.serviceType) {
      alert("Please select a service type");
      return;
    }
    
    // More detailed validation with specific error messages
    if (!bookingDetails.date) {
      alert("Please select a date");
      return;
    }
    
    if (!bookingDetails.time) {
      alert("Please select a time");
      return;
    }
    
    if (!bookingDetails.guestCount || bookingDetails.guestCount <= 0) {
      alert("Please enter the number of guests");
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(bookingDetails.date + 'T' + bookingDetails.time);
    const now = new Date();
    if (selectedDate <= now) {
      alert("Please select a future date and time");
      return;
    }

    // Validate user location
    if (!userLocation.city || !userLocation.state || !userLocation.lat || !userLocation.lon) {
      alert("Please enter city, state and set your service location before booking.");
      return;
    }

    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert("Please log in to make a booking");
        navigate('/login');
        return;
      }

      // Step 1: Create booking first
      const bookingPayload = {
        chefId: selectedChef._id,
        date: bookingDetails.date,
        time: bookingDetails.time,
        duration: parseInt(bookingDetails.duration),
        guestCount: parseInt(bookingDetails.guestCount),
        location: userLocation.address, // Use user input address
        locationCoords: { lat: userLocation.lat, lon: userLocation.lon }, // Optionally send coords
        serviceType: bookingDetails.serviceType,
        specialRequests: bookingDetails.notes,
        addOns: bookingDetails.addOns,
        totalPrice: calculateTotal(),
        contactInfo: {
          name: "Customer Name", // You might want to get this from user auth or input
          email: "customer@email.com",
          phone: "1234567890"
        }
      };

      console.log('Creating booking with payload:', bookingPayload);

      // Create booking
      const bookingRes = await fetch(buildApiEndpoint('bookings'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });

      if (!bookingRes.ok) {
        const error = await bookingRes.json();
        console.error('Booking creation error:', error);
        alert(error.message || "Failed to create booking!");
        return;
      }

      const bookingResult = await bookingRes.json();
      console.log('Booking created:', bookingResult);

      // Step 2: Create payment order
      const paymentPayload = {
        amount: calculateTotal(),
        bookingId: bookingResult.booking._id,
        currency: 'INR'
      };

      console.log('Creating payment order with payload:', paymentPayload);

      const paymentRes = await fetch(buildApiEndpoint('payments/create-order'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentPayload)
      });

      if (!paymentRes.ok) {
        const error = await paymentRes.json();
        console.error('Payment order creation error:', error);
        alert(error.message || "Failed to create payment order!");
        return;
      }

      const paymentResult = await paymentRes.json();
      console.log('Payment order created:', paymentResult);

      // Step 3: Initialize Razorpay
      initializeRazorpay(paymentResult.data, bookingResult.booking);

    } catch (err) {
      console.error('Network error:', err);
      alert("Error booking chef. Please try again.");
    }
  };

  // Initialize Razorpay payment
  const initializeRazorpay = (paymentData, bookingData) => {
    console.log('Initializing Razorpay with:', paymentData);
    
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: "AaharSetu",
      description: `Booking ${selectedChef.name || selectedChef.fullName} for ${bookingDetails.serviceType}`,
      // Remove image for now to avoid path issues
      // image: "/logo.png", 
      order_id: paymentData.orderId,
      handler: function (response) {
        console.log('Payment successful:', response);
        verifyPayment(response, bookingData._id);
      },
      prefill: {
        name: bookingData.contactInfo?.name || "Customer",
        email: bookingData.contactInfo?.email || "customer@email.com",
        contact: "9999999999" // Fixed format - exactly 10 digits
      },
      notes: {
        bookingId: bookingData._id,
        serviceType: bookingDetails.serviceType,
        chefName: selectedChef.name || selectedChef.fullName
      },
      theme: {
  color: "#f59e42" // Orange theme
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal closed');
          // Handle payment cancellation
          handlePaymentFailure(bookingData._id, { description: "Payment cancelled by user" });
        }
      }
    };

    console.log('Razorpay options:', options);

    // Check if Razorpay is loaded
    if (typeof window.Razorpay === 'undefined') {
      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded, creating instance...');
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        alert('Failed to load payment gateway. Please try again.');
      };
      document.body.appendChild(script);
    } else {
      console.log('Razorpay already loaded, creating instance...');
      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  };

  // Verify payment after successful payment
  const verifyPayment = async (response, bookingId) => {
    try {
      const verificationPayload = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        bookingId: bookingId
      };

      const verifyRes = await fetch(buildApiEndpoint('payments/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationPayload)
      });

      const verifyResult = await verifyRes.json();

      if (verifyResult.success) {
        alert("Payment successful! Your booking is confirmed.");
        console.log('Payment verified:', verifyResult);
        navigate('/dashboard');
      } else {
        alert("Payment verification failed. Please contact support.");
        console.error('Payment verification failed:', verifyResult);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert("Error verifying payment. Please contact support.");
    }
  };

  // Handle payment failure
  const handlePaymentFailure = async (bookingId, error) => {
    try {
      const failurePayload = {
        bookingId: bookingId,
        error: error
      };

      await fetch(buildApiEndpoint('payments/failure'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(failurePayload)
      });

      console.log('Payment failure recorded');
    } catch (err) {
      console.error('Error recording payment failure:', err);
    }
  };

  if (loading) {
    return (
  <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mb-4"></div>
          <p className={`text-xl ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>Loading chefs...</p>
        </div>
      </div>
    );
  }

  if (!selectedChef) {
    return (
  <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'}`}>
        {/* Header */}
  <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-6xl mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm mb-8">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6V5a2 2 0 114 0v1H8zm2 3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Choose Your Chef</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-95">
              Select from our curated collection of professional chefs, each bringing unique skills and specialties to your table
            </p>
          </div>
        </div>

        {/* User Location Input */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'} rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border`}>
            <label className={`block text-sm font-semibold ${isDark ? 'text-orange-300' : 'text-orange-900'} mb-4`}>
              📍 Your Service Location Details
            </label>
            
            {/* City and State Row */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div>
                <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-1`}>City *</label>
                <input
                  type="text"
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  value={userLocation.city}
                  onChange={e => {
                    setUserLocation({ ...userLocation, city: e.target.value });
                    setLocationError('');
                  }}
                  className={`w-full p-3 sm:p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm sm:text-base ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' : 'border-orange-300 bg-orange-50 text-orange-900 placeholder-gray-500'}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-1`}>State *</label>
                <input
                  type="text"
                  placeholder="e.g., Maharashtra, Delhi, Karnataka"
                  value={userLocation.state}
                  onChange={e => {
                    setUserLocation({ ...userLocation, state: e.target.value });
                    setLocationError('');
                  }}
                  className={`w-full p-3 sm:p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm sm:text-base ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' : 'border-orange-300 bg-orange-50 text-orange-900 placeholder-gray-500'}`}
                />
              </div>
            </div>

            {/* Auto-Generated Address Display */}
            <div className="mb-4">
              <label className={`block text-xs font-medium ${isDark ? 'text-orange-300' : 'text-orange-700'} mb-1`}>Complete Address (Auto-generated)</label>
              <div className={`w-full p-3 border rounded-xl ${isDark ? 'border-gray-600 bg-gray-700 text-orange-300' : 'border-orange-200 bg-orange-50 text-orange-700'}`}>
                {userLocation.address || 'Address will be auto-generated from city and state'}
              </div>
              <p className={`text-xs ${isDark ? 'text-amber-400' : 'text-amber-600'} mt-1`}>
                ✨ Address is automatically created from your city and state for consistency
              </p>
            </div>

            {/* Set Location Button */}
            <div className="flex gap-3 items-center">
              <button
                className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold shadow hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!userLocation.city || !userLocation.state || locationLoading}
                onClick={async () => {
                  if (!userLocation.city || !userLocation.state) {
                    setLocationError('Please enter both city and state first');
                    return;
                  }
                  setLocationError('');
                  const coords = await geocodeAddress(userLocation.address);
                  if (coords) {
                    setUserLocation({ ...userLocation, lat: coords.lat, lon: coords.lon });
                  } else {
                    setLocationError('Could not find this address. Please try a different one.');
                  }
                }}
              >
                {locationLoading ? 'Setting...' : 'Set Location'}
              </button>
              {userLocation.lat && userLocation.lon && (
                <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Location verified!
                </span>
              )}
            </div>
            {locationError && <p className={`text-xs mt-2 ${isDark ? 'text-red-400' : 'text-red-500'}`}>{locationError}</p>}
            <p className={`text-xs mt-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
              💡 Enter city and state - we'll automatically create the complete address for precise chef location mapping
            </p>
          </div>
        </div>

        {/* Chefs Grid */}
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 ${isDark ? 'bg-gray-800' : 'bg-orange-50'}`}>
          {!Array.isArray(chefs) || chefs.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <svg className={`w-16 h-16 sm:w-20 sm:h-20 ${isDark ? 'text-gray-600' : 'text-orange-200'} mx-auto mb-4 sm:mb-6`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6V5a2 2 0 114 0v1H8zm2 3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd"></path>
              </svg>
              <h3 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-orange-300' : 'text-orange-700'} mb-3 sm:mb-4`}>No Chefs Available</h3>
              <p className={`${isDark ? 'text-orange-400' : 'text-orange-500'} mb-4 sm:mb-6 text-sm sm:text-base`}>We're working to add more amazing chefs to our platform. Please check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {chefs.map((chef) => (
                <div key={chef._id} className={`group rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'}`}>
                  <div className="relative">
                    <img
                      src={chef.profileImage?.url || chef.photo || 'https://images.unsplash.com/photo-1659354219145-dedd2324698e?w=600&auto=format&fit=crop&q=60'}
                      alt={chef.name || chef.fullName}
                      className="w-full h-48 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1">
                      <span className="text-orange-600 font-bold text-sm sm:text-lg">₹{chef.pricePerHour || chef.rate || 1200}/hr</span>
                    </div>
                    <div className="absolute top-2 left-4 sm:top-2 sm:left-15">
                      <FavoriteButton chef={chef} variant="card" />
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <h3 className={`text-lg sm:text-2xl font-bold mb-2 group-hover:text-orange-600 transition-colors duration-300 ${isDark ? 'text-orange-300' : 'text-orange-900'}`}>
                      {chef.name || chef.fullName}
                    </h3>
                    <p className="text-orange-600 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">{chef.specialty}</p>
                    <p className={`text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                      {chef.bio || 'Experienced professional chef with expertise in creating exceptional culinary experiences.'}
                    </p>
                    {/* Show address and distance if available */}
                   {/* // Inside the chef card, after the address: */}
                  <p className={`text-xs mb-1 ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>
                    <span role="img" aria-label="address">📍</span> {chef.address || (Array.isArray(chef.serviceableLocations) && chef.serviceableLocations[0]) || 'No address set'}
                  </p>
                  <p className={`text-xs mb-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    Distance: {typeof chef.distance === 'number' && isFinite(chef.distance) ? (chef.distance / 1000).toFixed(1) + ' km' : 'N/A'}
                  </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                        <span className={`text-sm ml-2 ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>(4.8)</span>
                      </div>
                      <button
                        onClick={() => setSelectedChef(chef)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold text-sm sm:text-base min-h-[40px]"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Booking form for selected chef
  return (
  <div className={`min-h-screen ml-20 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'}`}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => setSelectedChef(null)}
          className={`mb-6 flex items-center font-semibold transition-colors duration-200 ${isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'}`}
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
          </svg>
          Back to Chef Selection
        </button>

  <div className={`rounded-3xl shadow-xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'}`}>
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Chef Information */}
            <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 text-white p-8 relative overflow-hidden">
              <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-5 left-10 w-16 h-16 bg-white/15 rounded-full animate-bounce"></div>
              
              <div className="relative z-10">
                <img
                  src={selectedChef.profileImage?.url || selectedChef.photo || 'https://images.unsplash.com/photo-1659354219145-dedd2324698e?w=600&auto=format&fit=crop&q=60'}
                  alt={selectedChef.name || selectedChef.fullName}
                  className="w-48 h-48 rounded-3xl object-cover mx-auto mb-6 border-4 border-white/30 shadow-xl"
                />
                <div className="text-center">
                  <h2 className="text-3xl font-extrabold mb-2">{selectedChef.name || selectedChef.fullName}</h2>
                  <p className="text-xl opacity-95 mb-4">{selectedChef.specialty}</p>
                  <p className="leading-relaxed opacity-90 mb-6">{selectedChef.bio}</p>
                  <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-orange-600">₹{selectedChef.pricePerHour || selectedChef.rate || 1200}/hour</p>
                    <p className={`text-sm opacity-80 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>Base rate (excluding add-ons)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className={`p-8 ${isDark ? 'bg-gray-800' : ''}`}>
              <h3 className={`text-3xl font-bold mb-8 ${isDark ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent'}`}> 
                Book Your Experience
              </h3>

              <div className="space-y-6">
                {/* Service Type Selection */}
                <div>
                  <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Select Service Type *</label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {serviceTypes.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setBookingDetails({ ...bookingDetails, serviceType: service.id, duration: service.minDuration })}
                        className={`cursor-pointer border-2 rounded-xl p-4 transition-all duration-300 ${
                          bookingDetails.serviceType === service.id
                            ? `border-orange-500 ${isDark ? 'bg-orange-900/30' : 'bg-orange-50'}`
                            : `${isDark ? 'border-gray-600 hover:border-orange-400 hover:bg-orange-900/20' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'}`
                        }`}
                      >
                        <div className="text-center">
                          <span className="text-4xl mb-3 block">{service.icon}</span>
                          <h4 className={`font-bold mb-2 ${isDark ? 'text-orange-300' : 'text-orange-900'}`}>{service.name}</h4>
                          <p className={`text-sm mb-3 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>{service.description}</p>
                          <div className={`text-xs font-semibold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                            {service.baseMultiplier}x base rate
                          </div>
                          <div className={`text-xs mt-1 ${isDark ? 'text-orange-500' : 'text-orange-500'}`}>
                            {service.minDuration}-{service.maxDuration} hours
                          </div>
                          {bookingDetails.serviceType === service.id && (
                            <svg className="w-6 h-6 text-amber-500 mx-auto mt-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duration Selection (if service type is selected) */}
                {bookingDetails.serviceType && (
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Duration (hours) *
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min={serviceTypes.find(s => s.id === bookingDetails.serviceType)?.minDuration || 2}
                        max={serviceTypes.find(s => s.id === bookingDetails.serviceType)?.maxDuration || 8}
                        value={bookingDetails.duration}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, duration: parseInt(e.target.value) })}
                        className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer slider ${isDark ? 'bg-gray-600' : 'bg-orange-200'}`}
                      />
                      <div className={`text-lg font-semibold min-w-[60px] ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                        {bookingDetails.duration}h
                      </div>
                    </div>
                    <div className={`flex justify-between text-sm mt-1 ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>
                      <span>{serviceTypes.find(s => s.id === bookingDetails.serviceType)?.minDuration}h min</span>
                      <span>{serviceTypes.find(s => s.id === bookingDetails.serviceType)?.maxDuration}h max</span>
                    </div>
                  </div>
                )}

                {/* Date and Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Select Date *</label>
                    <input
                      type="date"
                      value={bookingDetails.date}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                      className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-orange-300 bg-orange-50 text-orange-900'}`}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    {!bookingDetails.date && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>Please select a date</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Select Time *</label>
                    <input
                      type="time"
                      value={bookingDetails.time}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, time: e.target.value })}
                      className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-orange-300 bg-orange-50 text-orange-900'}`}
                      required
                    />
                    {!bookingDetails.time && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>Please select a time</p>
                    )}
                  </div>
                </div>

                {/* Guest Count */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Number of Guests *</label>
                  <input
                    type="number"
                    placeholder="How many people will be dining?"
                    value={bookingDetails.guestCount}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, guestCount: e.target.value })}
                      className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' : 'border-orange-300 bg-orange-50 text-orange-900 placeholder-gray-500'}`}
                    min="1"
                    max="200"
                    required
                  />
                  {!bookingDetails.guestCount && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>Please enter the number of guests</p>
                  )}
                </div>

                {/* Add-ons */}
                <div>
                  <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Premium Add-ons</label>
                  {bookingDetails.serviceType ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {getAddOnsForService(bookingDetails.serviceType).map((addOn) => (
                        <div
                          key={addOn.name}
                          onClick={() => toggleAddOn(addOn.name)}
                          className={`cursor-pointer border-2 rounded-xl p-4 transition-all duration-300 ${
                            bookingDetails.addOns.includes(addOn.name)
                              ? `border-amber-500 ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'}`
                              : `${isDark ? 'border-gray-600 hover:border-amber-400 hover:bg-amber-900/20' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-25'}`
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{addOn.icon}</span>
                              <div>
                                <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{addOn.name}</h4>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{addOn.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>+₹{addOn.price}</p>
                              {bookingDetails.addOns.includes(addOn.name) && (
                                <svg className="w-5 h-5 text-green-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p>Please select a service type first to see available add-ons</p>
                    </div>
                  )}
                </div>

                {/* Special Requests */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Special Requests</label>
                  <textarea
                    value={bookingDetails.notes}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                    placeholder="Any dietary restrictions, allergies, or special requests..."
                      className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' : 'border-orange-300 bg-orange-50 text-orange-900 placeholder-gray-500'}`}
                    rows="4"
                  />
                </div>

                {/* Total and Book Button */}
                <div className={`rounded-2xl p-6 border ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-r from-orange-50 to-amber-100 border-orange-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-lg font-semibold ${isDark ? 'text-orange-300' : 'text-orange-900'}`}>Total Amount:</span>
                    <span className={`text-3xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>₹{calculateTotal()}</span>
                  </div>
                  <button
                    onClick={handleBooking}
                    className="w-full p-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                    </svg>
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookChef;