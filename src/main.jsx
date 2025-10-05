<<<<<<< Updated upstream
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
=======
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/auth-animations.css"; // Import enhanced auth animations
import "./config/axios"; // Import axios config
>>>>>>> Stashed changes
import { GoogleOAuthProvider } from "@react-oauth/google";

const GoogleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "95171768612-385ic851574oc5145p5pkn7319ok3vfr.apps.googleusercontent.com";
const GoogleOAuthEnabled = import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === "true";

const AppWrapper = () => {
  if (GoogleOAuthEnabled) {
    return (
      <GoogleOAuthProvider clientId={GoogleClientId}>
        <App />
      </GoogleOAuthProvider>
    );
  }

  return <App />;
};

ReactDOM.createRoot(document.getElementById("root")).render(<AppWrapper />);
