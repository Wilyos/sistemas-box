import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initializeProducts } from './utils/initializeProducts'

// Inicializar productos en Firestore si no existen
initializeProducts()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
