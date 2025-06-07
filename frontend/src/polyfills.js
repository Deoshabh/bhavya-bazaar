/**
 * Browser Polyfills
 * 
 * This file contains polyfills for browser compatibility.
 * Add any necessary polyfills for older browsers here.
 */

// Import core-js polyfills if needed
// import 'core-js/stable';

// GlobalThis polyfill
import 'globalthis/auto';

// Ensure Promise is available (should be standard in modern browsers)
if (!window.Promise) {
  console.warn('Promise polyfill required');
}

// Ensure fetch is available (should be standard in modern browsers)
if (!window.fetch) {
  console.warn('Fetch polyfill required');
}

// Basic console polyfill for older browsers
if (!window.console) {
  window.console = {
    log: function() {},
    warn: function() {},
    error: function() {},
    info: function() {},
    debug: function() {}
  };
}

// Performance polyfill
if (!window.performance) {
  window.performance = {
    now: function() {
      return Date.now();
    }
  };
}

// Basic URL polyfill check
if (!window.URL && window.webkitURL) {
  window.URL = window.webkitURL;
}

console.log('✅ Polyfills loaded successfully');
