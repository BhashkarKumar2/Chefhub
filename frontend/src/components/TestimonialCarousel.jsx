// // import React from 'react';

// // const testimonials = [
// //   {
// //     name: "Amit",
// //     quote: "Fantastic service! The chef was professional and the food was amazing.",
// //   },
// //   {
// //     name: "Sneha",
// //     quote: "The booking process was smooth and the dinner party was unforgettable.",
// //   },
// //   {
// //     name: "Ravi",
// //     quote: "I highly recommend this service for anyone who wants a luxury food experience at home.",
// //   },
// //   {
// //     name: "Amit",
// //     quote: "Fantastic service! The chef was professional and the food was amazing.",
// //   },
// //   {
// //     name: "Sneha",
// //     quote: "The booking process was smooth and the dinner party was unforgettable.",
// //   },
// //   {
// //     name: "Ravi",
// //     quote: "I highly recommend this service for anyone who wants a luxury food experience at home.",
// //   },
// // ];

// // const TestimonialCarousel = () => {
// //   return (
// //     <div className="max-w-4xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-3 px-6">
// //       {testimonials.map((testimonial, index) => (
// //         <div key={index} className="bg-white p-6 rounded-lg shadow-md">
// //           <p className="text-gray-700 italic">"{testimonial.quote}"</p>
// //           <p className="mt-4 text-sm font-semibold text-indigo-600">- {testimonial.name}</p>
// //         </div>
// //       ))}
// //     </div>
// //   );
// // };

// // export default TestimonialCarousel;

// // src/components/TestimonialCarousel.jsx
// import React from 'react';
// import Slider from 'react-slick';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

// const testimonials = [
//   {
//     name: "Amit",
//     quote: "Fantastic service! The chef was professional and the food was amazing.",
//   },
//   {
//     name: "Sneha",
//     quote: "The booking process was smooth and the dinner party was unforgettable.",
//   },
//   {
//     name: "Ravi",
//     quote: "I highly recommend this service for anyone who wants a luxury food experience at home.",
//   },
//   {
//     name: "Kiran",
//     quote: "The chef was punctual and courteous. Great experience overall!",
//   },
//   {
//     name: "Neha",
//     quote: "Affordable and amazing. Will book again soon!",
//   },
//   {
//     name: "Vikram",
//     quote: "Five stars for the quality and service!",
//   },
// ];

// const settings = {
//   dots: true,
//   infinite: true,
//   speed: 500,
//   slidesToShow: 2,
//   slidesToScroll: 1,
//   autoplay: true,
//   autoplaySpeed: 4000,
//   responsive: [
//     {
//       breakpoint: 768,
//       settings: {
//         slidesToShow: 1,
//       }
//     }
//   ]
// };

// const TestimonialCarousel = () => {
//   return (
//     <div className="max-w-6xl mx-auto px-6 py-12">
      
//       <Slider {...settings}>
//         {testimonials.map((testimonial, index) => (
//           <div key={index} className="p-4">
//             <div className="bg-white p-6 rounded-lg shadow-md h-full">
//               <p className="text-gray-700 italic">"{testimonial.quote}"</p>
//               <p className="mt-4 text-sm font-semibold text-indigo-600">- {testimonial.name}</p>
//             </div>
//           </div>
//         ))}
//       </Slider>
//     </div>
//   );
// };

// export default TestimonialCarousel;
