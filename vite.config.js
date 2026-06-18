import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
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
        target:
          "https://rescatando-mascotas-backend-final-production.up.railway.app",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
