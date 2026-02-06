import './ServiceSection.css';

export default function ServiceSection() {
  return (
    <section className="service-section">
      <div className="service-container">
        <div className="service-grid">
          <div className="service-left">
            <h2>Nuestro Servicio</h2>
            <p className="service-intro">
              En <strong>Sistemas litograficos</strong> transformamos tu empaque en herramientas de venta. Combinamos impresión de alta calidad con materiales responsables para que tu negocio destaque mientras cuidas el planeta.
            </p>
            
            <p className="service-description">
              Creamos <strong>cajas, bolsas y empaques personalizados</strong>, con impresión a una tinta o a todo color.
            </p>
            
            <p className="service-impact">
              No solo entregas <strong>un producto</strong>, entregas una experiencia profesional.
            </p>
            
            <h3 className="service-subtitle">Información importante</h3>
            
            <div className="service-info">
              <p><strong>Tiempo de entrega:</strong> 5 días hábiles (tras aprobar el diseño).</p>
              
              <p><strong>Facilidades de pago:</strong></p>
              <ul className="payment-list">
                <li><strong>Empieza hoy con el 50%</strong> y liquida el resto al momento del despacho.</li>
              </ul>
            </div>
          </div>

          <div className="service-video service-video-top">
            <video
              className="service-video-media"
              src="/Services1.mp4"
              controls
              playsInline
            />
          </div>

          <div className="service-video service-video-bottom">
            <video
              className="service-video-media"
              src="/services2.mp4"
              controls
              playsInline
            />
          </div>
          
          <div className="service-right">
            <h3>¿Por qué elegirnos?</h3>
            
            <ul className="benefits-list">
              <li>
                <span className="benefit-icon">●</span>
                <div>
                  <strong>Impacto Visual Inmediato:</strong> Deja de ser invisible y capta la atención de tus clientes desde el segundo uno.
                </div>
              </li>
              
              <li>
                <span className="benefit-icon">●</span>
                <div>
                  <strong>Confianza que Vende:</strong> Un buen empaque reduce la duda de compra y proyecta seguridad en tu marca.
                </div>
              </li>
              
              <li>
                <span className="benefit-icon">●</span>
                <div>
                  <strong>Tu Marca en la Mente:</strong> Haz que te recuerden mucho después de abrir el pedido; la publicidad que viaja con tu cliente.
                </div>
              </li>
              
              <li>
                <span className="benefit-icon">●</span>
                <div>
                  <strong>Sostenibilidad Real:</strong> Únete al cambio con materiales ecológicos que tus clientes valorarán.
                </div>
              </li>
              
              <li>
                <span className="benefit-icon">●</span>
                <div>
                  <strong>Diferenciación Total:</strong> No seas uno más del montón; destaca frente a la competencia con una imagen de gran empresa.
                </div>
              </li>
              
              <li>
                <span className="benefit-icon">●</span>
                <div>
                  <strong>Te diferencias de la competencia.</strong> Destacas frente a otras marcas con una imagen profesional.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
