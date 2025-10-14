import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./src/modules/core"),
      "@auth": path.resolve(__dirname, "./src/modules/auth"),
      "@dashboard": path.resolve(__dirname, "./src/modules/dashboard"),
      "@resume": path.resolve(__dirname, "./src/modules/resume"),
      "@jobs": path.resolve(__dirname, "./src/modules/jobs"),
      "@cover-letter": path.resolve(__dirname, "./src/modules/cover-letter"),
      "@profile": path.resolve(__dirname, "./src/modules/profile"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@modules/*": path.resolve(__dirname, "./src/modules/*"),
    },
  },
  server: {
    port: 3000,
    host: true, // Allow external connections for debugging
    strictPort: true,
    watch: {
      usePolling: true, // Enable polling for Docker volume mounting
    },
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false,
        ws: true,
      },
      "/resume": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/upload": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/compare": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/improve": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/job-descriptions": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/jd": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/cover-letter": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/profile-photo": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/forgot-password": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/reset-password": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/health": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    sourcemap: true, // Enable source maps for debugging
    minify: false, // Disable minification for easier debugging
  },
  define: {
    // Enable debugging in development
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
  },
});
