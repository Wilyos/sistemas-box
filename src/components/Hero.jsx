import { useState, useEffect } from 'react';

const desktopBanners = [
  '/banners/banner1.jpeg',
  '/banners/banner2.png',
  '/banners/banner3.jpeg'
];

const mobileBanners = [
  '/banners/movil1.jpeg',
  '/banners/movil2.jpeg',
  '/banners/movil3.jpeg'
];

export default function Hero() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const banners = isMobile ? mobileBanners : desktopBanners;

  // Reiniciar el banner actual si el índice está fuera de rango cuando cambien los banners
  useEffect(() => {
    if (currentBanner >= banners.length) {
      setCurrentBanner(0);
    }
  }, [banners, currentBanner]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, [banners.length]);

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
