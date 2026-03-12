export default function Hero() {
  return (
    <section className="hero">
      <video 
        className="hero-video" 
        src="/Services1.mp4" 
        autoPlay 
        muted 
        loop 
        playsInline 
      />

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
