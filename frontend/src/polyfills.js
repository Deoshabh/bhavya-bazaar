/* eslint-disable no-undef, no-restricted-globals, no-global-assign */
// Polyfills for production build
import 'globalthis/auto';

// Additional polyfills for better browser compatibility
if (typeof globalThis === 'undefined') {
  var globalThis = (function() {
    if (typeof self !== 'undefined') return self;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    throw new Error('Unable to locate global object');
  })();
}

// Ensure process is available for Redux Toolkit
if (typeof process === 'undefined') {
  window.process = require('process/browser');
}
