import path from "node:path";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
  const base = "/Central-Admission-Organizer/";

  return {
    base,

    plugins: [
      react(),
      tailwindcss(),

      VitePWA({
        registerType: "autoUpdate",

        includeAssets: ["favicon-32x32.png", "round.png", "*.pdf"],

        manifest: {
          name: "Central Admission Organizer | ترتيب استمارة التقديم",

          short_name: "Admission Organizer",

          description:
            "Arrange Iraqi central admission choices | ترتيب اختيارات التقديم المركزي",

          lang: "ar",
          dir: "rtl",

          start_url: base,
          scope: base,

          display: "standalone",

          background_color: "#fafafa",
          theme_color: "#18181b",

          icons: [
            {
              src: "icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
      }),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
