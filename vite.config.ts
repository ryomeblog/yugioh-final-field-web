import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/yugioh-final-field/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["tutorial/*.png"],
      manifest: {
        name: "遊戯王 展開ログ",
        short_name: "展開ログ",
        description: "遊戯王の展開をステップごとに記録・共有するアプリ",
        theme_color: "#111827",
        background_color: "#111827",
        display: "standalone",
        start_url: "/yugioh-final-field/",
        scope: "/yugioh-final-field/",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/www\.db\.yugioh-card\.com\/yugiohdb\/get_image\.action/,
            handler: "CacheFirst",
            options: {
              cacheName: "neuron-card-images",
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
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
});
