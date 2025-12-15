import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 🔥 IMPORTANTE: Importar los estilos aquí para que se apliquen en toda la app
import './index.css'; 
// import './App.css'; // Opcional, si tienes estilos específicos ahí

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);