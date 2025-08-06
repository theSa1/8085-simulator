import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
const config = defineConfig({
  plugins: [preact(), tailwindcss()],
});

export default config;
