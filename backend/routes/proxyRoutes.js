import express from 'express';
import axios from 'axios';
import cacheService from '../services/cacheService.js';

const router = express.Router();
const GEOCODE_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;
const DIRECTIONS_CACHE_TTL_SECONDS = 15 * 60;

const normalizeAddress = (address) => address.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * Email Service Route - Using Brevo (Sendinblue) API
 * Prevents exposing email service credentials in frontend
 */
router.post('/send-email', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, and message are required' 
      });
    }

    // Check if Brevo is configured
    if (!process.env.BREVO_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Email service not configured' 
      });
    }

    // Send email via Brevo API
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: process.env.BREVO_FROM_NAME || 'ChefHub',
          email: process.env.BREVO_FROM_EMAIL
        },
        to: [
          {
            email: process.env.BREVO_FROM_EMAIL, // Send to yourself
            name: process.env.BREVO_FROM_NAME || 'ChefHub'
          }
        ],
        replyTo: {
          email: email,
          name: name
        },
        subject: subject || 'Contact Form Submission from ChefHub',
        htmlContent: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
          <hr>
          <h3>Message:</h3>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
        textContent: `
New Contact Form Submission

From: ${name}
Email: ${email}
Subject: ${subject || 'No subject'}

Message:
${message}
        `
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: response.data.messageId
    });
  } catch (error) {
    console.error('Email sending error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email',
      details: error.response?.data?.message || error.message
    });
  }
});

/**
 * Razorpay Configuration Route
 * Returns only the public key needed for frontend
 */
router.get('/razorpay-config', (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({ 
        success: false, 
        error: 'Razorpay configuration not found' 
      });
    }

    res.json({ 
      success: true, 
      keyId: process.env.RAZORPAY_KEY_ID 
    });
  } catch (error) {
    console.error('Razorpay config error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payment configuration' 
    });
  }
});

/**
 * OpenRouteService Geocoding Proxy
 * Proxies geocoding requests to prevent API key exposure
 */
router.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ 
        success: false, 
        error: 'Address parameter is required' 
      });
    }

    if (!process.env.ORS_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Geocoding service not configured' 
      });
    }

    const cacheKey = `geocode:proxy:v1:${cacheService.stableHash({ address: normalizeAddress(address) })}`;
    const cached = await cacheService.remember(cacheKey, GEOCODE_CACHE_TTL_SECONDS, async () => {
      const response = await axios.get(
        `https://api.openrouteservice.org/geocode/search`,
        {
          params: {
            api_key: process.env.ORS_API_KEY,
            text: address
          }
        }
      );
      return response.data;
    });
    cacheService.setCacheHeader(res, cached.hit);
    const geocodeData = cached.value;

    // Return the geocoding results
    if (geocodeData.features && geocodeData.features.length > 0) {
      const coordinates = geocodeData.features[0].geometry.coordinates;
      res.json({ 
        success: true, 
        data: {
          latitude: coordinates[1],
          longitude: coordinates[0],
          fullResponse: geocodeData
        }
      });
    } else {
      res.json({ 
        success: false, 
        error: 'No results found for the given address' 
      });
    }
  } catch (error) {
    console.error('Geocoding error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Geocoding request failed',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * OpenRouteService Reverse Geocoding Proxy
 * Converts coordinates to address
 */
router.get('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false, 
        error: 'Latitude and longitude parameters are required' 
      });
    }

    if (!process.env.ORS_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Geocoding service not configured' 
      });
    }

    const cacheKey = `geocode:reverse:v1:${cacheService.stableHash({ lat, lon })}`;
    const cached = await cacheService.remember(cacheKey, GEOCODE_CACHE_TTL_SECONDS, async () => {
      const response = await axios.get(
        `https://api.openrouteservice.org/geocode/reverse`,
        {
          params: {
            api_key: process.env.ORS_API_KEY,
            'point.lon': lon,
            'point.lat': lat
          }
        }
      );
      return response.data;
    });
    cacheService.setCacheHeader(res, cached.hit);

    res.json({ 
      success: true, 
      data: cached.value 
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Reverse geocoding request failed',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * OpenRouteService Directions/Routing Proxy
 * For getting directions between two points
 */
router.post('/directions', async (req, res) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least two coordinate pairs are required' 
      });
    }

    if (!process.env.ORS_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Routing service not configured' 
      });
    }

    const cacheKey = `directions:driving-car:v1:${cacheService.stableHash({ coordinates })}`;
    const cached = await cacheService.remember(cacheKey, DIRECTIONS_CACHE_TTL_SECONDS, async () => {
      const response = await axios.post(
        `https://api.openrouteservice.org/v2/directions/driving-car`,
        {
          coordinates: coordinates
        },
        {
          headers: {
            'Authorization': process.env.ORS_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    });
    cacheService.setCacheHeader(res, cached.hit);

    res.json({ 
      success: true, 
      data: cached.value 
    });
  } catch (error) {
    console.error('Directions error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Directions request failed',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

export default router;
