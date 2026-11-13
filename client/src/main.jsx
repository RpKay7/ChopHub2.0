
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import "./App.css";

import App from "./App";
import { CartProvider } from "./components/CartContext";
import { MenuProvider } from "./components/MenuContext";
import { NotificationProvider } from "./components/NotificationContext";
import { AuthProvider } from "./components/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <MenuProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </MenuProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
