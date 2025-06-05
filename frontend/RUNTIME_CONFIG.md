# Runtime Configuration

This document explains how runtime configuration works in the Bhavya Bazaar application.

## Overview

Runtime configuration allows us to change application behavior without rebuilding the frontend. This is particularly useful for:

- Connecting to different API endpoints (development, staging, production)
- Enabling/disabling features
- Adjusting application behavior for different environments

## How It Works

The main mechanism is through `public/runtime-config.js` which defines a global object called `__RUNTIME_CONFIG__` on the window.

```javascript
window.__RUNTIME_CONFIG__ = {
  API_URL: "https://api.bhavyabazaar.com/api/v2",
  SOCKET_URL: "wss://api.bhavyabazaar.com/ws",
  BACKEND_URL: "https://api.bhavyabazaar.com",
  NODE_ENV: "production",
  FEATURES: {
    ENABLE_CHAT: true,
    // other feature flags...
  },
  // other configuration...
};
```

A compatibility layer ensures `window.RUNTIME_CONFIG` still works for existing code.

## Accessing Configuration

### In React Components

Use the provided hook:

```jsx
import { useRuntimeConfig, useFeatureFlag } from '../hooks/useRuntimeConfig';

function MyComponent() {
  // Get the entire config
  const config = useRuntimeConfig();
  
  // Get a specific value with fallback
  const apiUrl = useRuntimeConfig('API_URL', 'https://default-api.com');
  
  // Access nested config
  const chatEnabled = useRuntimeConfig('FEATURES.ENABLE_CHAT', false);
  
  // Or use the feature flag helper
  const notificationsEnabled = useFeatureFlag('ENABLE_NOTIFICATIONS', false);
  
  return (
    <div>
      <p>API URL: {apiUrl}</p>
      {chatEnabled && <ChatComponent />}
      {notificationsEnabled && <NotificationCenter />}
    </div>
  );
}
```

### In Services/Utilities

Access the global object directly:

```javascript
const apiUrl = window.__RUNTIME_CONFIG__?.API_URL || 
               window.RUNTIME_CONFIG?.API_URL || 
               'https://default-api.com';
```

## Updating Configuration

### Development

During development, the configuration can read from environment variables:

```javascript
window.__RUNTIME_CONFIG__ = {
  API_URL: process.env.REACT_APP_API_URL || "default-url",
  // other config...
};
```

### Production

For production deployments, use the provided script to update the configuration:

```powershell
# PowerShell
.\scripts\update-runtime-config.ps1
```

This will update both the `public/runtime-config.js` and `build/runtime-config.js` files with the current environment settings.

You can also set environment variables before running the script:

```powershell
$env:REACT_APP_API_URL = "https://custom-api.example.com/api/v2"
$env:REACT_APP_DEBUG = "true"
.\scripts\update-runtime-config.ps1
```

## Feature Flags

Feature flags allow us to enable or disable features without code changes:

```javascript
// Check if a feature is enabled
if (window.__RUNTIME_CONFIG__.FEATURES.ENABLE_CHAT) {
  // Initialize chat functionality
}
```

## Best Practices

1. **Always provide fallbacks** when accessing configuration values
2. **Use the hooks in React components** for better testability
3. **Document new configuration values** in this file
4. **Keep build and runtime configuration in sync** using the update script
5. **Don't store secrets** in runtime configuration as it's client-side

## Troubleshooting

If the application is not connecting to the right API endpoints:

1. Check `public/runtime-config.js` and `build/runtime-config.js`
2. Run the API connectivity checker: `node scripts/check-api-proxy.js`
3. Update the configuration using the script: `.\scripts\update-runtime-config.ps1`
