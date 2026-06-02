import express from 'express';
import axios from 'axios';
import cacheService from '../services/cacheService.js';
const router = express.Router();

const GEOCODE_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;

const normalizeAddress = (address) => address.trim().toLowerCase().replace(/\s+/g, ' ');

// POST /api/geocode
router.post('/', async (req, res) => {
  // console.log('Received geocode request:', req.body);
  
  const { address } = req.body;
  if (!address) {
    // console.log('âŒ No address provided');
    return res.status(400).json({ error: 'Address is required' });
  }
  
  const ORS_API_KEY = process.env.ORS_API_KEY;
  // console.log('ðŸ”‘ ORS_API_KEY from env:', ORS_API_KEY ? 'Key found' : 'Key missing');
  
  if (!ORS_API_KEY) {
    // console.log('âŒ ORS_API_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Geocoding service not configured' });
  }
  
  // console.log('ðŸŒ Making request to OpenRouteService for address:', address);
  
  try {
    const cacheKey = `geocode:post:v1:${cacheService.stableHash({ address: normalizeAddress(address) })}`;
    const cached = await cacheService.remember(cacheKey, GEOCODE_CACHE_TTL_SECONDS, async () => {
      const geocodeUrl = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`;
      const orsRes = await axios.get(geocodeUrl);
      // console.log('ðŸ“¡ OpenRouteService response status:', orsRes.status);
      return orsRes.data;
    });
    cacheService.setCacheHeader(res, cached.hit);
    const data = cached.value;
    // console.log('âœ… Geocoding successful, found', data.features?.length || 0, 'results');
    res.json(data);
  } catch (err) {
    // console.log('âŒ Server error during geocoding:', err.message);
    if (err.response) {
        return res.status(err.response.status).json({ 
            error: 'Failed to fetch geocode data', 
            details: `OpenRouteService returned ${err.response.status}`,
            response: err.response.data 
        });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;
