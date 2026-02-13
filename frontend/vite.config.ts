import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/emoji_tower/",
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
