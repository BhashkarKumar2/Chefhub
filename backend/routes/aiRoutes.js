import express from 'express';
import geminiService from '../services/geminiService.js';
import Chef from '../models/Chef.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import AIUsage from '../models/AIUsage.js';
import { verifyToken } from '../auth/authMiddleware.js';

const router = express.Router();

// Get AI-powered chef recommendations
router.post('/chef-recommendations', verifyToken, async (req, res) => {
  try {
    // Verify user exists and get profile
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const userProfile = await User.findById(req.user.id);

    // Get available chefs (can still filter by basic active status)
    let chefQuery = { isActive: true };
    const availableChefs = await Chef.find(chefQuery).select('name specialty pricePerHour experienceYears bio averageRating totalReviews serviceableLocations supportedOccasions');



    const recommendations = await geminiService.getChefRecommendations(
      userProfile,
      availableChefs
    );

    console.log(`[AI Debug] AI returned ${recommendations.length} recommendations`);

    res.json({
      success: true,
      data: recommendations,
      debug: {
        chefsChecked: availableChefs.length,
        userCity: userProfile.city || 'Not set'
      }
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

// Get AI usage stats
router.get('/usage', verifyToken, async (req, res) => {
  try {
    const usage = await AIUsage.findOne({
      user: req.user.id,
      feature: 'menu_generation'
    });

    // Default limit is 5 per month
    const LIMIT = 5;
    const currentCount = usage ? usage.count : 0;

    res.json({
      success: true,
      data: {
        used: currentCount,
        limit: LIMIT,
        remaining: Math.max(0, LIMIT - currentCount)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch usage stats' });
  }
});

// Generate AI-powered menu for events (Freemium: Limited to 5/month)
router.post('/generate-menu', verifyToken, async (req, res) => {
  try {
    const { eventDetails } = req.body;
    const userId = req.user.id; // From verifyToken

    // 1. Check Usage Limit
    let usage = await AIUsage.findOne({ user: userId, feature: 'menu_generation' });

    if (!usage) {
      usage = new AIUsage({ user: userId, feature: 'menu_generation', count: 0 });
    }

    const LIMIT = 5;
    if (usage.count >= LIMIT) {
      return res.status(403).json({
        success: false,
        error: 'Free limit exceeded. You have used all 5 free menu generations for this month.',
        code: 'LIMIT_EXCEEDED'
      });
    }

    // 2. Generate Menu
    const menu = await geminiService.generateEventMenu(eventDetails);

    // 3. Increment Usage (only on success)
    usage.count += 1;
    usage.lastUsedAt = new Date();
    await usage.save();

    res.json({
      success: true,
      data: menu,
      usage: {
        used: usage.count,
        limit: LIMIT,
        remaining: LIMIT - usage.count
      }
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
