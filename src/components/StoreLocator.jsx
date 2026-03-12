import { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaClock, FaDirections, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Header from './Header';
import './StoreLocator.css';

const stores = [
  {
    id: 1,
    name: 'Sistemas Litográficos - Sede De Ventas',
    address: 'Carrera 54 # 53 - 115',
    city: 'Medellín, Colombia',
    phone: '3015088598',
    hours: 'Lunes a Viernes: 8:00 AM - 5:00 PM',
    fullAddress: 'Carrera 54 # 53 - 115, Medellín, Colombia',
    coordinates: { lat: 6.254577, lng: -75.570161 }, 
    googleMapsUrl: 'https://www.google.com/maps/place/Sistemas+Litográficos/@6.25465,-75.570714,923m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8e442943e4f17211:0x849dd7e492aef013!8m2!3d6.25465!4d-75.570714!16s%2Fg%2F11fhvwpp2z?entry=ttu&g_ep=EgoyMDI2MDMwOS4wIKXMDSoASAFQAw%3D%3D'
  },
  {
    id: 2,
    name: 'Sistemas Litográficos - Producción',
    address: 'Calle 54 # 54 - 43',
    city: 'Medellín, Colombia',
    phone: '3015088598',
    hours: 'Lunes a Viernes: 8:00 AM - 5:00 PM',
    fullAddress: 'Calle 54 # 54 - 43, Medellín, Colombia',
    coordinates: { lat: 6.244, lng: -75.574 },
    googleMapsUrl: 'https://www.google.com/maps/place/Sistemas+Litográficos/@6.244,-75.574,776m/data=!3m1!1e3!4m6!3m5!1s0x8e442943e4f17211:0x849dd7e492aef013!8m2!3d6.244!4d-75.574!16s%2Fg%2F11fhvwpp2z?entry=ttu&g_ep=EgoyMDI2MDMwOS4wIKXMDSoASAFQAw%3D%3D'
  },
  {
    id: 3,
    name: 'Distrito Grafico',
    address: 'Calle 54 # 54 - 43',
    city: 'Medellín, Colombia',
    phone: '3015088598',
    hours: 'Lunes a Viernes: 8:00 AM - 6:00 PM',
    fullAddress: 'Calle 54 # 54 - 43, Medellín, Colombia',
    coordinates: { lat: 6.244, lng: -75.574 },
    googleMapsUrl: 'https://www.google.com/maps/place/Sistemas+Litográficos/@6.244,-75.574,776m/data=!3m1!1e3!4m6!3m5!1s0x8e442943e4f17211:0x849dd7e492aef013!8m2!3d6.244!4d-75.574!16s%2Fg%2F11fhvwpp2z?entry=ttu&g_ep=EgoyMDI2MDMwOS4wIKXMDSoASAFQAw%3D%3D'
  },
  {
    id: 4,
    name: 'Cuatro Torres',
    address: 'Cll 54 # 54 - 50',
    city: 'Medellín, Colombia',
    phone: '320 265 6457',
    hours: 'Lunes a Viernes: 8:00 AM - 6:00 PM',
    fullAddress: 'Cll 54 # 54 - 50, Medellín, Colombia',
    coordinates: { lat: 6.254749, lng: -75.570542 }, 
    googleMapsUrl: 'https://www.google.com/maps/place/Sistemas+Litográficos/@6.244,-75.574,776m/data=!3m1!1e3!4m6!3m5!1s0x8e442943e4f17211:0x849dd7e492aef013!8m2!3d6.244!4d-75.574!16s%2Fg%2F11fhvwpp2z?entry=ttu&g_ep=EgoyMDI2MDMwOS4wIKXMDSoASAFQAw%3D%3D'
  }
];

export default function StoreLocator() {
  const [selectedStore, setSelectedStore] = useState(stores[0]);

  return (
    <>
      <Header />
      <div className="store-locator">
        <div className="store-locator-header">
          <Link to="/" className="back-link">
            <FaArrowLeft /> Volver al inicio
          </Link>
          <h1>Localizador de Tiendas</h1>
          <p>Encuentra la tienda más cercana a ti</p>
        </div>

      <div className="store-locator-content">
        <div className="stores-list">
          <h2>Nuestras Ubicaciones ({stores.length})</h2>
          
          {stores.map((store) => (
            <div
              key={store.id}
              className={`store-card ${selectedStore.id === store.id ? 'active' : ''}`}
              onClick={() => setSelectedStore(store)}
            >
              <div className="store-card-header">
                <FaMapMarkerAlt className="store-icon" />
                <h3>{store.name}</h3>
              </div>
              
              <div className="store-details">
                <p className="store-address">
                  <strong>{store.address}</strong>
                  <br />
                  {store.city}
                </p>
                
                <p className="store-phone">
                  <FaPhoneAlt className="detail-icon" />
                  <a href={`tel:+57${store.phone}`}>{store.phone}</a>
                </p>
                
                <p className="store-hours">
                  <FaClock className="detail-icon" />
                  {store.hours}
                </p>
                
                <div className="store-actions">
                  <a
                    href={store.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="directions-btn"
                  >
                    <FaDirections /> Cómo llegar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="map-container">
          <div className="map-wrapper">
            <iframe
              title="Google Maps"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps?q=${encodeURIComponent(selectedStore.fullAddress)}&z=17&output=embed`}
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
