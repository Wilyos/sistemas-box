import './Footer.css';
import { FaWhatsapp, FaFacebook, FaInstagram, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-left">
            <p className="footer-intro">
              En <strong>Sistemas litograficos</strong> creamos empaques que representan tu marca.
            </p>
            
            <p className="footer-subtitle">
              Contáctanos para cotizaciones y asesoría.
            </p>

            <div className="footer-section">
              <h3>INFORMACIÓN DE CONTACTO</h3>
              <div className="contact-item">
                <FaWhatsapp className="icon" />
                <a href="https://wa.me/573015088598" target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </div>
              <div className="contact-item">
                <span className="icon">✉️</span>
                <a href="mailto:Sistemaslitograficosmed@gmail.com">Sistemaslitograficosmed@gmail.com</a>
              </div>
            </div>

            <div className="footer-section">
              <h3>NOS ENCONTRAMOS EN:</h3>
              <Link to="/localizador" className="store-locator-link">
                <FaMapMarkerAlt className="locator-icon" />
                <div className="locator-text">
                  <strong>Localizador de Tiendas</strong>
                  <span>Ver todas nuestras ubicaciones en el mapa</span>
                </div>
              </Link>
            </div>

            <p className="footer-coverage">
              Atendemos pedidos a nivel local y nacional.
            </p>

            <p className="footer-digital">
              También puedes contactarnos de forma digital para recibir asesoría sin necesidad de desplazarte.
            </p>
          </div>

          <div className="footer-right">
            <img 
              src="/footer.png" 
              alt="Productos empaque" 
              className="footer-image"
            />
          </div>
        </div>

        <div className="footer-social">
          <a href="https://sistemaslitograficos.com.co" target="_blank" rel="noopener noreferrer" title="Sitio Web">
            <FaGlobe className="social-icon" />
          </a>
          <a href="https://facebook.com/sistemaslitograficos2021" target="_blank" rel="noopener noreferrer" title="Facebook">
            <FaFacebook className="social-icon" />
          </a>
          <a href="https://instagram.com/sistemas litograficossas" target="_blank" rel="noopener noreferrer" title="Instagram">
            <FaInstagram className="social-icon" />
          </a>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Sistemas Litograficos. Todos los derechos reservados.</p>
          <p className="developed-by"></p>
        </div>
      </div>
    </footer>
  );
}
