import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import * as fs from 'fs';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const projectRoot = path.resolve(__dirname, './');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT) || 7939,
      host: "localhost",
      // https: true, 
    },
  };
});
