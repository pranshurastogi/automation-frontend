import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ThirdwebProvider } from "thirdweb/react";
import "./index.css";
import { ChainId } from "@thirdweb-dev/react";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThirdwebProvider>
      <App />
    </ThirdwebProvider>
  </React.StrictMode>
);
