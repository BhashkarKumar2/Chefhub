import Chef from '../models/Chef.js';
import cloudinary from '../config/cloudinary.js';

export const createChefProfile = async (req, res) => {
  // console.log('\nðŸ”¥ === CHEF PROFILE CREATION STARTED ===');
  // console.log('ðŸ“ Request Body:', JSON.stringify(req.body, null, 2));
  // console.log('ðŸ“Ž File uploaded:', req.file ? `Yes (${req.file.originalname}, ${req.file.size} bytes)` : 'No');
  
  try {
    // Validate required fields
    const requiredFields = ['name', 'email', 'specialty', 'bio', 'pricePerHour', 'experienceYears'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      // console.log('âŒ Validation Error - Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'Missing required fields',
        missingFields: missingFields,
        error: `Please provide: ${missingFields.join(', ')}`
      });
    }

    // Check if email already exists
    // console.log('ðŸ” Checking if email already exists:', req.body.email);
    const existingChef = await Chef.findOne({ email: req.body.email });
    if (existingChef) {
      // console.log('âŒ Email already exists in database');
      return res.status(409).json({ 
        message: 'Email already exists',
        error: `A chef profile with email "${req.body.email}" already exists. Please use a different email address.`,
        suggestion: 'Try using a different email or contact support to update your existing profile.'
      });
    }
    // console.log('âœ… Email is unique, proceeding...');

    // Parse serviceableLocations (accept array or comma-separated string)
    let serviceableLocations = req.body.serviceableLocations;
    // console.log('ðŸ—ºï¸ Raw serviceableLocations from req.body:', serviceableLocations);
    if (typeof serviceableLocations === 'string') {
      serviceableLocations = serviceableLocations.split(',').map(loc => loc.trim()).filter(Boolean);
    }
    if (Array.isArray(serviceableLocations)) {
      // console.log('ðŸ—ºï¸ Parsed serviceableLocations array:', serviceableLocations);
    } else {
      // console.log('ðŸ—ºï¸ serviceableLocations is not an array after parsing:', serviceableLocations);
    }

    const chefData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      specialty: req.body.specialty,
      address: req.body.address, // Complete address for geocoding
      city: req.body.city, // City for filtering and disambiguation
      state: req.body.state, // State for filtering and disambiguation
      bio: req.body.bio,
      pricePerHour: req.body.pricePerHour,
      experienceYears: req.body.experienceYears,
      certifications: req.body.certifications,
      availability: req.body.availability,
      serviceableLocations: serviceableLocations || [],
      locationCoords: req.body.locationCoords ? {
        lat: parseFloat(req.body.locationCoords.lat),
        lon: parseFloat(req.body.locationCoords.lon)
      } : undefined
    };
    // console.log('ðŸ“¦ Final chefData to be saved:', JSON.stringify(chefData, null, 2));

    // console.log('ðŸ“Š Chef data prepared:', JSON.stringify(chefData, null, 2));

    // If image was uploaded, upload to Cloudinary
    if (req.file) {
      // console.log('ðŸ–¼ï¸ Processing image upload...');
      try {
        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        
        // console.log('â˜ï¸ Uploading to Cloudinary...');
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'chef-profiles',
          transformation: [
            { width: 500, height: 500, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
          public_id: `chef-${Date.now()}-${Math.round(Math.random() * 1E9)}`
        });

        // console.log('âœ… Cloudinary upload successful:', uploadResult.secure_url);
        chefData.profileImage = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        };
      } catch (uploadError) {
        // console.error('âŒ Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          message: 'Failed to upload image',
          error: uploadError.message,
          suggestion: 'Please try uploading a smaller image (less than 5MB) or try again later.'
        });
      }
    } else {
      // console.log('ðŸ“· No image uploaded, continuing without profile image');
    }

    // console.log('ðŸ’¾ Creating chef profile in database...');
    const newChef = new Chef(chefData);
    await newChef.save();
    
    // console.log('âœ… Chef profile created successfully!');
    // console.log('ðŸ‘¨â€ðŸ³ Chef ID:', newChef._id);
    // console.log('ðŸ“§ Chef Email:', newChef.email);
    // console.log('ðŸ”¥ === CHEF PROFILE CREATION COMPLETED ===\n');
    
    res.status(201).json({
      message: 'Chef profile created successfully',
      chef: newChef,
      success: true
    });
  } catch (err) {
    // console.error('\nâŒ === CHEF PROFILE CREATION FAILED ===');
    // console.error('ðŸš¨ Error type:', err.name);
    // console.error('ðŸ“„ Error message:', err.message);
    // console.error('ðŸ” Error code:', err.code);
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      // console.error('ðŸ’¥ Duplicate key error - Email already exists');
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      // console.error(`ðŸ”‘ Duplicate field: ${field} = ${value}`);
      
      return res.status(409).json({ 
        message: 'Email already exists',
        error: `A chef profile with ${field} "${value}" already exists. Please use a different ${field}.`,
        suggestion: 'Try using a different email address or contact support.',
        field: field,
        value: value
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      // console.error('ðŸ“ Validation error details:', err.errors);
      const validationErrors = Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      }));
      
      return res.status(400).json({ 
        message: 'Validation failed',
        error: 'Please check the required fields and try again.',
        validationErrors: validationErrors
      });
    }
    
    // console.error('ðŸ“Š Full error stack:', err.stack);
    // console.error('ðŸ”¥ === ERROR HANDLING COMPLETED ===\n');
    
    res.status(500).json({ 
      message: 'Failed to create chef profile',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      suggestion: 'Please try again or contact support if the problem persists.'
    });
  }
};

