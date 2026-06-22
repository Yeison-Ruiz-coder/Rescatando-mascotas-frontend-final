import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 3000,
    cssCodeSplit: true,
    esbuild: {
      drop: ["console", "debugger"],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react-router-dom") ||
              id.includes("react-dom") ||
              id.includes("react")
            ) {
              return "react-vendor";
            }
            if (id.includes("leaflet") || id.includes("react-leaflet")) {
              return "map-vendor";
            }
            if (
              id.includes("react-toastify") ||
              id.includes("i18next") ||
              id.includes("react-i18next")
            ) {
              return "intl-vendor";
            }
            if (id.includes("bootstrap") || id.includes("flag-icons")) {
              return "ui-vendor";
            }
            if (id.includes("react-datepicker") || id.includes("date-fns")) {
              return "date-vendor";
            }
            if (
              id.includes("lucide-react") ||
              id.includes("react-select") ||
              id.includes("@react-pdf")
            ) {
              return "component-vendor";
            }
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "https://rescatando-mascotas-backend-final-production.up.railway.app",
        changeOrigin: true,
        secure: false,
        // ✅ Agrega estas opciones para evitar ECONNRESET
        timeout: 60000, // 60 segundos
        proxyTimeout: 60000,
        onProxyReq: (proxyReq) => {
          proxyReq.setHeader('Connection', 'keep-alive');
        },
        // ✅ Maneja errores del proxy
        onError: (err, req, res) => {
          console.error('⚠️ Proxy error:', err.message);
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              message: 'Error de conexión con el servidor' 
            }));
          }
        }
      },
    },
  },
});