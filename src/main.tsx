import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {/* Every Motion animation follows the visitor's "reduce motion" setting */}
        <MotionConfig reducedMotion="user">
            <App />
        </MotionConfig>
    </StrictMode>,
);
