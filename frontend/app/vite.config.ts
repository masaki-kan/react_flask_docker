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
  },
  plugins: [react()],
  optimizeDeps: {
    include: ["socket.io-client"],
  },
});
