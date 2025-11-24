import React, { useState, useEffect } from 'react';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Business Executive", 
    quote: "Exceptional service! Chef Marcus created an unforgettable anniversary dinner. The attention to detail and flavor combinations were absolutely perfect.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
  },
  {
    name: "Michael Chen",
    role: "Event Planner",
    quote: "I've used Cooks for multiple client events. The professionalism and culinary excellence never cease to amaze. Highly recommended!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    name: "Emily Rodriguez", 
    role: "Food Enthusiast",
    quote: "The booking process was seamless and our chef was incredible. Every dish was restaurant-quality. This service has spoiled us!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  },
  {
    name: "David Thompson",
    role: "Corporate Manager",
    quote: "Perfect for our team dinner. The chef accommodated all dietary restrictions and delivered an amazing experience for everyone.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  },
  {
    name: "Lisa Park",
    role: "Home Chef",
    quote: "As someone who loves cooking, I was impressed by the techniques and flavors. Learned so much just by watching our chef work!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face"
  },
  {
    name: "Robert Williams",
    role: "Retired Teacher",
    quote: "My wife and I celebrated our 40th anniversary with this service. It was magical - felt like dining at a 5-star restaurant at home.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face"
  }
];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance to trigger navigation
  const minSwipeDistance = 50;

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        className="text-yellow-400 drop-shadow-sm"
        style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}
      >
        {i < rating ? '★' : '☆'}
      </span>
    ));
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-8 md:px-8 md:py-12 overflow-hidden bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl backdrop-blur-sm">
      <div className="relative flex items-center w-full overflow-hidden rounded-xl bg-white/95 dark:bg-gray-900/70 backdrop-blur-2xl border border-white/20 dark:border-gray-800 shadow-2xl" style={{ minHeight: 'clamp(350px, 50vh, 500px)' }}>
        
        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          aria-label="Previous testimonial"
          className={`absolute top-1/2 -translate-y-1/2 -left-6 z-10 hidden md:flex items-center justify-center bg-white/90 dark:bg-gray-800/80 backdrop-blur-xl border-none rounded-full text-orange-500 dark:text-orange-300 font-bold shadow-lg transition-all duration-300 ease-out hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-600 hover:text-white hover:scale-110 hover:shadow-orange-500/40 hover:shadow-2xl ${
            hoveredButton === 'prev' ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white scale-110' : ''
          }`}
          style={{ width: 'clamp(48px, 5vw, 64px)', height: 'clamp(48px, 5vw, 64px)', fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}
          onMouseEnter={() => setHoveredButton('prev')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          ‹
        </button>

        {/* Testimonials Track */}
        <div
          className="flex w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} className="min-w-full flex-shrink-0 flex justify-center items-center" style={{ padding: 'clamp(1rem, 4vw, 4rem)' }}>
              <div className="w-full text-center flex flex-col" style={{ gap: 'clamp(1rem, 3vw, 3rem)', maxWidth: 'clamp(300px, 80vw, 800px)' }}>
                
                {/* Quote Icon */}
                <div className="text-orange-500 dark:text-orange-300 opacity-30 font-serif leading-none" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: 'clamp(0.5rem, 2vw, 1rem)' }}>
                  "
                </div>
                
                {/* Quote Text */}
                <p className="leading-relaxed text-gray-800 dark:text-gray-200 font-light tracking-tight break-words" style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.5rem)', padding: '0 clamp(0.5rem, 2vw, 0rem)' }}>
                  "{testimonial.quote}"
                </p>
                
                {/* Star Rating */}
                <div className="flex justify-center" style={{ gap: 'clamp(0.25rem, 1vw, 0.5rem)', marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
                  {renderStars(testimonial.rating)}
                </div>
                
                {/* Author Info */}
                <div className="flex flex-col md:flex-row items-center justify-center border-t border-gray-200/30 dark:border-gray-800" style={{ gap: 'clamp(1rem, 3vw, 1.5rem)', paddingTop: 'clamp(1rem, 3vw, 2rem)' }}>
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="rounded-full object-cover border-4 border-transparent bg-gradient-to-br from-orange-500 to-amber-600 p-1 shadow-lg shadow-orange-500/30 transition-transform duration-300 hover:scale-105"
                    style={{ width: 'clamp(3rem, 8vw, 5rem)', height: 'clamp(3rem, 8vw, 5rem)' }}
                  />
                  <div className="text-center md:text-left">
                    <h4 className="font-bold tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)' }}>
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 font-medium tracking-wide" style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={goToNext}
          aria-label="Next testimonial"
          className={`absolute top-1/2 -translate-y-1/2 -right-6 z-10 hidden md:flex items-center justify-center bg-white/90 dark:bg-gray-800/80 backdrop-blur-xl border-none rounded-full text-orange-500 dark:text-orange-300 font-bold shadow-lg transition-all duration-300 ease-out hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-600 hover:text-white hover:scale-110 hover:shadow-orange-500/40 hover:shadow-2xl ${
            hoveredButton === 'next' ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white scale-110' : ''
          }`}
          style={{ width: 'clamp(48px, 5vw, 64px)', height: 'clamp(48px, 5vw, 64px)', fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}
          onMouseEnter={() => setHoveredButton('next')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          ›
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center flex-wrap" style={{ gap: 'clamp(0.5rem, 2vw, 1rem)', marginTop: 'clamp(1.5rem, 4vw, 3rem)' }}>
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`rounded-full border-none cursor-pointer transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 ${
              index === currentIndex
                ? 'bg-white shadow-lg shadow-white/40 dark:bg-orange-400 dark:shadow-orange-400/30'
                : 'bg-white/40 hover:bg-white/60 hover:scale-110 dark:bg-white/20 dark:hover:bg-white/40'
            }`}
            style={{ 
              width: 'clamp(10px, 2vw, 16px)', 
              height: 'clamp(10px, 2vw, 16px)',
              transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)'
            }}
            onClick={() => goToSlide(index)}
            aria-label={`Go to testimonial ${index + 1}`}
            aria-current={index === currentIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;