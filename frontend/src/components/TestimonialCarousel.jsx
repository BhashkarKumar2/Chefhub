
import React, { useState, useEffect } from 'react';
import { useThemeAwareStyle } from '../utils/themeUtils';

const testimonials = [
	{
		name: "Priya S.",
		role: "Mumbai",
		quote: "ChefHub made our anniversary dinner unforgettable. The chef was professional, the food was exquisite, and the experience felt truly special. Highly recommended!",
		rating: 5,
		image: "https://randomuser.me/api/portraits/women/44.jpg"
	},
	{
		name: "Rahul M.",
		role: "Delhi",
		quote: "Booking a chef for my parents' anniversary was seamless. The personalized menu and attention to detail were outstanding. ChefHub exceeded our expectations!",
		rating: 5,
		image: "https://randomuser.me/api/portraits/men/32.jpg"
	},
	{
		name: "Anjali K.",
		role: "Bengaluru",
		quote: "The chef was friendly, professional, and the food was delicious. ChefHub made our family celebration stress-free and memorable. Will book again!",
		rating: 5,
		image: "https://randomuser.me/api/portraits/women/68.jpg"
	},
	{
		name: "Vikram S.",
		role: "Hyderabad",
		quote: "Five stars for the quality and service! The chef accommodated all our requests and the food was top-notch.",
		rating: 5,
		image: "https://randomuser.me/api/portraits/men/45.jpg"
	},
	{
		name: "Neha P.",
		role: "Pune",
		quote: "Affordable and amazing. Will book again soon! The chef was courteous and the menu was creative.",
		rating: 5,
		image: "https://randomuser.me/api/portraits/women/65.jpg"
	},
	{
		name: "Kiran D.",
		role: "Chennai",
		quote: "The chef was punctual and courteous. Great experience overall! Highly recommended for special occasions.",
		rating: 5,
		image: "https://randomuser.me/api/portraits/men/36.jpg"
	},
];

const renderStars = (rating) => (
	<div className="flex justify-center gap-1 mb-2">
		{Array.from({ length: 5 }, (_, i) => (
			<svg key={i} width="20" height="20" fill={i < rating ? '#f59e0b' : '#ffe0b2'} viewBox="0 0 20 20">
				<polygon points="10,1 12.59,7.36 19.51,7.36 13.96,11.64 16.55,18 10,13.72 3.45,18 6.04,11.64 0.49,7.36 7.41,7.36"/>
			</svg>
		))}
	</div>
);

const TestimonialCarousel = () => {
	const { theme, classes, isDark, getClass } = useThemeAwareStyle();
	const [currentSlide, setCurrentSlide] = useState(0);

	// Auto-advance the carousel
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % testimonials.length);
		}, 4000);
		return () => clearInterval(interval);
	}, []);

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % testimonials.length);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
	};

	const goToSlide = (index) => {
		setCurrentSlide(index);
	};

	return (
		<div className="max-w-4xl mx-auto px-6 py-12">
			{/* Carousel Container */}
			<div className={`relative ${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800' : 'bg-gradient-to-br from-orange-50 via-amber-100 to-orange-100'} rounded-3xl p-8 shadow-xl`}>
				{/* Navigation Arrows */}
				<button
					onClick={prevSlide}
					className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-10 text-white`}
				>
					<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				
				<button
					onClick={nextSlide}
					className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-10 text-white`}
				>
					<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
					</svg>
				</button>

				{/* Testimonial Card */}
				<div className="mx-auto max-w-2xl">
					<div className={`${isDark ? 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-orange-100 via-amber-200 to-orange-50 border-amber-200'} rounded-2xl p-8 text-center border shadow-lg min-h-[400px] flex flex-col justify-center`}>
						{/* Client Image */}
						<div className={`w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 ${isDark ? 'border-orange-500' : 'border-orange-300'} shadow-lg`}>
							<img 
								src={testimonials[currentSlide].image} 
								alt={testimonials[currentSlide].name} 
								className="w-full h-full object-cover"
								onError={(e) => {
									e.target.src = `https://ui-avatars.com/api/?name=${testimonials[currentSlide].name}&background=f59e0b&color=fff&size=96`;
								}}
							/>
						</div>

						{/* Quote */}
						<blockquote className={`text-lg ${isDark ? 'text-gray-100' : 'text-orange-900'} font-medium mb-6 italic leading-relaxed`}>
							"{testimonials[currentSlide].quote}"
						</blockquote>

						{/* Rating Stars */}
						{renderStars(testimonials[currentSlide].rating)}

						{/* Client Info */}
						<div className="mt-4">
							<h4 className={`${isDark ? 'text-orange-400' : 'text-amber-700'} font-bold text-xl`}>{testimonials[currentSlide].name}</h4>
							<p className={`${isDark ? 'text-orange-300' : 'text-orange-600'} font-medium`}>{testimonials[currentSlide].role}</p>
						</div>
					</div>
				</div>

				{/* Dots Indicator */}
				<div className="flex justify-center mt-8 space-x-2">
					{testimonials.map((_, index) => (
						<button
							key={index}
							onClick={() => goToSlide(index)}
							className={`w-3 h-3 rounded-full transition-all duration-300 ${
								index === currentSlide 
									? `${isDark ? 'bg-orange-500' : 'bg-orange-500'} w-8` 
									: `${isDark ? 'bg-gray-500 hover:bg-gray-400' : 'bg-orange-200 hover:bg-orange-300'}`
							}`}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default TestimonialCarousel;
