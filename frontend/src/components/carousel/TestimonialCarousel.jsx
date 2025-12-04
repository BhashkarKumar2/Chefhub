import React, { useState, useEffect } from 'react';
import { useThemeAwareStyle } from '../../utils/themeUtils';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TestimonialCarousel = () => {
    const { isDark } = useThemeAwareStyle();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/testimonials`);
                setTestimonials(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Error fetching testimonials:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    useEffect(() => {
        if (testimonials.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className={`${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800' : 'bg-gradient-to-br from-orange-50 via-amber-100 to-orange-100'} rounded-3xl p-8 shadow-xl min-h-[400px] flex items-center justify-center`}>
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (testimonials.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className={`${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800' : 'bg-gradient-to-br from-orange-50 via-amber-100 to-orange-100'} rounded-3xl p-8 shadow-xl min-h-[400px] flex items-center justify-center`}>
                    <p className={`${isDark ? 'text-gray-300' : 'text-orange-700'} text-lg`}>No testimonials yet.</p>
                </div>
            </div>
        );
    }

    const current = testimonials[currentSlide];

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className={`relative ${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800' : 'bg-gradient-to-br from-orange-50 via-amber-100 to-orange-100'} rounded-3xl p-8 shadow-xl`}>
                {/* Navigation */}
                <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 rounded-full p-3 shadow-lg transition-all z-10 text-white"
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % testimonials.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 rounded-full p-3 shadow-lg transition-all z-10 text-white"
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Content */}
                <div className="max-w-2xl mx-auto">
                    <div className={`${isDark ? 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700' : 'bg-gradient-to-br from-orange-100 via-amber-200 to-orange-50'} rounded-2xl p-8 text-center border ${isDark ? 'border-gray-600' : 'border-amber-200'} shadow-lg min-h-[400px] flex flex-col justify-center`}>
                        <img 
                            src={current.userProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(current.userName)}&background=f59e0b&color=fff&size=96`} 
                            alt={current.userName}
                            className={`w-24 h-24 mx-auto mb-6 rounded-full border-4 ${isDark ? 'border-orange-500' : 'border-orange-300'} shadow-lg object-cover`}
                            onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(current.userName)}&background=f59e0b&color=fff&size=96`}
                        />

                        <blockquote className={`text-lg ${isDark ? 'text-gray-100' : 'text-orange-900'} font-medium mb-6 italic`}>
                            "{current.testimonial}"
                        </blockquote>

                        <div className="flex justify-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} width="20" height="20" fill={i < current.rating ? '#f59e0b' : '#ffe0b2'} viewBox="0 0 20 20">
                                    <polygon points="10,1 12.59,7.36 19.51,7.36 13.96,11.64 16.55,18 10,13.72 3.45,18 6.04,11.64 0.49,7.36 7.41,7.36"/>
                                </svg>
                            ))}
                        </div>

                        <h4 className={`${isDark ? 'text-orange-400' : 'text-amber-700'} font-bold text-xl`}>{current.userName}</h4>
                        <p className={`${isDark ? 'text-orange-300' : 'text-orange-600'} font-medium`}>{current.userLocation}</p>
                    </div>
                </div>

                {/* Dots */}
                <div className="flex justify-center mt-8 space-x-2">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-3 rounded-full transition-all ${index === currentSlide ? 'bg-orange-500 w-8' : 'bg-orange-200 hover:bg-orange-300 w-3'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestimonialCarousel;