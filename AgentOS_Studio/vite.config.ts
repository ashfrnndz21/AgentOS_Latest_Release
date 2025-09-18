import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// AWS AgentOSDemo configuration

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    proxy: {
      '/api/ollama': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
      },
      '/api/agents': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
      },
      '/api/strands': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
      },
      '/api/chat': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false,
      },
      '/api/rag': {
        target: 'http://localhost:5003',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
