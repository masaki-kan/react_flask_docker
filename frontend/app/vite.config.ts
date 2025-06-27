import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    https: {
      key: fs.readFileSync("./cert/localhost-key.pem"),
      cert: fs.readFileSync("./cert/localhost.pem"),
    },
    proxy: {
      "/api": {
        target: "https://localhost", // or http://nginx:443 if you’re inside Docker network
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "https://localhost",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },

  plugins: [react()],
  optimizeDeps: {
    include: ["socket.io-client"],
  },
});
