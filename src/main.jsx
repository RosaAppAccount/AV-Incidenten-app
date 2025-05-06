import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ voeg routing toe
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* ✅ maakt routes in App.jsx mogelijk */}
      <App />
    </BrowserRouter>
  </StrictMode>
);
