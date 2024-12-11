import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializePdfWorker } from './utils/pdfWorker';

// Initialize PDF.js worker
initializePdfWorker()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch(error => {
    console.error('Failed to initialize application:', error);
    // Show a user-friendly error message
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>Application Error</h1>
        <p>Failed to initialize the application. Please try refreshing the page.</p>
      </div>
    `;
  });