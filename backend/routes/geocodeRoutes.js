
import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

// POST /api/geocode
router.post('/', async (req, res) => {
  console.log('Received geocode request:', req.body);
  
  const { address } = req.body;
  if (!address) {
    console.log('❌ No address provided');
    return res.status(400).json({ error: 'Address is required' });
  }
  
  const ORS_API_KEY = process.env.ORS_API_KEY;
  console.log('🔑 ORS_API_KEY from env:', ORS_API_KEY ? 'Key found' : 'Key missing');
  
  if (!ORS_API_KEY) {
    console.log('❌ ORS_API_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Geocoding service not configured' });
  }
  
  const geocodeUrl = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`;
  console.log('🌐 Making request to OpenRouteService for address:', address);
  
  try {
    const orsRes = await fetch(geocodeUrl);
    console.log('📡 OpenRouteService response status:', orsRes.status);
    
    if (!orsRes.ok) {
      const errorText = await orsRes.text();
      console.log('❌ OpenRouteService error response:', errorText);
      return res.status(orsRes.status).json({ 
        error: 'Failed to fetch geocode data', 
        details: `OpenRouteService returned ${orsRes.status}`,
        response: errorText 
      });
    }
    
    const data = await orsRes.json();
    console.log('✅ Geocoding successful, found', data.features?.length || 0, 'results');
    res.json(data);
  } catch (err) {
    console.log('❌ Server error during geocoding:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;
