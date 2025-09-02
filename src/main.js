// Main entry point for Vite
import './js/entry.js';
import './scss/main.scss';

// Import JavaScript modules
import { buildMenuTwisties, persistUrlQuery } from './js/common';
import './js/index.js';
import './js/archive.js';
import './js/releases.js';
import './js/upstream.js';

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  persistUrlQuery();
  buildMenuTwisties();

  // Determine which page we're on based on the URL
  const path = window.location.pathname;
  
  // Call the appropriate load function based on the page
  if (path.includes('archive')) {
    if (typeof window.load === 'function') window.load();
  } else if (path.includes('releases')) {
    if (typeof window.load === 'function') window.load();
  } else if (path.includes('upstream')) {
    if (typeof window.load === 'function') window.load();
  } else {
    // Default to index page
    if (typeof window.load === 'function') window.load();
  }
});
