import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../styles/main.scss";
import "../../site/assets/icons.js";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
