import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiEndpoint } from '../../utils/apiConfig';
import { useThemeAwareStyle } from '../../utils/themeUtils';
import TextInput from '../../components/TextInput';
import CheckboxGroup from '../../components/CheckboxGroup';
import TextareaInput from '../../components/TextareaInput';
import { prepareImageForUpload } from '../../utils/imageOptimizer';

const ChefOnboarding = () => {
  const { getClass, classes, isDark } = useThemeAwareStyle();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialties: [],
    bio: '',
    rate: '',
    experience: '',
    profileImage: null,
    certifications: [],
    availability: 'full-time',
    address: '',
    city: '',
    state: '',
    locationLat: '',
    locationLon: ''
  });

  const cuisineOptions = [
    'Indian', 'Italian', 'Mexican', 'Chinese', 'Thai', 'French', 
    'Mediterranean', 'Japanese', 'Korean', 'Lebanese', 'Continental'
  ];

  const certificationOptions = [
    'Culinary Arts Diploma', 'Food Safety Certification', 'Pastry Arts',
    'Wine Sommelier', 'Nutrition Specialist', 'Organic Cooking'
  ];

  const [locationError, setLocationError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  // Auto-generate complete address when city and state change
  useEffect(() => {
    if (formData.city && formData.state) {
      const autoAddress = `${formData.city}, ${formData.state}`;
      setFormData(prev => ({ ...prev, address: autoAddress }));
    }
  }, [formData.city, formData.state]);

  // Geocode address to lat/lon using backend proxy (avoids CORS)
  const geocodeAddress = async (address) => {
    try {
      setLocationLoading(true);
      // console.log('ðŸŒ Geocoding address:', address);
      
      const res = await fetch(buildApiEndpoint('geocode'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      
      // console.log('ðŸ“¡ Geocode response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        // console.error('âŒ Geocoding error:', errorData);
        setLocationError(`Geocoding failed: ${errorData.error || 'Unknown error'}`);
        return null;
      }
      
      const data = await res.json();
      // console.log('âœ… Geocoding successful:', data);
      
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates;
        // console.log('ðŸ“ Coordinates found:', { lat: coords[1], lon: coords[0] });
        setLocationError(''); // Clear any previous errors
        return { lat: coords[1], lon: coords[0] };
      } else {
        setLocationError('No location found for this address. Please try a more specific address.');
        return null;
      }
    } catch (e) {
      // console.error('âŒ Geocoding fetch error:', e);
      setLocationError('Network error. Please check your connection and try again.');
      return null;
    } finally {
      setLocationLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (option) => {
    setFormData((prev) => {
      const updated = prev.specialties.includes(option)
        ? prev.specialties.filter((c) => c !== option)
        : [...prev.specialties, option];
      return { ...prev, specialties: updated };
    });
  };

  const handleCertificationChange = (option) => {
    setFormData((prev) => {
      const updated = prev.certifications.includes(option)
        ? prev.certifications.filter((c) => c !== option)
        : [...prev.certifications, option];
      return { ...prev, certifications: updated };
    });
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (file) {
      try {
        // Optimize image before setting it
        const optimizedFile = await prepareImageForUpload(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.85
        });
        
        setFormData(prev => ({ ...prev, [name]: optimizedFile }));
      } catch (error) {
        alert(error.message || 'Failed to process image');
      }
    }
  };

  const getValidationErrors = () => {
    const errors = [];
    
    // Validate full name
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    if (!formData.fullName) {
      errors.push('Full name is required');
    } else if (!nameRegex.test(formData.fullName)) {
      errors.push('Full name should only contain letters and spaces (2-50 characters)');
    }

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email) {
      errors.push('Email address is required');
    } else if (!emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    // Validate phone
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!formData.phone) {
      errors.push('Phone number is required');
    } else if (!phoneRegex.test(formData.phone)) {
      errors.push('Phone number must be 10 digits starting with 6, 7, 8, or 9');
    }

    // Validate specialties
    if (formData.specialties.length === 0) {
      errors.push('Please select at least one specialty');
    }
    // Validate address/location
    if (!formData.city) {
      errors.push('City is required');
    }
    if (!formData.state) {
      errors.push('State is required');
    }
    // Address is auto-generated, so just check that city and state create a valid address
    if (!formData.address || formData.address.trim() === '') {
      errors.push('Address could not be generated. Please ensure city and state are filled correctly');
    }
    if (!formData.locationLat || !formData.locationLon) {
      errors.push('You must set your location using the Set Location button');
    }

    // Validate bio
    if (!formData.bio) {
      errors.push('Professional bio is required');
    } else if (formData.bio.length < 50) {
      errors.push('Bio must be at least 50 characters long');
    } else if (formData.bio.length > 1000) {
      errors.push('Bio must not exceed 1000 characters');
    }

    // Validate rate
    if (!formData.rate) {
      errors.push('Hourly rate is required');
    } else if (formData.rate < 500 || formData.rate > 10000) {
      errors.push('Hourly rate must be between Rs. 500 and Rs. 10,000');
    }

    // Validate experience
    if (!formData.experience) {
      errors.push('Years of experience is required');
    } else if (formData.experience < 1 || formData.experience > 50) {
      errors.push('Experience must be between 1 and 50 years');
    }

    return errors;
  };

  // Calculate actual completion based on filled fields (not just absence of errors)
  const getCompletionProgress = () => {
    let completed = 0;
    // 9 required fields: name, email, phone, specialties, bio, rate, experience, address, location
    const totalFields = 9;
    if (formData.fullName && formData.fullName.trim() !== '') completed++;
    if (formData.email && formData.email.trim() !== '') completed++;
    if (formData.phone && formData.phone.trim() !== '') completed++;
    if (formData.specialties.length > 0) completed++;
    if (formData.bio && formData.bio.trim() !== '' && formData.bio.length >= 50) completed++;
    if (formData.rate && formData.rate !== '') completed++;
    if (formData.experience && formData.experience !== '') completed++;
    if (formData.address && formData.address.trim() !== '') completed++;
    if (formData.locationLat && formData.locationLon) completed++;
    return { completed, total: totalFields };
  };

  const validateForm = () => {
    return getValidationErrors().length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // console.log('\nðŸ”¥ === CHEF ONBOARDING FORM SUBMISSION STARTED ===');
    // console.log('ðŸ“ Form Data:', formData);
    
    const validationErrors = getValidationErrors();
    if (validationErrors.length > 0) {
      // console.log('âŒ Form validation failed:', validationErrors);
      alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
      return;
    }
    // console.log('âœ… Form validation passed');
    
    setIsSubmitting(true);

    try {
      // console.log('ðŸ“¦ Creating FormData for submission...');
      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('name', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('specialty', formData.specialties.join(', '));
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('pricePerHour', Number(formData.rate));
      formDataToSend.append('experienceYears', Number(formData.experience));
      formDataToSend.append('certifications', formData.certifications.join(', '));
      formDataToSend.append('availability', formData.availability);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      // Add serviceableLocations as a single-item array with the address
      if (formData.address && formData.address.trim() !== '') {
        formDataToSend.append('serviceableLocations', formData.address);
      }
      if (formData.locationLat && formData.locationLon) {
        formDataToSend.append('locationCoords[lat]', formData.locationLat);
        formDataToSend.append('locationCoords[lon]', formData.locationLon);
      }
      
      // Add profile image if uploaded
      if (formData.profileImage) {
        // console.log('🖼️ Adding profile image to FormData:', formData.profileImage.name);
        formDataToSend.append('profileImage', formData.profileImage);
      } else {
        // console.log('ðŸ“· No profile image selected');
      }

      // Log FormData contents
      // console.log('ðŸ“‹ FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        if (key === 'profileImage') {
          // console.log(`  ${key}:`, value.name, `(${value.size} bytes)`);
        } else {
          // console.log(`  ${key}:`, value);
        }
      }

      // console.log('ðŸŒ Sending request to backend...');
      const response = await fetch(buildApiEndpoint('chefs'), {
        method: 'POST',
        body: formDataToSend, // Don't set Content-Type header when using FormData
      });

      // console.log('ðŸ“¡ Response received:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        // console.error('âŒ Backend returned error:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to create chef profile');
      }

      const savedChef = await response.json();
      // console.log('âœ… Chef profile saved successfully:', savedChef);
      // console.log('ðŸ”¥ === CHEF ONBOARDING COMPLETED SUCCESSFULLY ===\n');
      
      // Success message and redirect
      alert('Chef profile created successfully! Redirecting to dashboard...');
      navigate('/dashboard');
      
    } catch (error) {
      // console.error('\nâŒ === CHEF ONBOARDING FAILED ===');
      // console.error('ðŸš¨ Error message:', error.message);
      // console.error('ðŸ“Š Full error:', error);
      // console.error('ðŸ”¥ === ERROR HANDLING COMPLETED ===\n');
      
      // More user-friendly error messages
      let userMessage = error.message;
      if (error.message.includes('fetch')) {
        userMessage = 'Unable to connect to server. Please check if the backend is running on port 5000.';
      } else if (error.message.includes('email already exists')) {
        userMessage = 'This email is already registered. Please use a different email address.';
      }
      
      alert(`Error: ${userMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
  <div className={getClass('min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100', 'min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900')}>'
      {/* Header */}
  <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-16">
  <div className="absolute inset-0 bg-black/20"></div>
  <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-6">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
            Join Our Chef Community
          </h1>
          <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto opacity-95">
            Create your professional chef profile and start connecting with food enthusiasts
          </p>
        </div>
        
        {/* Floating elements */}
  <div className="absolute top-10 left-10 w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
  <div className="absolute bottom-10 right-10 w-8 h-8 bg-white/15 rounded-full animate-bounce"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className={getClass('bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-orange-100', 'bg-gray-900 rounded-3xl shadow-xl p-8 md:p-12 border border-gray-800')}>'
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
              Chef Registration
            </h2>
            <p className={getClass('text-gray-600 mb-4', 'text-gray-300 mb-4')}>Complete your profile to join our chef community</p>
            
            {/* Progress Indicator */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className={getClass('text-sm font-medium text-gray-600', 'text-sm font-medium text-gray-300')}>Profile Completion</span>
                <span className="text-sm font-medium text-orange-600">
                  {Math.round((getCompletionProgress().completed / getCompletionProgress().total) * 100)}%
                </span>
              </div>
              <div className={getClass('w-full bg-gray-200 rounded-full h-2', 'w-full bg-gray-700 rounded-full h-2')}>'
                <div 
                  className="bg-gradient-to-r from-orange-600 to-amber-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((getCompletionProgress().completed / getCompletionProgress().total) * 100)}%` }}
                ></div>
              </div>
              <p className={getClass('text-xs text-gray-500 mt-1', 'text-xs text-gray-400 mt-1')}>'
                {getCompletionProgress().completed} of {getCompletionProgress().total} required fields completed
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className={getClass('text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2', 'text-xl font-semibold text-orange-300 border-b border-gray-700 pb-2')}>
                Personal Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <TextInput
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  minLength="2"
                  maxLength="50"
                  pattern="^[a-zA-Z\s]+$"
                  title="Name should only contain letters and spaces (2-50 characters)"
                  required
                />
                <TextInput
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  type="email"
                  maxLength="100"
                  pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                  title="Please enter a valid email address"
                  required
                />
              </div>
              {/* Location Input */}
              <div>
                <label className={getClass('block text-sm font-medium text-gray-700 mb-3', 'block text-sm font-medium text-gray-200 mb-3')}>'
                  ðŸ“ Service Location Details
                </label>
                
                {/* City and State Row */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={getClass('block text-xs font-medium text-gray-600 mb-1', 'block text-xs font-medium text-gray-300 mb-1')}>City <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g., Mumbai, Delhi, Bangalore"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className={getClass('block text-xs font-medium text-gray-600 mb-1', 'block text-xs font-medium text-gray-300 mb-1')}>State <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g., Maharashtra, Delhi, Karnataka"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Auto-Generated Address Display */}
                <div className="mb-4">
                  <label className={getClass('block text-xs font-medium text-gray-600 mb-1', 'block text-xs font-medium text-gray-300 mb-1')}>
                    Complete Service Address (Auto-generated)
                  </label>
                  <div className={getClass('w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700', 'w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-gray-300')}>'
                    {formData.address || 'Address will be auto-generated from city and state'}
                  </div>
                  <p className={getClass('text-xs text-amber-600 mt-1', 'text-xs text-amber-400 mt-1')}>'
                    ✨ Address is automatically created from your city and state for consistency
                  </p>
                </div>

                {/* Geocode Button */}
                <div className="flex gap-3 items-center">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold shadow hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!formData.city || !formData.state || locationLoading}
                    onClick={async () => {
                      if (!formData.city || !formData.state) {
                        setLocationError('Please enter both city and state first');
                        return;
                      }
                      
                      setLocationError('');
                      // console.log('ðŸ”„ Starting geocoding for:', formData.address);
                      
                      const coords = await geocodeAddress(formData.address);
                      if (coords) {
                        setFormData(prev => ({ ...prev, locationLat: coords.lat, locationLon: coords.lon }));
                        // console.log('âœ… Location set successfully:', coords);
                      } else {
                        // console.log('âŒ Geocoding failed');
                        // Error message is already set by geocodeAddress function
                      }
                    }}
                  >
                    {locationLoading ? 'Setting...' : 'Set Location'}
                  </button>
                  {formData.locationLat && formData.locationLon && (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      Location verified!
                    </span>
                  )}
                </div>
                {locationError && <p className="text-red-500 text-xs mt-2">{locationError}</p>}
                <p className={getClass('text-xs text-orange-600 mt-2', 'text-xs text-orange-400 mt-2')}>'
                  ðŸ’¡ Enter city and state - we'll automatically create the complete address for location mapping and geocoding
                </p>
              </div>
              
              <TextInput
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                type="tel"
                pattern="^[6-9][0-9]{9}$"
                minLength="10"
                maxLength="10"
                title="Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)"
                required
              />
            </div>

            {/* Culinary Expertise Section */}
            <div className="space-y-6">
              <h3 className={getClass('text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2', 'text-xl font-semibold text-orange-300 border-b border-gray-700 pb-2')}>
                Culinary Expertise
              </h3>
              
              <CheckboxGroup
                label="Select Your Specialties (Choose multiple)"
                options={cuisineOptions}
                selectedOptions={formData.specialties}
                onChange={handleCheckboxChange}
              />
              
              <TextareaInput
                label="Professional Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about your culinary journey, cooking philosophy, and what makes you unique as a chef... (minimum 50 characters)"
                minLength="50"
                maxLength="1000"
                required
                rows={5}
              />
              
              <div className="flex justify-between items-center text-sm">
                {formData.bio.length > 0 && formData.bio.length < 50 && (
                  <p className="text-red-500">Bio must be at least 50 characters long</p>
                )}
                {formData.bio.length >= 50 && formData.bio.length <= 1000 && (
                  <p className="text-green-500">âœ“ Bio length is good</p>
                )}
                {formData.bio.length > 1000 && (
                  <p className="text-red-500">Bio is too long (maximum 1000 characters)</p>
                )}
                <span className={`text-sm ${formData.bio.length > 1000 ? 'text-red-500' : getClass('text-gray-500', 'text-gray-400')}`}>
                  {formData.bio.length}/1000 characters
                </span>
              </div>
            </div>

            {/* Professional Details Section */}
            <div className="space-y-6">
              <h3 className={getClass('text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2', 'text-xl font-semibold text-orange-300 border-b border-gray-700 pb-2')}>
                Professional Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <TextInput
                  label="Hourly Rate (INR)"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  placeholder="e.g., 1500"
                  type="number"
                  min="500"
                  max="10000"
                  step="50"
                  title="Hourly rate should be between Rs.500 and Rs.10,000"
                  required
                />
                <TextInput
                  label="Years of Experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  title="Experience should be between 1 and 50 years"
                  required
                />
              </div>
              
              <div>
                <label className={getClass('block text-sm font-medium text-gray-700 mb-2', 'block text-sm font-medium text-gray-200 mb-2')}>
                  Availability
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${classes.input.bg} ${classes.input.border} ${classes.input.text}`}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="weekends">Weekends only</option>
                  <option value="events">Events only</option>
                </select>
              </div>
            </div>

            {/* Additional Qualifications Section */}
            <div className="space-y-6">
              <h3 className={getClass('text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2', 'text-xl font-semibold text-orange-300 border-b border-gray-700 pb-2')}>
                Additional Qualifications
              </h3>
              
              <CheckboxGroup
                label="Certifications & Qualifications (Optional)"
                options={certificationOptions}
                selectedOptions={formData.certifications}
                onChange={handleCertificationChange}
              />
              
              <div>
                <label className={getClass('block text-sm font-medium text-gray-700 mb-2', 'block text-sm font-medium text-gray-200 mb-2')}>
                  Profile Picture (Optional)
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    name="profileImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${classes.input.bg} ${classes.input.border} ${classes.input.text}`}
                  />
                  {formData.profileImage && (
                    <div className={getClass('flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200', 'flex items-center gap-4 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700')}>
                      <img
                        src={URL.createObjectURL(formData.profileImage)}
                        alt="Profile preview"
                        className={getClass('w-16 h-16 rounded-full object-cover border-2 border-orange-300', 'w-16 h-16 rounded-full object-cover border-2 border-orange-500')}
                      />
                      <div>
                        <p className={getClass('font-medium text-gray-800', 'font-medium text-gray-200')}>{formData.profileImage.name}</p>
                        <p className={getClass('text-sm text-gray-600', 'text-sm text-gray-400')}>
                          Size: {(formData.profileImage.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, profileImage: null }))}
                        className="ml-auto text-red-500 hover:text-red-700 transition-colors duration-300"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className={getClass('text-sm text-gray-500 mt-2', 'text-sm text-gray-400 mt-2')}>Upload a professional photo (JPG, PNG up to 5MB)</p>
              </div>
            </div>

            {/* Validation Status Section */}
            {!validateForm() && (
              <div className={getClass('bg-yellow-50 border border-yellow-200 rounded-xl p-6', 'bg-yellow-900/20 border border-yellow-700 rounded-xl p-6')}>
                <div className="flex items-center mb-4">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                  <h4 className={getClass('text-lg font-semibold text-yellow-800', 'text-lg font-semibold text-yellow-300')}>Please complete the following to enable registration:</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  {getValidationErrors().map((error, index) => (
                    <div key={index} className={getClass('flex items-center text-sm text-yellow-700', 'flex items-center text-sm text-yellow-300')}>
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                      </svg>
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className={getClass('flex justify-center pt-8 border-t border-gray-200', 'flex justify-center pt-8 border-t border-gray-700')}>
              <button
                type="submit"
                disabled={isSubmitting || !validateForm()}
                className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  isSubmitting || !validateForm()
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-lg hover:scale-105'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Profile...
                  </>
                ) : validateForm() ? (
                  <>
                    Complete Registration
                    <svg className="w-5 h-5 inline ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    Complete Required Fields ({getValidationErrors().length} remaining)
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChefOnboarding;