export const getAllChefs = async (req, res) => {
  try {
    const chefs = await Chef.find({ isActive: true }).sort({ createdAt: -1 });
    
    // console.log('âœ… Chefs retrieved successfully:', chefs.length);
    res.status(200).json({ 
      message: 'Chefs retrieved successfully',
      chefs: chefs,
      success: true
    });
  } catch (err) {
    // console.error('âŒ Error retrieving chefs:', err);
    res.status(500).json({ 
      message: 'Failed to retrieve chefs',
      error: err.message,
      success: false
    });
  }
};

// Advanced search functionality
export const searchChefs = async (req, res) => {
  try {
    const {
      q,           // Query text
      cuisine,     // Comma-separated cuisine types
      minPrice,    // Minimum price per hour
      maxPrice,    // Maximum price per hour
      minRating,   // Minimum rating
      location,    // Location filter (for distance)
      city,        // City filter
      state,       // State filter
      minExp,      // Minimum experience
      maxExp,      // Maximum experience
      page = 1,    // Pagination
      limit = 12   // Results per page
    } = req.query;

    // Build search query
    let searchQuery = { isActive: true };

    // Text search (name, specialty, bio)
    if (q) {
      searchQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { specialty: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ];
    }

    // Cuisine filter
    if (cuisine) {
      const cuisineArray = cuisine.split(',').map(c => c.trim());
      searchQuery.specialty = { $in: cuisineArray.map(c => new RegExp(c, 'i')) };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      searchQuery.pricePerHour = {};
      if (minPrice) searchQuery.pricePerHour.$gte = parseInt(minPrice);
      if (maxPrice) searchQuery.pricePerHour.$lte = parseInt(maxPrice);
    }

    // Rating filter
    if (minRating) {
      searchQuery.rating = { $gte: parseFloat(minRating) };
    }

    // Experience filter
    if (minExp || maxExp) {
      searchQuery.experienceYears = {};
      if (minExp) searchQuery.experienceYears.$gte = parseInt(minExp);
      if (maxExp) searchQuery.experienceYears.$lte = parseInt(maxExp);
    }

    // Location filters
    if (city) {
      searchQuery.city = { $regex: city, $options: 'i' };
    }

    if (state) {
      searchQuery.state = { $regex: state, $options: 'i' };
    }

    // Location filter (now uses serviceableLocations array for broader area coverage)
    if (location) {
      searchQuery.$or = [
        ...(searchQuery.$or || []),
        { serviceableLocations: { $regex: location, $options: 'i' } },
        { address: { $regex: location, $options: 'i' } }
      ];
    }

    // console.log('ðŸ” Search query:', JSON.stringify(searchQuery, null, 2));

    // Execute search with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [chefs, totalCount] = await Promise.all([
      Chef.find(searchQuery)
        .sort({ rating: -1, reviewsCount: -1 }) // Sort by rating and review count
        .skip(skip)
        .limit(parseInt(limit)),
      Chef.countDocuments(searchQuery)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // console.log(`âœ… Search completed: ${chefs.length} results found`);

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      chefs: chefs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalResults: totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    // console.error('âŒ Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

export const getChefById = async (req, res) => {
  try {
    const chef = await Chef.findById(req.params.id);
    if (!chef) {
      return res.status(404).json({ message: 'Chef not found' });
    }
    res.json(chef);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateChefProfile = async (req, res) => {
  try {
    const chefId = req.params.id;
    // Parse serviceableLocations for update (accept array or comma-separated string)
    let updateData = { ...req.body };
    if (updateData.serviceableLocations && typeof updateData.serviceableLocations === 'string') {
      updateData.serviceableLocations = updateData.serviceableLocations.split(',').map(loc => loc.trim()).filter(Boolean);
    }

    // Handle location coordinates update
    if (updateData.locationCoords) {
      updateData.locationCoords = {
        lat: parseFloat(updateData.locationCoords.lat),
        lon: parseFloat(updateData.locationCoords.lon)
      };
    }

    // Get current chef data to check for existing image
    const currentChef = await Chef.findById(chefId);
    if (!currentChef) {
      return res.status(404).json({ message: 'Chef not found' });
    }

    // If new image was uploaded, upload to Cloudinary and delete old image
    if (req.file) {
      try {
        // Delete old image from Cloudinary if it exists
        if (currentChef.profileImage && currentChef.profileImage.publicId) {
          try {
            await cloudinary.uploader.destroy(currentChef.profileImage.publicId);
            // console.log('Old image deleted from Cloudinary');
          } catch (error) {
            // console.error('Error deleting old image:', error);
          }
        }

        // Convert buffer to base64 and upload new image
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'chef-profiles',
          transformation: [
            { width: 500, height: 500, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
          public_id: `chef-${Date.now()}-${Math.round(Math.random() * 1E9)}`
        });

        updateData.profileImage = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        };
      } catch (uploadError) {
        // console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          message: 'Failed to upload image',
          error: uploadError.message 
        });
      }
    }

    const updatedChef = await Chef.findByIdAndUpdate(
      chefId, 
      updateData, 
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Chef profile updated successfully',
      chef: updatedChef
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteChef = async (req, res) => {
  try {
    const chef = await Chef.findById(req.params.id);
    
    if (!chef) {
      return res.status(404).json({ message: 'Chef not found' });
    }

    // Delete image from Cloudinary if it exists
    if (chef.profileImage && chef.profileImage.publicId) {
      try {
        await cloudinary.uploader.destroy(chef.profileImage.publicId);
        // console.log('Chef image deleted from Cloudinary');
      } catch (error) {
        // console.error('Error deleting chef image:', error);
      }
    }

    // Soft delete (set isActive to false) or hard delete
    const updatedChef = await Chef.findByIdAndUpdate(
      req.params.id, 
      { isActive: false }, 
      { new: true }
    );

    res.json({ message: 'Chef profile deactivated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
