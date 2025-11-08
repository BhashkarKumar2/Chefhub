/**
 * Image optimization utilities
 * Compress and resize images before upload
 */

/**
 * Compress and resize an image file
 * @param {File} file - The image file to optimize
 * @param {Object} options - Optimization options
 * @returns {Promise<Blob>} Optimized image blob
 */
export const optimizeImage = (file, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    outputFormat = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          
          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Draw the image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            outputFormat,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Convert blob to File object
 * @param {Blob} blob - The blob to convert
 * @param {string} fileName - The file name
 * @returns {File} File object
 */
export const blobToFile = (blob, fileName) => {
  return new File([blob], fileName, { 
    type: blob.type,
    lastModified: Date.now()
  });
};

/**
 * Get image dimensions without loading the full image
 * @param {File} file - The image file
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export const validateImage = async (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    minWidth = 100,
    minHeight = 100,
    maxWidth = 4000,
    maxHeight = 4000
  } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(1)}MB`
    };
  }

  // Check dimensions
  try {
    const dimensions = await getImageDimensions(file);
    
    if (dimensions.width < minWidth || dimensions.height < minHeight) {
      return {
        valid: false,
        error: `Image dimensions too small. Minimum: ${minWidth}x${minHeight}px`
      };
    }
    
    if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
      return {
        valid: false,
        error: `Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}px`
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate image dimensions'
    };
  }
};

/**
 * Complete image upload workflow with optimization
 * @param {File} file - The image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<File>} Optimized file ready for upload
 */
export const prepareImageForUpload = async (file, options = {}) => {
  // Validate first
  const validation = await validateImage(file, options);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Optimize
  const optimizedBlob = await optimizeImage(file, options);
  
  // Convert back to File
  const optimizedFile = blobToFile(
    optimizedBlob,
    file.name.replace(/\.[^/.]+$/, '.jpg') // Force .jpg extension
  );

  return optimizedFile;
};

export default {
  optimizeImage,
  blobToFile,
  getImageDimensions,
  validateImage,
  prepareImageForUpload
};
