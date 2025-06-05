// Load polyfills first
import "./polyfills";

import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import Store from "./redux/store";
import ErrorBoundary from "./components/ErrorBoundary";

// Use createRoot API instead of ReactDOM.render (React 18+)
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ErrorBoundary>
    <Provider store={Store}>
      <App />
    </Provider>
  </ErrorBoundary>
);
