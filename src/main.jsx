import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Polyfill: αντικαθιστά το window.storage του Claude
// με localStorage ώστε να δουλεύει τοπικά
window.storage = {
  async get(key) {
    const value = localStorage.getItem(`roadmap:${key}`);
    if (value === null) throw new Error('Key not found');
    return { key, value };
  },
  async set(key, value) {
    localStorage.setItem(`roadmap:${key}`, value);
    return { key, value };
  },
  async delete(key) {
    localStorage.removeItem(`roadmap:${key}`);
    return { key, deleted: true };
  },
  async list(prefix = '') {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(`roadmap:${prefix}`)) {
        keys.push(k.replace('roadmap:', ''));
      }
    }
    return { keys };
  },
};

// Global styles
const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #0a0a0f; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #555; }
  textarea:focus { border-color: rgba(14, 165, 233, 0.4) !important; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
