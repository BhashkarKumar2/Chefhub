import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FavoriteButton from '../../components/FavoriteButton';
import { buildApiEndpoint } from '../../utils/apiConfig';
import { useThemeAwareStyle } from '../../utils/themeUtils';
import { FaBirthdayCake, FaRing, FaUtensils, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaPlus, FaInfoCircle, FaArrowLeft, FaCheckCircle, FaShoppingCart, FaBroom, FaCamera, FaStar, FaGift, FaConciergeBell, FaLeaf } from 'react-icons/fa';
import { GiPartyPopper } from "react-icons/gi";
import { LuCakeSlice } from "react-icons/lu";
import { MdOutlineCleanHands } from "react-icons/md";
import { RiCake3Line } from "react-icons/ri";

const BookChef = () => {
  const { theme, classes, isDark, getClass } = useThemeAwareStyle();
  const { id } = useParams();
  const navigate = useNavigate();
  const [chefs, setChefs] = useState([]);
  const [selectedChef, setSelectedChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
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

  // Fetch Razorpay configuration from backend
  useEffect(() => {
    const fetchRazorpayConfig = async () => {
      try {
        const res = await fetch(`${buildApiEndpoint('')}proxy/razorpay-config`);
        const data = await res.json();
        if (data.success && data.keyId) {
          setRazorpayKeyId(data.keyId);
        }
      } catch (error) {
        console.error('Failed to fetch Razorpay config:', error);
      }
    };
    fetchRazorpayConfig();
  }, []);

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
      icon: <FaBirthdayCake className="mx-auto mb-3 text-4xl text-pink-500" />,
      description: 'Celebrate special birthdays with custom menus and party atmosphere',
      baseMultiplier: 1.5, // 50% more than base rate
      minDuration: 3,
      maxDuration: 8,
      features: ['Custom birthday menu', 'Party presentation', 'Birthday cake coordination']
    },
    {
      id: 'marriage',
      name: 'Marriage Ceremony',
      icon: <FaRing className="mx-auto mb-3 text-4xl text-indigo-500" />,
      description: 'Grand wedding celebrations with multi-course traditional meals',
      baseMultiplier: 2.5, // 150% more than base rate
      minDuration: 6,
      maxDuration: 12,
      features: ['Multi-course menu', 'Traditional cuisine', 'Large quantity cooking', 'Premium service']
    },
    {
      id: 'daily',
      name: 'Daily Cook',
      icon: <FaUtensils className="mx-auto mb-3 text-4xl text-teal-500" />,
      description: 'Regular home cooking for daily meals and weekly meal prep',
      baseMultiplier: 0.8, // 20% less than base rate for regular service
      minDuration: 1,
      maxDuration: 3,
      features: ['Home-style cooking', 'Meal planning', 'Grocery assistance', 'Flexible timing']
    }
  ];

  // Dynamic add-ons based on service type
  const getAddOnsForService = (serviceType) => {
    const baseAddOns = [
      { name: 'Cleanup', price: 150, icon: <MdOutlineCleanHands className="text-2xl text-blue-500" />, description: 'Complete post-meal cleanup service' }
    ];

    const serviceSpecificAddOns = {
      birthday: [
        { name: 'Party Decor', price: 500, icon: <GiPartyPopper className="text-2xl text-purple-500" />, description: 'Birthday party table decoration' },
        { name: 'Birthday Cake', price: 800, icon: <RiCake3Line className="text-2xl text-pink-500" />, description: 'Custom birthday cake' },
        { name: 'Photography', price: 1200, icon: <FaCamera className="text-2xl text-gray-500" />, description: 'Party photography service' }
      ],
      marriage: [
        { name: 'Wedding Decor', price: 2000, icon: <FaGift className="text-2xl text-red-500" />, description: 'Elegant wedding decoration' },
        { name: 'Traditional Setup', price: 1500, icon: <FaConciergeBell className="text-2xl text-yellow-500" />, description: 'Traditional ceremony setup' },
        { name: 'Catering Staff', price: 3000, icon: <FaUsers className="text-2xl text-green-500" />, description: 'Additional serving staff' },
        { name: 'Premium Ingredients', price: 2500, icon: <FaStar className="text-2xl text-amber-500" />, description: 'Premium quality ingredients' }
      ],
      daily: [
        { name: 'Grocery Shopping', price: 200, icon: <FaShoppingCart className="text-2xl text-orange-500" />, description: 'Weekly grocery shopping' },
        { name: 'Meal Planning', price: 300, icon: <FaLeaf className="text-2xl text-green-500" />, description: 'Weekly meal planning service' },
        { name: 'Utensils Care', price: 150, icon: <FaBroom className="text-2xl text-brown-500" />, description: 'Kitchen utensils maintenance' }
      ]
    };

    return [...baseAddOns, ...(serviceSpecificAddOns[serviceType] || [])];
  };

  // Geocode address to lat/lon using backend proxy
  const geocodeAddress = async (address) => {
    try {
      setLocationLoading(true);
      const res = await fetch(`${buildApiEndpoint('')}proxy/geocode?address=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data.success && data.data) {
        return { lat: data.data.latitude, lon: data.data.longitude };
      }
      return null;
    } catch (e) {
      console.error('Geocoding error:', e);
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  // Calculate distance (meters) between two [lon, lat] points using backend proxy
  const getDistance = async (from, to) => {
    try {
      const res = await fetch(`${buildApiEndpoint('')}proxy/directions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coordinates: [from, to] })
      });
      const data = await res.json();
      if (data.success && data.data.routes && data.data.routes[0]) {
        return data.data.routes[0].summary.distance;
      }
      return null;
    } catch (e) {
      console.error('Distance calculation error:', e);
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
        // console.log('ðŸ“‹ BookChef - Full API response:', response);
        
        const chefsData = response.chefs || response.data || [];
        // console.log('ðŸ“Š BookChef - Extracted chefs data:', chefsData);
        
        let chefList = Array.isArray(chefsData) ? chefsData : [];
        // console.log('ðŸ”¢ BookChef - Chef list length:', chefList.length);

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
        // console.error('Error fetching chefs:', err);
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

    

    // GST calculation (18%)
    const subtotal = totalBasePrice + addOnTotal;
    

    return Math.round(subtotal);
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

    

    const subtotal = baseTotal + addOnTotal;
    

    return {
      baseRate: basePrice,
      duration,
      guestMultiplier,
      baseTotal,
      addOnTotal,
      subtotal,
      total: Math.round(subtotal)
    };
  };

  const handleBooking = async () => {
    // console.log('Current booking details:', bookingDetails); // Debug log
    
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

      // console.log('Creating booking with payload:', bookingPayload);

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
        // console.error('Booking creation error:', error);
        alert(error.message || "Failed to create booking!");
        return;
      }

      const bookingResult = await bookingRes.json();
      // console.log('Booking created:', bookingResult);

      // Step 2: Create payment order
      const paymentPayload = {
        amount: calculateTotal(),
        bookingId: bookingResult.booking._id,
        currency: 'INR'
      };

      // console.log('Creating payment order with payload:', paymentPayload);

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
        // console.error('Payment order creation error:', error);
        alert(error.message || "Failed to create payment order!");
        return;
      }

      const paymentResult = await paymentRes.json();
      // console.log('Payment order created:', paymentResult);

      // Step 3: Initialize Razorpay
      initializeRazorpay(paymentResult.data, bookingResult.booking);

    } catch (err) {
      // console.error('Network error:', err);
      alert("Error booking chef. Please try again.");
    }
  };

  // Initialize Razorpay payment
  const initializeRazorpay = (paymentData, bookingData) => {
    // console.log('Initializing Razorpay with:', paymentData);
    
    if (!razorpayKeyId) {
      alert('Payment configuration not loaded. Please refresh the page.');
      return;
    }
    
    const options = {
      key: razorpayKeyId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: "AaharSetu",
      description: `Booking ${selectedChef.name || selectedChef.fullName} for ${bookingDetails.serviceType}`,
      // Remove image for now to avoid path issues
      // image: "/logo.png", 
      order_id: paymentData.orderId,
      handler: function (response) {
        // console.log('Payment successful:', response);
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
          // console.log('Payment modal closed');
          // Handle payment cancellation
          handlePaymentFailure(bookingData._id, { description: "Payment cancelled by user" });
        }
      }
    };

    // console.log('Razorpay options:', options);

    // Check if Razorpay is loaded
    if (typeof window.Razorpay === 'undefined') {
      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        // console.log('Razorpay script loaded, creating instance...');
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        // console.error('Failed to load Razorpay script');
        alert('Failed to load payment gateway. Please try again.');
      };
      document.body.appendChild(script);
    } else {
      // console.log('Razorpay already loaded, creating instance...');
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
        // console.log('Payment verified:', verifyResult);
        navigate('/dashboard');
      } else {
        alert("Payment verification failed. Please contact support.");
        // console.error('Payment verification failed:', verifyResult);
      }
    } catch (error) {
      // console.error('Payment verification error:', error);
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

      // console.log('Payment failure recorded');
    } catch (err) {
      // console.error('Error recording payment failure:', err);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
          <p className={`text-xl font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Finding Top Chefs...</p>
        </div>
      </div>
    );
  }

  if (!selectedChef) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl md:text-5xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight`}>
              Find Your Perfect Chef
            </h1>
            <p className={`mt-4 max-w-2xl mx-auto text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Book talented chefs for any occasion. Start by telling us your location.
            </p>
          </div>

          {/* User Location Input */}
          <div className="max-w-2xl mx-auto">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <label className={`flex items-center text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
                <FaMapMarkerAlt className="mr-3 text-orange-500" />
                Your Service Location
              </label>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>City *</label>
                  <input
                    type="text"
                    placeholder="e.g., Mumbai"
                    value={userLocation.city}
                    onChange={e => setUserLocation({ ...userLocation, city: e.target.value, address: `${e.target.value}, ${userLocation.state}` })}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>State *</label>
                  <input
                    type="text"
                    placeholder="e.g., Maharashtra"
                    value={userLocation.state}
                    onChange={e => setUserLocation({ ...userLocation, state: e.target.value, address: `${userLocation.city}, ${e.target.value}` })}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500'}`}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <button
                  className="w-full sm:w-auto px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold shadow-md hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={!userLocation.city || !userLocation.state || locationLoading}
                  onClick={async () => {
                    setLocationError('');
                    const coords = await geocodeAddress(userLocation.address);
                    if (coords) {
                      setUserLocation({ ...userLocation, lat: coords.lat, lon: coords.lon });
                    } else {
                      setLocationError('Could not find this address. Please try a different one.');
                    }
                  }}
                >
                  {locationLoading ? 'Verifying...' : 'Set Location & Find Chefs'}
                </button>
                {userLocation.lat && userLocation.lon && (
                  <span className="text-sm flex items-center gap-1 text-green-500">
                    <FaCheckCircle />
                    Location Verified! Chefs sorted by distance.
                  </span>
                )}
              </div>
              {locationError && <p className="text-sm text-red-500 mt-2">{locationError}</p>}
            </div>
          </div>

          {/* Chefs Grid */}
          <div className="mt-16">
            {!Array.isArray(chefs) || chefs.length === 0 ? (
              <div className="text-center py-12">
                <FaUsers className={`w-20 h-20 ${isDark ? 'text-gray-700' : 'text-gray-300'} mx-auto mb-6`} />
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>No Chefs Available</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>We're expanding our network. Please check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {chefs.map((chef) => (
                  <div key={chef._id} className={`group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border overflow-hidden flex flex-col ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="relative">
                      <img
                        src={chef.profileImage?.url || chef.photo || 'https://images.unsplash.com/photo-1659354219145-dedd2324698e?w=600&auto=format&fit=crop&q=60'}
                        alt={chef.name || chef.fullName}
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <FavoriteButton chef={chef} variant="card" />
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t ${isDark ? 'from-gray-800 to-transparent' : 'from-white to-transparent'}`}>
                        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {chef.name || chef.fullName}
                        </h3>
                        {chef.specialty && (
                          <p className="text-orange-500 font-semibold">{chef.specialty}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={getClass('flex items-center gap-1.5 text-sm', 'flex items-center gap-1.5 text-sm')}>
                          <FaStar className="text-amber-500" />
                          <span className={getClass('font-semibold text-gray-700', 'font-semibold text-gray-300')}>4.8</span>
                          <span className={getClass('text-gray-500', 'text-gray-400')}>(120)</span>
                        </div>
                        {chef.experienceYears && (
                          <div className={getClass('flex items-center gap-1.5 text-sm', 'flex items-center gap-1.5 text-sm')}>
                            <FaCalendarAlt className="text-orange-500" />
                            <span className={getClass('font-medium text-gray-700', 'font-medium text-gray-300')}>{chef.experienceYears} yrs exp.</span>
                          </div>
                        )}
                      </div>

                      <p className={`text-sm leading-relaxed mb-4 flex-grow line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {chef.bio || 'An experienced professional chef ready to create exceptional culinary experiences for you.'}
                      </p>

                      <div className="flex items-start gap-2 mb-5 text-sm">
                        <FaMapMarkerAlt className="text-orange-500 flex-shrink-0 mt-1" />
                        <div className="flex-grow">
                          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {chef.address || (Array.isArray(chef.serviceableLocations) && chef.serviceableLocations[0]) || 'Location not set'}
                          </p>
                          {typeof chef.distance === 'number' && isFinite(chef.distance) && (
                            <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                              📍 {(chef.distance / 1000).toFixed(1)} km away from you
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSelectedChef(chef)}
                        className="w-full mt-auto px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold shadow-md hover:bg-orange-700 transition-all duration-300 transform group-hover:scale-105"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Booking form for selected chef
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <button
          onClick={() => setSelectedChef(null)}
          className={`mb-8 flex items-center font-semibold transition-colors duration-200 group ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <FaArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Chef Selection
        </button>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Left Column: Chef Info & Price Summary */}
          <div className="lg:col-span-1 space-y-8">
            {/* Chef Card */}
            <div className={`rounded-2xl shadow-lg overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <img
                src={selectedChef.profileImage?.url || selectedChef.photo || 'https://images.unsplash.com/photo-1659354219145-dedd2324698e?w=600&auto=format&fit=crop&q=60'}
                alt={selectedChef.name || selectedChef.fullName}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedChef.name || selectedChef.fullName}</h2>
                <p className="text-lg text-orange-500 font-semibold mt-1">{selectedChef.specialty}</p>
                <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedChef.bio}</p>
                <div className={`mt-4 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  ₹{selectedChef.pricePerHour || selectedChef.rate || 1200}
                  <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/hour (base rate)</span>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            {bookingDetails.serviceType && (
              <div className={`rounded-2xl shadow-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Price Summary</h3>
                <div className="space-y-2 text-sm">
                  {getPricingBreakdown() && Object.entries(getPricingBreakdown()).map(([key, value]) => {
                    if (['total', 'guestMultiplier'].includes(key) || !value) return null;
                    const labels = {
                      baseRate: 'Base Rate (/hr)',
                      duration: 'Duration (hrs)',
                      baseTotal: 'Subtotal (Base)',
                      addOnTotal: 'Add-ons Total',
                      subtotal: 'Subtotal',
                    };
                    return (
                      <div key={key} className="flex justify-between items-center">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{labels[key]}</span>
                        <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {key.includes('Total') || key.includes('Fee')  || key.includes('Rate') ? `₹${Math.round(value)}` : value}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className={`border-t my-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}></div>
                <div className="flex justify-between items-center">
                  <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Total</span>
                  <span className="text-2xl font-bold text-orange-500">₹{calculateTotal()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Booking Form */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl shadow-lg p-8 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Book Your Experience</h3>
              
              <div className="space-y-8">
                {/* Step 1: Service Type */}
                <div>
                  <label className="block text-lg font-semibold mb-4">1. Choose Service Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {serviceTypes.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setBookingDetails({ ...bookingDetails, serviceType: service.id, duration: service.minDuration })}
                        className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all duration-200 ${
                          bookingDetails.serviceType === service.id
                            ? `border-orange-500 shadow-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`
                            : `${isDark ? 'border-gray-700 hover:border-orange-500' : 'border-gray-200 hover:border-orange-500'}`
                        }`}
                      >
                        {service.icon}
                        <h4 className={`font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{service.name}</h4>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{service.minDuration}-{service.maxDuration}h</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 2: Schedule & Details (collapsible) */}
                {bookingDetails.serviceType && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-lg font-semibold mb-4">2. Schedule & Details</label>
                      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        {/* Conditional Fields for Daily Cook */}
                        {bookingDetails.serviceType === 'daily' ? (
                          <>
                            <div>
                              <label className={`flex items-center text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}><FaCalendarAlt className="mr-2 text-orange-500"/>Start Date *</label>
                              <input
                                type="date"
                                value={bookingDetails.date}
                                onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                                min={new Date().toISOString().split('T')[0]}
                                required
                              />
                            </div>
                            <div>
                              <label className={`flex items-center text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}><FaClock className="mr-2 text-orange-500"/>Booking Duration *</label>
                              <select
                                value={bookingDetails.bookingDuration || ''}
                                onChange={(e) => setBookingDetails({ ...bookingDetails, bookingDuration: e.target.value })}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                                required
                              >
                                <option value="">Select duration</option>
                                <option value="1-week">1 Week</option>
                                <option value="2-weeks">2 Weeks</option>
                                <option value="1-month">1 Month</option>
                                <option value="3-months">3 Months</option>
                              </select>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Date */}
                            <div>
                              <label className={`flex items-center text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}><FaCalendarAlt className="mr-2 text-orange-500"/>Date *</label>
                              <input
                                type="date"
                                value={bookingDetails.date}
                                onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                                min={new Date().toISOString().split('T')[0]}
                                required
                              />
                            </div>
                            {/* Time */}
                            <div>
                              <label className={`flex items-center text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}><FaClock className="mr-2 text-orange-500"/>Time *</label>
                              <input
                                type="time"
                                value={bookingDetails.time}
                                onChange={(e) => setBookingDetails({ ...bookingDetails, time: e.target.value })}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                                required
                              />
                            </div>
                          </>
                        )}
                        {/* Guests */}
                        <div className="md:col-span-2">
                          <label className={`flex items-center text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}><FaUsers className="mr-2 text-orange-500"/>Number of Guests *</label>
                          <input
                            type="number"
                            placeholder="How many people?"
                            value={bookingDetails.guestCount}
                            onChange={(e) => setBookingDetails({ ...bookingDetails, guestCount: e.target.value })}
                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                            min="1"
                            required
                          />
                        </div>
                        {/* Duration */}
                        <div className="md:col-span-2">
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Duration: {bookingDetails.duration} hours</label>
                          <input
                            type="range"
                            min={serviceTypes.find(s => s.id === bookingDetails.serviceType)?.minDuration || 2}
                            max={serviceTypes.find(s => s.id === bookingDetails.serviceType)?.maxDuration || 8}
                            value={bookingDetails.duration}
                            onChange={(e) => setBookingDetails({ ...bookingDetails, duration: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                          />
                        </div>

                        {/* Service-Specific Fields */}
                        <div className="md:col-span-2 space-y-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-md font-semibold text-orange-500">Event Specifics</h4>
                          {bookingDetails.serviceType === 'birthday' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Age Group</label>
                                <select  value={bookingDetails.ageGroup || ''} onChange={(e) => setBookingDetails({ ...bookingDetails, ageGroup: e.target.value })} className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}>
                                  <option value="">Select</option>
                                  <option value="kids">Kids</option>
                                  <option value="teens">Teens</option>
                                  <option value="adults">Adults</option>
                                </select>
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Party Theme</label>
                                <input type="text" placeholder="e.g., Superhero" value={bookingDetails.partyTheme || ''} onChange={(e) => setBookingDetails({ ...bookingDetails, partyTheme: e.target.value })} className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`} />
                              </div>
                            </div>
                          )}
                          {bookingDetails.serviceType === 'marriage' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Wedding Type</label>
                                <select value={bookingDetails.weddingType || ''} onChange={(e) => setBookingDetails({ ...bookingDetails, weddingType: e.target.value })} className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}>
                                  <option value="">Select</option>
                                  <option value="traditional">Traditional</option>
                                  <option value="modern">Modern</option>
                                  <option value="destination">Destination</option>
                                </select>
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Number of Courses</label>
                                <select value={bookingDetails.coursesCount || ''} onChange={(e) => setBookingDetails({ ...bookingDetails, coursesCount: e.target.value })} className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}>
                                  <option value="">Select</option>
                                  <option value="3">3 Courses</option>
                                  <option value="5">5 Courses</option>
                                  <option value="7">7 Courses</option>
                                </select>
                              </div>
                            </div>
                          )}
                          {bookingDetails.serviceType === 'daily' && (
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Meal Type</label>
                                <select value={bookingDetails.mealType || ''} onChange={(e) => setBookingDetails({ ...bookingDetails, mealType: e.target.value })} className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}>
                                  <option value="">Select</option>
                                  <option value="breakfast">Breakfast</option>
                                  <option value="lunch">Lunch</option>
                                  <option value="dinner">Dinner</option>
                                  <option value="all">All Meals</option>
                                </select>
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dietary Preference</label>
                                <select value={bookingDetails.dietaryPreference || ''} onChange={(e) => setBookingDetails({ ...bookingDetails, dietaryPreference: e.target.value })} className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}>
                                  <option value="">Select</option>
                                  <option value="vegetarian">Vegetarian</option>
                                  <option value="non-vegetarian">Non-Vegetarian</option>
                                  <option value="vegan">Vegan</option>
                                </select>
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Frequency</label>
                                <select
                                  value={bookingDetails.frequency || ''}
                                  onChange={(e) => setBookingDetails({ ...bookingDetails, frequency: e.target.value })}
                                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                                >
                                  <option value="">Select frequency</option>
                                  <option value="daily">Daily (7 days/week)</option>
                                  <option value="weekdays">Weekdays Only (5 days/week)</option>
                                  <option value="weekends">Weekends Only</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Add-ons */}
                    <div>
                      <label className="block text-lg font-semibold mb-4">3. Premium Add-ons</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {getAddOnsForService(bookingDetails.serviceType).map((addOn) => (
                          <div
                            key={addOn.name}
                            onClick={() => toggleAddOn(addOn.name)}
                            className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-4 transition-all duration-200 ${
                              bookingDetails.addOns.includes(addOn.name)
                                ? `border-orange-500 shadow-md ${isDark ? 'bg-gray-700' : 'bg-white'}`
                                : `${isDark ? 'border-gray-700 hover:border-orange-500' : 'border-gray-200 hover:border-orange-500'}`
                            }`}
                          >
                            <div className="flex-shrink-0">{addOn.icon}</div>
                            <div className="flex-grow">
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{addOn.name}</h4>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{addOn.description}</p>
                            </div>
                            <p className={`font-bold text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>+₹{addOn.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 4: Special Requests */}
                    <div>
                      <label className="block text-lg font-semibold mb-4">4. Special Requests</label>
                      <textarea
                        value={bookingDetails.notes}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                        placeholder="Any dietary restrictions, allergies, or other notes for the chef..."
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                        rows="4"
                      />
                    </div>

                    {/* Total and Book Button */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Total:</span>
                        <span className="text-3xl font-bold text-orange-500">₹{calculateTotal()}</span>
                      </div>
                      <button
                        onClick={handleBooking}
                        className="w-full p-4 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                      >
                        Proceed to Payment
                      </button>
                      <p className={`text-xs text-center mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>You will be redirected to our secure payment partner.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookChef;