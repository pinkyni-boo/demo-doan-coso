import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="95171768612-385ic851574oc5145p5pkn7319ok3vfr.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
