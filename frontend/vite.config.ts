import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000, // Cambia esto al puerto que desees
    host: "0.0.0.0", // Esto expone el servidor a la red local
    open: true,
  },
});
