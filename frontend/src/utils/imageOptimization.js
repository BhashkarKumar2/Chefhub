/**
 * Image optimization utilities for better performance
 */

/**
 * Generate optimized Cloudinary URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} Optimized URL
 */
export const optimizeCloudinaryImage = (url, options = {}) => {
  if (!url || !url.includes('cloudinary')) return url;
  
  const {
    width = 'auto',
    quality = 'auto',
    format = 'auto',
    crop = 'scale',
  } = options;
  
  // Insert transformations into Cloudinary URL
  const transformations = `w_${width},q_${quality},f_${format},c_${crop}`;
  return url.replace('/upload/', `/upload/${transformations}/`);
};

/**
 * Lazy load images with intersection observer
 * @param {HTMLImageElement} img - Image element
 */
export const lazyLoadImage = (img) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lazyImage = entry.target;
        lazyImage.src = lazyImage.dataset.src;
        lazyImage.classList.remove('lazy');
        observer.unobserve(lazyImage);
      }
    });
  });
  
  observer.observe(img);
};

/**
 * Preload critical images
 * @param {string[]} urls - Array of image URLs
 */
export const preloadImages = (urls) => {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Get responsive image sources
 * @param {string} baseUrl - Base image URL
 * @returns {object} srcSet and sizes
 */
export const getResponsiveImageProps = (baseUrl) => {
  if (!baseUrl || !baseUrl.includes('cloudinary')) {
    return { src: baseUrl };
  }
  
  return {
    src: optimizeCloudinaryImage(baseUrl, { width: 800 }),
    srcSet: `
      ${optimizeCloudinaryImage(baseUrl, { width: 400 })} 400w,
      ${optimizeCloudinaryImage(baseUrl, { width: 800 })} 800w,
      ${optimizeCloudinaryImage(baseUrl, { width: 1200 })} 1200w
    `,
    sizes: '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px',
  };
};
