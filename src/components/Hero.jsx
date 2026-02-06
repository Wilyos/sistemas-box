import { useState, useEffect } from 'react';

const banners = [
  '/banners/banner1.jpeg',
  '/banners/banner2.png',
  '/banners/banner3.jpeg'
];

export default function Hero() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToBanner = (index) => {
    setCurrentBanner(index);
  };

  return (
    <section className="hero">
      <div className="hero-carousel">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentBanner ? 'active' : ''}`}
            style={{ backgroundImage: `url(${banner})` }}
          />
        ))}
        
        <button className="carousel-btn prev" onClick={prevBanner} aria-label="Banner anterior">
          ‹
        </button>
        <button className="carousel-btn next" onClick={nextBanner} aria-label="Siguiente banner">
          ›
        </button>

        <div className="carousel-dots">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentBanner ? 'active' : ''}`}
              onClick={() => goToBanner(index)}
              aria-label={`Ir a banner ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="hero-overlay"></div>
      
      <div className="hero-content">
        <div className="hero-left">
          <h1></h1>
          <p></p>
          <a href="#productos" className="btn">
            EMPIEZA AQUÍ
          </a>
        </div>
      </div>
    </section>
  );
}
