// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { store } from "./app/store";
import { Provider } from "react-redux";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// Deshabilita las herramientas de desarrollo de React en producción
if (process.env.NODE_ENV === "production") disableReactDevTools();

// Crea el punto de entrada de la aplicación
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Ruta para la aplicación */}
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
