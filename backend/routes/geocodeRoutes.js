import express from 'express';
import axios from 'axios';
import cacheService from '../services/cacheService.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { geocodeLimiter } from '../middleware/rateLimiters.js';
const router = express.Router();

const GEOCODE_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;

const normalizeAddress = (address) => address.trim().toLowerCase().replace(/\s+/g, ' ');

// POST /api/geocode
// Only used by the (logged-in) chef onboarding flow
router.post('/', verifyToken, geocodeLimiter, async (req, res) => {
  // console.log('Received geocode request:', req.body);
  
  const { address } = req.body;
  if (!address || typeof address !== 'string' || address.length > 200) {
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

// POST /api/geocode/reverse
// Turn browser geolocation coords (lat/lon) into a human address (city/state/label)
router.post('/reverse', verifyToken, geocodeLimiter, async (req, res) => {
  const { lat, lon } = req.body;

  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (
    lat === undefined || lon === undefined ||
    Number.isNaN(latNum) || Number.isNaN(lonNum) ||
    latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180
  ) {
    return res.status(400).json({ error: 'Valid lat and lon are required' });
  }

  const ORS_API_KEY = process.env.ORS_API_KEY;
  if (!ORS_API_KEY) {
    return res.status(500).json({ error: 'Geocoding service not configured' });
  }

  try {
    // Round coords so nearby lookups share a cache entry (~11m precision at 4dp)
    const cacheKey = `geocode:reverse:v1:${latNum.toFixed(4)},${lonNum.toFixed(4)}`;
    const cached = await cacheService.remember(cacheKey, GEOCODE_CACHE_TTL_SECONDS, async () => {
      const reverseUrl = `https://api.openrouteservice.org/geocode/reverse?api_key=${ORS_API_KEY}&point.lat=${latNum}&point.lon=${lonNum}&size=1`;
      const orsRes = await axios.get(reverseUrl);
      return orsRes.data;
    });
    cacheService.setCacheHeader(res, cached.hit);

    const feature = cached.value?.features?.[0];
    const props = feature?.properties || {};
    res.json({
      city: props.locality || props.county || props.region || '',
      state: props.region || '',
      country: props.country || '',
      label: props.label || '',
      lat: latNum,
      lon: lonNum
    });
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({
        error: 'Failed to reverse geocode',
        details: `OpenRouteService returned ${err.response.status}`
      });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;
