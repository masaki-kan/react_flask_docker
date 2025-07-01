import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001", // FlaskのAPIサーバー
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://localhost:5001", // Socket.IOのターゲットもFlask
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
