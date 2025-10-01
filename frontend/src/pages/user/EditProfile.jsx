import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { buildApiEndpoint } from '../../utils/apiConfig';

const EditProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [dataLoading, setDataLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    
    // Address Information
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Preferences
    dietaryPreferences: [],
    cuisinePreferences: [],
    allergens: [],
    
    // Profile Settings
    profileImage: null,
    bio: '',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  });

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        if (!userId || !token) {
          console.log('❌ No user ID or token found, redirecting to login');
          navigate('/login');
          return;
        }
        
        console.log('🔍 Loading user data for editing...');
        console.log('🔑 Token exists:', token ? 'Yes' : 'No');
        
        const response = await fetch(buildApiEndpoint(`/user/profile/${userId}`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const userData = await response.json();
          console.log('✅ User data loaded for editing:', userData);
          
          // Map backend data to form structure
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
            gender: userData.gender || '',
            address: userData.address || '',
            city: userData.city || '',
            state: userData.state || '',
            zipCode: userData.zipCode || '',
            country: userData.country || '',
            dietaryPreferences: userData.dietaryPreferences || [],
            cuisinePreferences: userData.cuisinePreferences || [],
            allergens: userData.allergens || [],
            profileImage: userData.profileImage || null,
            bio: userData.bio || '',
            notifications: userData.notifications || {
              email: true,
              sms: false,
              push: true
            }
          });
          
          // Set current profile image preview
          if (userData.profileImage) {
            setImagePreview(userData.profileImage);
          }
        } else {
          console.error('❌ Failed to load user data');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadUserData();
  }, []);

  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'keto', 'paleo'];
  const cuisineOptions = ['indian', 'italian', 'chinese', 'mexican', 'thai', 'french', 'japanese'];
  const allergenOptions = ['nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notifications.')) {
      const notificationKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async () => {
    if (!imageFile) return null;

    setUploadingImage(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const imageFormData = new FormData();
      imageFormData.append('profileImage', imageFile);

      console.log('🖼️ Uploading profile image...');
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiEndpoint(`/user/upload-profile-image/${userId}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: imageFormData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Image uploaded successfully:', result);
        console.log('🔗 Cloudinary URL:', result.imageUrl);
        console.log('📄 Full response:', result);
        return result.imageUrl;
      } else {
        const error = await response.json();
        console.error('❌ Image upload response error:', error);
        throw new Error(error.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('\n🔥 === USER PROFILE UPDATE STARTED ===');
    console.log('📝 Form Data:', formData);
    
    try {
      // First upload image if one was selected
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadProfileImage();
      }

      // Get user ID from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User ID not found. Please log in again.');
        return;
      }
      
      // Prepare update data
      const updateData = { ...formData };
      if (imageUrl) {
        updateData.profileImage = imageUrl;
      } else {
        // Don't update profileImage field if no new image was uploaded
        // This preserves the existing image in the database
        delete updateData.profileImage;
      }
      
      console.log('🆔 Using User ID:', userId);
      console.log('🌐 Sending update request to backend...');
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', token ? 'Yes' : 'No');
      
      const response = await fetch(buildApiEndpoint(`/user/profile/${userId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      console.log('📡 Response received:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend returned error:', errorData);
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('✅ Profile updated successfully:', result);
      console.log('🔥 === USER PROFILE UPDATE COMPLETED ===\n');
      
      // Update localStorage if user data is stored there
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      
      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('\n❌ === USER PROFILE UPDATE FAILED ===');
      console.error('🚨 Error:', error.message);
      console.error('🔥 === ERROR HANDLING COMPLETED ===\n');
      
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'address', label: 'Address', icon: '📍' },
    { id: 'preferences', label: 'Preferences', icon: '🍽️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Header */}
  <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/profile"
              className="inline-flex items-center px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
              Back to Profile
            </Link>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
              Edit Your Profile
            </h1>
            <p className="text-lg md:text-xl opacity-95 max-w-2xl mx-auto">
              Update your information and preferences to get the best personalized experience
            </p>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-8 h-8 bg-white/15 rounded-full animate-bounce"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
  <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4 bg-gradient-to-b from-orange-50 to-amber-50 p-6 border-r border-orange-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Profile Sections</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <span className="mr-3">{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {activeSection === 'personal' && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                        Personal Information
                      </h2>
                      <p className="text-gray-600">Update your basic profile details</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                        placeholder="Tell us about yourself..."
                      ></textarea>
                    </div>
                  </div>
                )}

                {activeSection === 'address' && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                        Address Information
                      </h2>
                      <p className="text-gray-600">Update your location details</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                        placeholder="Enter your street address"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                          placeholder="Enter your city"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                          placeholder="Enter your state"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                          placeholder="Enter your ZIP code"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                        >
                          <option value="India">India</option>
                          <option value="USA">United States</option>
                          <option value="UK">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'preferences' && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                        Food Preferences
                      </h2>
                      <p className="text-gray-600">Tell us about your dietary preferences and allergies</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Dietary Preferences</h3>
                      <div className="grid md:grid-cols-3 gap-3">
                        {dietaryOptions.map((option) => (
                          <label key={option} className="flex items-center p-3 border border-gray-300 rounded-xl hover:bg-purple-50 transition-all duration-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.dietaryPreferences.includes(option)}
                              onChange={() => handleArrayChange('dietaryPreferences', option)}
                              className="mr-3 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-gray-700 capitalize font-medium">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Cuisine Preferences</h3>
                      <div className="grid md:grid-cols-3 gap-3">
                        {cuisineOptions.map((option) => (
                          <label key={option} className="flex items-center p-3 border border-gray-300 rounded-xl hover:bg-blue-50 transition-all duration-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.cuisinePreferences.includes(option)}
                              onChange={() => handleArrayChange('cuisinePreferences', option)}
                              className="mr-3 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700 capitalize font-medium">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Allergens & Restrictions</h3>
                      <div className="grid md:grid-cols-3 gap-3">
                        {allergenOptions.map((option) => (
                          <label key={option} className="flex items-center p-3 border border-red-300 rounded-xl hover:bg-red-50 transition-all duration-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.allergens.includes(option)}
                              onChange={() => handleArrayChange('allergens', option)}
                              className="mr-3 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-gray-700 capitalize font-medium">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'settings' && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                        Account Settings
                      </h2>
                      <p className="text-gray-600">Manage your notification preferences and privacy settings</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                          <div>
                            <div className="font-medium text-gray-800">Email Notifications</div>
                            <div className="text-sm text-gray-600">Receive updates via email</div>
                          </div>
                          <input
                            type="checkbox"
                            name="notifications.email"
                            checked={formData.notifications.email}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                          <div>
                            <div className="font-medium text-gray-800">SMS Notifications</div>
                            <div className="text-sm text-gray-600">Receive updates via SMS</div>
                          </div>
                          <input
                            type="checkbox"
                            name="notifications.sms"
                            checked={formData.notifications.sms}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                          <div>
                            <div className="font-medium text-gray-800">Push Notifications</div>
                            <div className="text-sm text-gray-600">Receive push notifications in browser</div>
                          </div>
                          <input
                            type="checkbox"
                            name="notifications.push"
                            checked={formData.notifications.push}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                      
                      {/* Image Preview */}
                      <div className="mb-4">
                        {imagePreview ? (
                          <div className="relative w-32 h-32 mx-auto">
                            <img
                              src={imagePreview}
                              alt="Profile preview"
                              className="w-32 h-32 rounded-full object-cover border-4 border-purple-200 shadow-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setImageFile(null);
                              }}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* File Input */}
                      <input
                        type="file"
                        name="profileImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                      />
                      <p className="text-sm text-gray-500 mt-2">Upload a new profile picture (JPG, PNG up to 5MB)</p>
                      
                      {uploadingImage && (
                        <div className="mt-2 text-sm text-purple-600 flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading image...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                  <Link
                    to="/profile"
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold text-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isLoading
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        Save Changes
                        <svg className="w-5 h-5 inline ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
