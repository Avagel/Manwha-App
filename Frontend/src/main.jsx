import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { inject } from "@vercel/analytics";
import "./index.css";
import App from "./App.jsx";
createRoot(document.getElementById("root")).render(<App />);
inject();
