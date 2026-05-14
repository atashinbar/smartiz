import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9595,
    proxy: {
      "/api": { target: "http://localhost:8585", changeOrigin: true },
    },
  },
  preview: {
    port: 9595,
  },
});
