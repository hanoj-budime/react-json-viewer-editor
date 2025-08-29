import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/react-json-viewer-editor/",  // 👈 important for GitHub Pages
});