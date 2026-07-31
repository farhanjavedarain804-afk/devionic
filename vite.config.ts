import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

// https://vitejs.dev/config/
// LOCAL DEV: API calls are proxied to the live production server.
// This avoids needing a local MySQL/backend while developing.
// To switch back to local backend: change target to "http://localhost:5000"
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/portal": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "https://api.devionic.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // keep /api prefix as-is
      },
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
}));
