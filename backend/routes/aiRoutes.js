import express from 'express';
import geminiService from '../services/geminiService.js';
import Chef from '../models/Chef.js';
import Booking from '../models/Booking.js';
import { verifyToken } from '../auth/authMiddleware.js';

const router = express.Router();

// Get AI-powered chef recommendations
router.post('/chef-recommendations', async (req, res) => {
  try {
    const { userPreferences } = req.body;

    // Get available chefs based on location and availability
    let chefQuery = { isActive: true };
    
    // If user has location preferences, add location-based filtering
    if (userPreferences.location) {
      // You can add more sophisticated location filtering here
      // For now, we'll get all active chefs and let the AI service handle distance-based ranking
    }

    const availableChefs = await Chef.find(chefQuery).select('name specialty pricePerHour experienceYears bio rating serviceableLocations');

    // If user provided location coordinates, calculate distances for better AI recommendations
    let chefsWithDistance = availableChefs;
    if (userPreferences.locationLat && userPreferences.locationLon) {
      // Note: In a production app, you'd implement distance calculation here
      // For now, we'll pass the location data to the AI service
      chefsWithDistance = availableChefs.map(chef => ({
        ...chef.toObject(),
        userLocationLat: userPreferences.locationLat,
        userLocationLon: userPreferences.locationLon
      }));
    }

    const recommendations = await geminiService.getChefRecommendations(
      userPreferences, 
      chefsWithDistance
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    // console.error('Chef recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chef recommendations',
      error: error.message
    });
  }
});

// Generate AI-powered menu for events
router.post('/generate-menu', async (req, res) => {
  try {
    const { eventDetails } = req.body;

    const menu = await geminiService.generateEventMenu(eventDetails);

    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    // console.error('Menu generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate menu',
      error: error.message
    });
  }
});

// Get smart pricing suggestions
router.post('/pricing-suggestions', async (req, res) => {
  try {
    const { bookingDetails } = req.body;

    // Get market data (you can enhance this with real market analysis)
    const marketData = {
      averageRate: 1500, // You can calculate this from existing bookings
      seasonalDemand: 'medium',
      competitionLevel: 'moderate'
    };

    const pricingSuggestions = await geminiService.generatePricingSuggestions(
      bookingDetails, 
      marketData
    );

    res.json({
      success: true,
      data: pricingSuggestions
    });
  } catch (error) {
    // console.error('Pricing suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pricing suggestions',
      error: error.message
    });
  }
});

// Generate professional review responses
router.post('/review-response', verifyToken, async (req, res) => {
  try {
    const { review, chefId } = req.body;

    const chef = await Chef.findById(chefId);
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found'
      });
    }

    const response = await geminiService.generateReviewResponse(review, chef);

    res.json({
      success: true,
      data: { response }
    });
  } catch (error) {
    // console.error('Review response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate review response',
      error: error.message
    });
  }
});

// Generate cooking content and tips
router.post('/cooking-content', async (req, res) => {
  try {
    const { topic, userLevel = 'beginner' } = req.body;

    const content = await geminiService.generateCookingContent(topic, userLevel);

    res.json({
      success: true,
      data: { content }
    });
  } catch (error) {
    // console.error('Cooking content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate cooking content',
      error: error.message
    });
  }
});

// Generate personalized meal plans
router.post('/meal-plan', verifyToken, async (req, res) => {
  try {
    const { preferences } = req.body;

    const mealPlan = await geminiService.generateMealPlan(preferences);

    res.json({
      success: true,
      data: mealPlan
    });
  } catch (error) {
    // console.error('Meal plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate meal plan',
      error: error.message
    });
  }
});

// Chat with AI chef assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, context = '' } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
        error: 'Invalid message input'
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured',
        error: 'GEMINI_API_KEY not found'
      });
    }

    const prompt = `
    You are a professional chef assistant. Help users with cooking questions.
    
    Context: ${context}
    User Question: ${message}
    
    Provide helpful, practical advice about cooking, recipes, ingredients, 
    or food-related topics. Keep responses concise but informative.
    `;

    const response = await geminiService.generateWithFallback(prompt);

    res.json({
      success: true,
      data: { 
        response: response.text(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    // console.error('AI chat error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process chat message';
    let statusCode = 500;
    
    if (error.message && error.message.includes('API_KEY')) {
      errorMessage = 'AI service configuration error';
      statusCode = 503;
    } else if (error.message && error.message.includes('404')) {
      errorMessage = 'AI model not available. Please try again later.';
      statusCode = 503;
    } else if (error.message && error.message.includes('quota')) {
      errorMessage = 'AI service quota exceeded. Please try again later.';
      statusCode = 429;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
});

export default router;
