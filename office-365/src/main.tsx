/// <reference types="office-js" />

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Wait for Office to be ready before rendering
Office.onReady((info) => {
  if (info.host === Office.HostType.Word || info.host === Office.HostType.PowerPoint) {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } else {
    document.getElementById('root')!.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #a80000; font-family: 'Segoe UI', sans-serif;">
        <h2>Unsupported Application</h2>
        <p>This add-in only works with Microsoft Word and PowerPoint.</p>
      </div>
    `;
  }
});
