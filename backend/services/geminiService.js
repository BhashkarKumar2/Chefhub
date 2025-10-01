import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
 constructor() {
    // Initialize Gemini with API key
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Define fallback models (ordered by preference)
    this.availableModels = [
      "models/gemini-2.5-flash",
      "models/gemini-2.5-pro",
      "models/gemini-flash-latest",
      "models/gemini-pro-latest"
    ];

    this.currentModelIndex = 0;
    this.model = this.genAI.getGenerativeModel({
      model: this.availableModels[this.currentModelIndex],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });
  }

  // Method to try different models if one fails
  async generateWithFallback(prompt) {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    let lastError;
    
    for (let i = 0; i < this.availableModels.length; i++) {
      try {
        if (i !== this.currentModelIndex) {
          this.model = this.genAI.getGenerativeModel({ 
            model: this.availableModels[i],
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 1024,
            }
          });
          this.currentModelIndex = i;
        }
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        
        // Check if response is valid
        if (!response || !response.text) {
          throw new Error('Invalid response from AI model');
        }
        
        return response;
      } catch (error) {
        lastError = error;
        console.warn(`Model ${this.availableModels[i]} failed:`, error.message);
        
        // If it's a 404 error about model not found, try next model
        if (error.message.includes('404') || error.message.includes('not found')) {
          continue;
        }
        
        // If it's an API key error, don't try other models
        if (error.message.includes('API_KEY') || error.message.includes('403')) {
          throw error;
        }
        
        continue;
      }
    }
    
    // If all models failed, provide a fallback response for chat
    if (prompt.toLowerCase().includes('chef assistant') || prompt.toLowerCase().includes('cooking')) {
      console.log('All AI models failed, returning fallback cooking response');
      return {
        text: () => "I'm sorry, but the AI service is currently unavailable. However, I'd be happy to help with basic cooking advice! For specific recipes and detailed cooking instructions, please try again later when the AI service is restored."
      };
    }
    
    throw lastError || new Error('All AI models are currently unavailable');
  }

  // Generate chef recommendations based on user preferences
  async getChefRecommendations(userPreferences, availableChefs) {
    const hasLocationData = userPreferences.locationLat && userPreferences.locationLon;
    
    const prompt = `
    Act as a culinary expert and recommend the best chefs based on user preferences:
    
    User Preferences:
    - Event Type: ${userPreferences.serviceType || 'Event'}
    - Guest Count: ${userPreferences.guestCount || 'Not specified'}
    - Budget Range: ₹${userPreferences.minBudget || 0} - ₹${userPreferences.maxBudget || 'Not specified'}
    - Cuisine Preference: ${userPreferences.cuisinePreference || userPreferences.cuisine || 'Any'}
    - Dietary Restrictions: ${userPreferences.dietaryRestrictions || 'None'}
    - Location: ${userPreferences.location || 'Not specified'}
    - Date: ${userPreferences.date || 'Not specified'}
    ${hasLocationData ? `- User Coordinates: Lat ${userPreferences.locationLat}, Lon ${userPreferences.locationLon}` : ''}
    
    Available Chefs:
    ${JSON.stringify(availableChefs, null, 2)}
    
    ${hasLocationData ? 
      'IMPORTANT: Consider distance and serviceableLocations when ranking chefs. Prioritize chefs who serve the user\'s location.' : 
      'Note: No location data provided, rank based on other preferences.'
    }
    
    Return EXACTLY this JSON format (as an array):
    [
      {
        "chef": {
          "name": "Chef Name",
          "id": "chef_id_from_available_chefs"
        },
        "score": 8,
        "explanation": "Detailed explanation of why this chef is recommended",
        "reasons": ["reason 1", "reason 2", "reason 3"],
        "distanceNote": "Distance-related information if applicable"
      }
    ]
    
    Rank the top 3-5 chefs and provide scores (1-10), detailed explanations, and specific reasons.
    ${hasLocationData ? 'Include distance considerations in your reasoning.' : ''}
    Only return the JSON array, no other text.
    `;

    try {
      const response = await this.generateWithFallback(prompt);
      const parsed = this.parseJSONResponse(response.text());
      
      // Handle different response formats
      if (parsed.topChefs) {
        // Convert the topChefs format to expected format
        return parsed.topChefs.map(chef => ({
          chef: {
            name: availableChefs.find(c => c._id === chef.chefId)?.name || 'Unknown Chef',
            id: chef.chefId
          },
          score: chef.score,
          explanation: typeof chef.explanation === 'object' 
            ? chef.explanation.reasonsForRecommendation || 'No explanation provided'
            : chef.explanation,
          reasons: typeof chef.explanation === 'object' 
            ? [chef.explanation.bestMatchFactors, chef.explanation.potentialConcerns].filter(Boolean)
            : ['AI recommendation based on available data'],
          distanceNote: chef.distanceNote || ''
        }));
      }
      
      // Return as-is if already in expected format
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate chef recommendations');
    }
  }

  // Generate personalized menus for events
  async generateEventMenu(eventDetails) {
    const prompt = `
    Create a detailed, culturally appropriate menu for an event with the following details:
    
    Event Details:
    - Service Type: ${eventDetails.serviceType || 'General Event'}
    - Guest Count: ${eventDetails.guests || 'Not specified'}
    - Budget: ₹${eventDetails.budget || 'Not specified'}
    - Cuisine Style: ${eventDetails.cuisine || 'Mixed Cuisine'}
    - Dietary Restrictions: ${eventDetails.dietary || 'None'}
    - Meal Time: ${eventDetails.mealTime || 'Dinner'}
    
    IMPORTANT: Return EXACTLY this JSON format, no other text:
    {
      "appetizers": ["Dish Name 1", "Dish Name 2", "Dish Name 3"],
      "mainCourse": ["Main Dish 1", "Main Dish 2", "Main Dish 3", "Vegetarian Option"],
      "desserts": ["Dessert 1", "Dessert 2"],
      "beverages": ["Beverage 1", "Beverage 2", "Beverage 3"],
      "estimatedCost": 1500,
      "preparationTime": "2-3 hours",
      "servingNotes": "Additional serving suggestions"
    }
    
    Create authentic ${eventDetails.cuisine || 'Indian'} dishes suitable for ${eventDetails.mealTime || 'dinner'}.
    Consider the dietary restrictions: ${eventDetails.dietary || 'None'}.
    Ensure dishes are appropriate for ${eventDetails.guests || 10} guests.
    
    Only return the JSON object, no explanations or markdown formatting.
    `;

    try {
      const response = await this.generateWithFallback(prompt);
      const responseText = response.text().trim();
      
      // Clean the response to ensure it's valid JSON
      let cleanedResponse = responseText;
      
      // Remove markdown code blocks if present
      if (cleanedResponse.includes('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      if (cleanedResponse.includes('```')) {
        cleanedResponse = cleanedResponse.replace(/```/g, '');
      }
      
      // Parse the JSON
      const parsedMenu = JSON.parse(cleanedResponse.trim());
      
      // Validate the structure and provide defaults
      const menu = {
        appetizers: parsedMenu.appetizers || [
          "Vegetable Samosa", 
          "Paneer Tikka", 
          "Mixed Pakoras"
        ],
        mainCourse: parsedMenu.mainCourse || [
          "Butter Chicken", 
          "Dal Makhani", 
          "Biryani", 
          "Palak Paneer"
        ],
        desserts: parsedMenu.desserts || [
          "Gulab Jamun", 
          "Kulfi"
        ],
        beverages: parsedMenu.beverages || [
          "Lassi", 
          "Masala Chai", 
          "Fresh Lime Water"
        ],
        estimatedCost: parsedMenu.estimatedCost || 1200,
        preparationTime: parsedMenu.preparationTime || "2-3 hours",
        servingNotes: parsedMenu.servingNotes || "Serve hot and fresh"
      };
      
      return menu;
    } catch (error) {
      console.error('Menu generation error:', error);
      
      // Return a fallback menu with proper structure
      return {
        appetizers: [
          "Vegetable Samosa with Mint Chutney", 
          "Paneer Tikka", 
          "Mixed Vegetable Pakoras"
        ],
        mainCourse: [
          "Butter Chicken with Naan", 
          "Dal Makhani", 
          "Vegetable Biryani", 
          "Palak Paneer with Roti"
        ],
        desserts: [
          "Gulab Jamun", 
          "Kulfi with Pistachios"
        ],
        beverages: [
          "Sweet Lassi", 
          "Masala Chai", 
          "Fresh Lime Soda"
        ],
        estimatedCost: 1200,
        preparationTime: "2-3 hours",
        servingNotes: "Default menu - AI service may be unavailable. Dishes are suitable for most occasions."
      };
    }
  }

  // Generate smart pricing suggestions
  async generatePricingSuggestions(bookingDetails, marketData) {
    const prompt = `
    As a pricing expert, suggest optimal pricing for:
    
    Booking Details:
    - Service Type: ${bookingDetails.serviceType}
    - Duration: ${bookingDetails.duration} hours
    - Guest Count: ${bookingDetails.guestCount}
    - Date: ${bookingDetails.date}
    - Location: ${bookingDetails.location}
    - Complexity Level: ${bookingDetails.complexity}
    
    Market Context:
    - Average rates in area: ₹${marketData.averageRate}/hour
    - Seasonal demand: ${marketData.seasonalDemand}
    - Competition level: ${marketData.competitionLevel}
    
    Provide:
    1. Base rate recommendation
    2. Dynamic pricing factors
    3. Upselling opportunities
    4. Competitive positioning
    5. Value justification
    
    Format as JSON with detailed breakdown.
    `;

    try {
      const response = await this.generateWithFallback(prompt);
      return this.parseJSONResponse(response.text());
    } catch (error) {
      console.error('Pricing suggestion error:', error);
      throw new Error('Failed to generate pricing suggestions');
    }
  }

  // Generate professional review responses
  async generateReviewResponse(review, chefProfile) {
    const prompt = `
    Generate a professional, personalized response to this customer review:
    
    Review: "${review.comment}"
    Rating: ${review.rating}/5 stars
    Service Type: ${review.serviceType}
    
    Chef Profile:
    - Name: ${chefProfile.name}
    - Specialty: ${chefProfile.specialty}
    - Experience: ${chefProfile.experienceYears} years
    
    Response should be:
    - Professional and warm
    - Address specific points mentioned
    - Thank the customer appropriately
    - Offer future engagement if positive
    - Address concerns professionally if negative
    - Include chef's personality
    
    Keep under 150 words.
    `;

    try {
      const response = await this.generateWithFallback(prompt);
      return response.text().trim();
    } catch (error) {
      console.error('Review response error:', error);
      throw new Error('Failed to generate review response');
    }
  }

  // Generate cooking tips and recipes
  async generateCookingContent(topic, userLevel) {
    const prompt = `
    Create engaging cooking content about: ${topic}
    
    Target Audience: ${userLevel} level cooks
    
    Include:
    1. Brief introduction
    2. Step-by-step instructions
    3. Pro tips from professional chefs
    4. Common mistakes to avoid
    5. Variations and substitutions
    6. Nutritional benefits
    
    Make it engaging and educational, formatted for web display.
    `;

    try {
      const response = await this.generateWithFallback(prompt);
      return response.text();
    } catch (error) {
      console.error('Cooking content error:', error);
      throw new Error('Failed to generate cooking content');
    }
  }

  // Helper method to parse JSON responses safely
  parseJSONResponse(text) {
    try {
      // Clean up the response text
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.error('JSON parsing error:', error);
      // Return a structured error response
      return {
        error: 'Failed to parse AI response',
        rawResponse: text
      };
    }
  }

  // Generate meal planning suggestions
  async generateMealPlan(preferences) {
    const prompt = `
    Create a weekly meal plan based on:
    
    Preferences:
    - Cuisine types: ${preferences.cuisineTypes}
    - Dietary restrictions: ${preferences.dietaryRestrictions}
    - Budget: ₹${preferences.weeklyBudget}
    - Family size: ${preferences.familySize}
    - Cooking skill level: ${preferences.skillLevel}
    
    Provide:
    1. 7-day meal plan (breakfast, lunch, dinner)
    2. Shopping list organized by categories
    3. Prep time estimates
    4. Cost breakdown
    5. Nutritional balance notes
    
    Format as structured JSON.
    `;

    try {
      const response = await this.generateWithFallback(prompt);
      return this.parseJSONResponse(response.text());
    } catch (error) {
      console.error('Meal plan error:', error);
      throw new Error('Failed to generate meal plan');
    }
  }
}

export default new GeminiService();
