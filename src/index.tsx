// index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ReduxProvider } from "./redux/reduxStateContext";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <BrowserRouter>
    <ReduxProvider>
      <App />
    </ReduxProvider>
  </BrowserRouter>,
);
