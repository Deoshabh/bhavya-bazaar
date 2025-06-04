const fs = require('fs');
const path = require('path');
const {
  REACT_APP_API_URL,
  REACT_APP_WS_URL,
  REACT_APP_ENV,
  REACT_APP_DEBUG
} = process.env;

if (!REACT_APP_API_URL || !REACT_APP_WS_URL) {
  console.error('[generate-runtime-config] ERROR: REACT_APP_API_URL or REACT_APP_WS_URL is not defined');
  process.exit(1);
}

const contents = `
window.RUNTIME_CONFIG = {
  API_URL: "${REACT_APP_API_URL}",
  SOCKET_URL: "${REACT_APP_WS_URL}",
  BACKEND_URL: "${REACT_APP_API_URL}",
  ENV: "${REACT_APP_ENV || 'production'}",
  DEBUG: ${REACT_APP_DEBUG === 'true' ? true : false}
};
`.trimStart();

fs.writeFileSync(path.join(__dirname, '../public/runtime-config.js'), contents);
console.log('[generate-runtime-config] ✅ runtime-config.js written');
console.log(contents);
