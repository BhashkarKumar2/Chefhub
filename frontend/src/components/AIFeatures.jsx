import React, { useState } from 'react';
import axios from 'axios';
import { buildApiEndpoint } from '../utils/apiConfig';

const AIChefRecommendations = ({ userPreferences, onRecommendationsReceived, cuisineOptions, occasionOptions, dietaryOptions }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const getRecommendations = async () => {
    setLoading(true);
    try {
      // Include location data in the request if available
      const requestData = {
        userPreferences: {
          ...userPreferences,
          // Pass location coordinates for distance-based sorting
          locationLat: userPreferences.locationLat,
          locationLon: userPreferences.locationLon
        }
      };

      const response = await axios.post(buildApiEndpoint('ai/chef-recommendations'), requestData);
      
      const responseData = response.data.data;
      setRecommendations(responseData);
      onRecommendationsReceived(responseData);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      
      let errorMessage = 'Sorry, I could not get chef recommendations right now.';
      if (error.response?.status === 404) {
        errorMessage = 'AI service is currently unavailable. Please make sure the backend server is running.';
      } else if (error.response?.status === 500) {
        errorMessage = 'AI service error. Please check if the Gemini API key is configured.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on localhost:5000 or render.com';
      }
      
      setRecommendations({ 
        error: errorMessage,
        rawResponse: error.response?.data?.error || error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          🤖 AI Chef Recommendations
        </h3>
        <button
          onClick={getRecommendations}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Get AI Suggestions'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">AI is analyzing your preferences...</span>
        </div>
      )}

      {recommendations && (
        <div className="space-y-4">
          {Array.isArray(recommendations) ? (
            recommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-lg">{rec.chef?.name || 'Chef'}</h4>
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    Match: {rec.score || 'N/A'}/10
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{rec.explanation || 'No explanation available'}</p>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Why recommended:</span> {rec.reasons?.join(', ') || 'No reasons available'}
                </div>
              </div>
            ))
          ) : (
            <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
              <p className="text-amber-800">
                {recommendations.error || 'Unable to parse recommendations. Please try again.'}
              </p>
              {recommendations.rawResponse && (
                <details className="mt-2">
                  <summary className="text-sm text-amber-600 cursor-pointer">Show raw response</summary>
                  <pre className="text-xs text-amber-700 mt-2 whitespace-pre-wrap">
                    {recommendations.rawResponse}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AIMenuGenerator = ({ eventDetails, onMenuGenerated, serviceTypes, cuisineOptions, mealTimeOptions, dietaryOptions }) => {
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState(null);

  const generateMenu = async () => {
    setLoading(true);
    try {
      const response = await axios.post(buildApiEndpoint('ai/generate-menu'), {
        eventDetails
      });
      
      const responseData = response.data.data;
      setMenu(responseData);
      onMenuGenerated(responseData);
    } catch (error) {
      console.error('Error generating menu:', error);
      
      let errorMessage = 'Sorry, I could not generate a menu right now.';
      if (error.response?.status === 404) {
        errorMessage = 'AI service is currently unavailable. Please make sure the backend server is running.';
      } else if (error.response?.status === 500) {
        errorMessage = 'AI service error. Please check if the Gemini API key is configured.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on localhost:5000 or render.com';
      }
      
      setMenu({ 
        error: errorMessage,
        rawResponse: error.response?.data?.error || error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          🍽️ AI Menu Generator
        </h3>
        <button
          onClick={generateMenu}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Creating Menu...' : 'Generate Menu'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Creating personalized menu...</span>
        </div>
      )}

      {menu && (
        <div className="space-y-6">
          {menu.error ? (
            <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
              <p className="text-amber-800">{menu.error}</p>
              {menu.rawResponse && (
                <details className="mt-2">
                  <summary className="text-sm text-amber-600 cursor-pointer">Show error details</summary>
                  <pre className="text-xs text-amber-700 mt-2 whitespace-pre-wrap">
                    {menu.rawResponse}
                  </pre>
                </details>
              )}
            </div>
          ) : (
            <>
              <div>
                <h4 className="font-semibold text-lg mb-2">🥗 Appetizers</h4>
                <ul className="list-disc list-inside space-y-1">
                  {menu.appetizers?.map((item, index) => (
                    <li key={index} className="text-gray-700">{item}</li>
                  )) || <li className="text-gray-500">No appetizers available</li>}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">🍛 Main Course</h4>
                <ul className="list-disc list-inside space-y-1">
                  {menu.mainCourse?.map((item, index) => (
                    <li key={index} className="text-gray-700">{item}</li>
                  )) || <li className="text-gray-500">No main course available</li>}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">🍰 Desserts</h4>
                <ul className="list-disc list-inside space-y-1">
                  {menu.desserts?.map((item, index) => (
                    <li key={index} className="text-gray-700">{item}</li>
                  )) || <li className="text-gray-500">No desserts available</li>}
                </ul>
              </div>

              {menu.estimatedCost && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">💰 Cost Estimate</h4>
                  <p className="text-blue-700">₹{menu.estimatedCost} per person</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const AIChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
    const response = await axios.post(buildApiEndpoint('ai/chat'), {
      message: input,
      context: messages.slice(-5).map(m => `${m.type}: ${m.content}`).join('\n')
    });

      const aiMessage = { 
        type: 'ai', 
        content: response.data.data.response, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorText = 'Sorry, I encountered an error. Please try again.';
      if (error.response?.status === 404) {
        errorText = 'AI service is currently unavailable. Please make sure the backend server is running.';
      } else if (error.response?.status === 500) {
        errorText = 'AI service error. Please check if the Gemini API key is configured.';
      } else if (error.code === 'ECONNREFUSED') {
        errorText = 'Cannot connect to server. Please make sure the backend is running on localhost:5000 or render.com';
      }
      
      const errorMessage = { 
        type: 'ai',
        content: errorText, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        👨‍🍳 AI Chef Assistant
      </h3>
      
      <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center">
            Ask me anything about cooking, recipes, or food preparation!
          </p>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`mb-3 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-xs ${
              message.type === 'user' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white border border-gray-200'
            }`}>
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="text-left mb-3">
            <div className="inline-block p-3 rounded-lg bg-white border border-gray-200">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about cooking tips, recipes, ingredients..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

// Main AI Features Dashboard Component
const AIFeatures = () => {
  // Define project-specific data based on actual ChefHub models and components
  const serviceTypes = [
    { id: 'birthday', name: 'Birthday Party', description: 'Birthday celebrations with custom menus' },
    { id: 'marriage', name: 'Marriage Ceremony', description: 'Wedding ceremonies and receptions' },
    { id: 'daily', name: 'Daily Cooking', description: 'Regular home cooking services' },
    { id: 'corporate', name: 'Corporate Events', description: 'Business meetings and corporate functions' }
  ];

  const cuisineOptions = [
    'North Indian', 'South Indian', 'Continental', 'Chinese', 
    'Italian', 'Mexican', 'Thai', 'Japanese', 'Mediterranean',
    'Bengali', 'Punjabi', 'Gujarati', 'Maharashtrian', 'Tamil',
    'Kerala', 'Rajasthani', 'Hyderabadi'
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Diabetic-Friendly', 'Jain',
    'Halal', 'No Onion No Garlic', 'Low Sodium', 'Organic'
  ];

  const occasionOptions = [
    'Birthday Party', 'Anniversary', 'Wedding Reception', 'Engagement',
    'Baby Shower', 'Housewarming', 'Festival Celebration', 'Corporate Event',
    'Business Meeting', 'Family Gathering', 'Dinner Party', 'Lunch Event',
    'Diwali', 'Holi', 'Christmas', 'New Year', 'Eid'
  ];

  const mealTimeOptions = [
    'Breakfast', 'Brunch', 'Lunch', 'High Tea', 'Dinner', 'Late Night Snacks'
  ];

  const [userPreferences, setUserPreferences] = useState({
    cuisine: '',
    budget: '',
    occasion: '',
    guests: '',
    dietary: ''
  });
  
  const [eventDetails, setEventDetails] = useState({
    serviceType: '',
    cuisine: '',
    guests: '',
    budget: '',
    mealTime: '',
    dietary: ''
  });

  const handleRecommendationsReceived = (recommendations) => {
    console.log('Received recommendations:', recommendations);
  };

  const handleMenuGenerated = (menu) => {
    console.log('Generated menu:', menu);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🤖 AI-Powered Features</h1>
        <p className="text-gray-600">Discover personalized chef recommendations and custom menus powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Chef Recommendations Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Chef Recommendations</h2>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Tell us your preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                <select
                  value={userPreferences.cuisine}
                  onChange={(e) => setUserPreferences({...userPreferences, cuisine: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select cuisine</option>
                  {cuisineOptions.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                <input
                  type="number"
                  value={userPreferences.budget}
                  onChange={(e) => setUserPreferences({...userPreferences, budget: e.target.value})}
                  placeholder="Enter your budget"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
                <select
                  value={userPreferences.occasion}
                  onChange={(e) => setUserPreferences({...userPreferences, occasion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select occasion</option>
                  {occasionOptions.map(occasion => (
                    <option key={occasion} value={occasion}>{occasion}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                <input
                  type="number"
                  value={userPreferences.guests}
                  onChange={(e) => setUserPreferences({...userPreferences, guests: e.target.value})}
                  placeholder="Number of guests"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
                <select
                  value={userPreferences.dietary}
                  onChange={(e) => setUserPreferences({...userPreferences, dietary: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">No dietary restrictions</option>
                  {dietaryOptions.map(diet => (
                    <option key={diet} value={diet}>{diet}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <AIChefRecommendations 
            userPreferences={userPreferences}
            onRecommendationsReceived={handleRecommendationsReceived}
            cuisineOptions={cuisineOptions}
            occasionOptions={occasionOptions}
            dietaryOptions={dietaryOptions}
          />
        </div>

        {/* Menu Generation Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Menu Generation</h2>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Event Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                <select
                  value={eventDetails.serviceType}
                  onChange={(e) => setEventDetails({...eventDetails, serviceType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select service type</option>
                  {serviceTypes.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
                <select
                  value={eventDetails.cuisine}
                  onChange={(e) => setEventDetails({...eventDetails, cuisine: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select cuisine</option>
                  {cuisineOptions.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                <input
                  type="number"
                  value={eventDetails.guests}
                  onChange={(e) => setEventDetails({...eventDetails, guests: e.target.value})}
                  placeholder="Number of guests"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                <input
                  type="number"
                  value={eventDetails.budget}
                  onChange={(e) => setEventDetails({...eventDetails, budget: e.target.value})}
                  placeholder="Total budget"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meal Time</label>
                <select
                  value={eventDetails.mealTime}
                  onChange={(e) => setEventDetails({...eventDetails, mealTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select meal time</option>
                  {mealTimeOptions.map(mealTime => (
                    <option key={mealTime} value={mealTime}>{mealTime}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
                <select
                  value={eventDetails.dietary}
                  onChange={(e) => setEventDetails({...eventDetails, dietary: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">No dietary restrictions</option>
                  {dietaryOptions.map(diet => (
                    <option key={diet} value={diet}>{diet}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <AIMenuGenerator 
            eventDetails={eventDetails}
            onMenuGenerated={handleMenuGenerated}
            serviceTypes={serviceTypes}
            cuisineOptions={cuisineOptions}
            mealTimeOptions={mealTimeOptions}
            dietaryOptions={dietaryOptions}
          />
        </div>
      </div>

      {/* AI Chat Assistant */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">AI Cooking Assistant</h2>
        <AIChatAssistant />
      </div>
    </div>
  );
};

export default AIFeatures;
export { AIChefRecommendations, AIMenuGenerator, AIChatAssistant };
