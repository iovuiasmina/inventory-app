/**
 * vite.config.js — Configuratia Vite pentru frontend
 * Proxy: cererile /api si /uploads sunt redirectionate catre Express (:5000)
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Plugin oficial Tailwind v4 — fara config suplimentar
  ],
  server: {
    proxy: {
      // Toate cererile /api merg catre Express (elimina erorile CORS)
      "/api": "http://localhost:5000",
      // Imaginile uploadate sunt servite tot prin Express
      "/uploads": "http://localhost:5000",
    },
  },
});
