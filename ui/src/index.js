import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProvider } from './AppContext'; // Import AppProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider> {/* Bao bọc App bằng AppProvider */}
      <App />
    </AppProvider>
  </React.StrictMode>
);
