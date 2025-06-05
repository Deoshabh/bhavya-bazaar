import { useState, useEffect } from 'react';

/**
 * Hook for accessing runtime configuration in components
 * @param {string} key - Optional specific config key to access
 * @param {any} defaultValue - Default value if config key doesn't exist
 * @returns {any} The entire config object or specific value
 */
export function useRuntimeConfig(key = null, defaultValue = null) {
  // Get the full config from the window object
  const getConfig = () => {
    // Try the new format first, then fall back to legacy format
    const config = window.__RUNTIME_CONFIG__ || window.RUNTIME_CONFIG || {};
    
    if (key === null) {
      // Return the entire config
      return config;
    } else {
      // Access nested keys using dot notation (e.g. "FEATURES.ENABLE_CHAT")
      if (key.includes('.')) {
        const keys = key.split('.');
        let value = config;
        
        for (const k of keys) {
          if (value === undefined || value === null) {
            return defaultValue;
          }
          value = value[k];
        }
        
        return value !== undefined ? value : defaultValue;
      }
      
      // Simple key access
      return config[key] !== undefined ? config[key] : defaultValue;
    }
  };
  
  const [config, setConfig] = useState(getConfig());
  
  // This effect is useful if runtime config might change during app execution
  // For example, if you have a feature flag service that updates config
  useEffect(() => {
    // Function to handle runtime config changes
    const handleConfigChange = () => {
      setConfig(getConfig());
    };
    
    // Example: listen for custom event that might be dispatched when config changes
    window.addEventListener('runtime-config-changed', handleConfigChange);
    
    return () => {
      window.removeEventListener('runtime-config-changed', handleConfigChange);
    };
  }, [key, defaultValue]);
  
  return config;
}

/**
 * Check if a feature flag is enabled
 * @param {string} featureName - Name of the feature flag
 * @param {boolean} defaultValue - Default value if feature flag is not defined
 * @returns {boolean} - Whether the feature is enabled
 */
export function useFeatureFlag(featureName, defaultValue = false) {
  return useRuntimeConfig(`FEATURES.${featureName}`, defaultValue);
}

export default useRuntimeConfig;
