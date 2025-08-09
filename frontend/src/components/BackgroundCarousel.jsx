import React, { useEffect, useState } from 'react';

const images = [
  "https://images.unsplash.com/photo-1654922207993-2952fec328ae?w=1920&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1641536618422-2cf0bbd10014?w=1920&auto=format&fit=crop&q=80",
  "https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?w=1920&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&auto=format&fit=crop&q=80"
];

const BackgroundCarousel = ({ children }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="background-carousel" style={{ backgroundImage: `url(${images[index]})` }}>
      <div className="background-overlay"></div>
      <div className="background-content">{children}</div>
    </div>
  );
};

export default BackgroundCarousel;
