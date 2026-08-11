import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Auth from './Auth';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <Auth>
        <App />
      </Auth>
    </ThemeProvider>
  </React.StrictMode>
);
