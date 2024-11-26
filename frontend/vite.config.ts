import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3500, // Esto solo afecta el entorno local
    host: "0.0.0.0", // Exponer servidor a la red local
    open: true,
  },
  build: {
    outDir: "dist", // Directorio donde se generan los archivos de producción
    sourcemap: false, // Opcional: desactiva los mapas de origen para producción
  },
  base: "./", // Si se sirve desde la raíz. Ajustar si Render usa una subruta
});
