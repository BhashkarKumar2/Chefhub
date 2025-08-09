import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const sampleChef = {
  fullName: 'Chef Ananya Rao',
  bio: 'Experienced fusion chef with a flair for seasonal ingredients and innovative cooking techniques. Passionate about creating memorable dining experiences that blend traditional flavors with modern presentations.',
  specialties: ['Indian Fusion', 'Vegan Cuisine', 'Gluten-Free', 'Molecular Gastronomy'],
  hourlyRate: 1200,
  experienceYears: 8,
  location: 'Mumbai, Maharashtra',
  availability: 'Full-time',
  rating: 4.8,
  reviewsCount: 156,
  completedBookings: 342,
  menu: [
    { category: 'Appetizers', items: ['Tandoori Mushroom Skewers', 'Quinoa Bhel Puri', 'Deconstructed Samosa'] },
    { category: 'Main Course', items: ['Jackfruit Biryani', 'Cauliflower Tikka Masala', 'Fusion Ramen Bowl'] },
    { category: 'Desserts', items: ['Coconut Vegan Ladoo', 'Cardamom Panna Cotta', 'Rose Kulfi Shots'] }
  ],
  certificates: [
    'Certified Food Safety Level 2',
    'Advanced Culinary Arts Diploma',
    'Vegan Cooking Specialist',
    'Wine Pairing Certificate'
  ],
  photo: 'https://images.unsplash.com/photo-1559847844-d963b5de7901?w=500&auto=format&fit=crop&q=60',
  gallery: [
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&auto=format&fit=crop&q=60'
  ],
  reviews: [
    { name: 'Priya Sharma', rating: 5, comment: 'Amazing fusion dishes! Chef Ananya exceeded our expectations.', date: '2 weeks ago' },
    { name: 'Rajesh Kumar', rating: 4, comment: 'Great vegan options and professional service.', date: '1 month ago' },
    { name: 'Sarah Johnson', rating: 5, comment: 'Best private chef experience we\'ve had!', date: '2 months ago' }
  ]
};

const ChefProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('about');
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const {
    fullName,
    bio,
    specialties,
    hourlyRate,
    experienceYears,
    location,
    availability,
    rating,
    reviewsCount,
    completedBookings,
    menu,
    certificates,
    photo,
    gallery,
    reviews
  } = sampleChef;

  const tabs = [
    { id: 'about', label: 'About', icon: '👨‍🍳' },
    { id: 'menu', label: 'Sample Menu', icon: '🍽️' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'gallery', label: 'Gallery', icon: '📸' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative">
        <div className="h-96 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <img 
            src={photo} 
            alt={fullName}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
          
          {/* Floating elements */}
          <div className="absolute top-20 left-20 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-12 h-12 bg-white/15 rounded-full animate-bounce"></div>
        </div>
        
        {/* Profile Card */}
        <div className="relative max-w-6xl mx-auto px-6 -mt-32">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100">
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <img
                    src={photo}
                    alt={fullName}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">{fullName}</h1>
                      <div className="flex items-center gap-4 text-gray-600 mb-4">
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                          </svg>
                          {location}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                          </svg>
                          {experienceYears} years experience
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                          isBookmarked 
                            ? 'bg-red-100 text-red-600 border border-red-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        <svg className="w-5 h-5 inline mr-2" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        {isBookmarked ? 'Saved' : 'Save'}
                      </button>
                      
                      <Link 
                        to={`/book/${id}`}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold text-center"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">₹{hourlyRate}</div>
                      <div className="text-sm text-gray-600">per hour</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">{rating}</div>
                      <div className="text-sm text-gray-600">{reviewsCount} reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{completedBookings}</div>
                      <div className="text-sm text-gray-600">bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{availability}</div>
                      <div className="text-sm text-gray-600">availability</div>
                    </div>
                  </div>
                  
                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 border border-purple-100">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-purple-100">
          {activeTab === 'about' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">About Chef {fullName.split(' ')[1]}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{bio}</p>
              </div>
              
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4">Certifications & Qualifications</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {certificates.map((cert, index) => (
                    <div key={index} className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                      <svg className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span className="text-gray-700 font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Sample Menu</h3>
                <p className="text-gray-600">Experience our chef's signature dishes</p>
              </div>
              
              {menu.map((section, index) => (
                <div key={index} className="mb-8">
                  <h4 className="text-2xl font-semibold text-purple-600 mb-4 border-b border-purple-200 pb-2">
                    {section.category}
                  </h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                          <span className="text-gray-700 font-medium">{item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Client Reviews</h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-6 h-6 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <span className="text-xl font-semibold text-gray-700 ml-2">{rating} out of 5</span>
                </div>
                <p className="text-gray-600">Based on {reviewsCount} reviews</p>
              </div>
              
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={index} className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-semibold text-gray-800">{review.name}</h5>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Food Gallery</h3>
                <p className="text-gray-600">A glimpse of our chef's culinary artistry</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((image, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                    <img
                      src={image}
                      alt={`Dish ${index + 1}`}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="font-semibold">Signature Dish</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Book Your Experience?</h3>
            <p className="text-xl mb-8 opacity-95">Create unforgettable memories with Chef {fullName.split(' ')[1]}</p>
            <Link 
              to={`/book/${id}`}
              className="inline-flex items-center px-8 py-3 bg-white text-purple-600 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
            >
              Book Chef {fullName.split(' ')[1]}
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefProfile;
  