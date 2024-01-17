// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxthq/ui",
    "@vueuse/nuxt",
    "@nuxtjs/fontaine",
    "@nuxtjs/google-fonts",
    "nuxt-vercel-analytics",
    "@vite-pwa/nuxt",
  ],
  runtimeConfig: {
    openaiApiKey: "",
  },
  colorMode: {
    preference: "dark",
  },
  googleFonts: {
    families: {
      Chewy: true,
    },
  },
  nitro: {
    prerender: {
      routes: ["/"],
    },
    esbuild: {
      options: {
        target: "esnext",
      },
    },
  },
  fontMetrics: {
    fallbacks: ["BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "Noto Sans"],
    fonts: ["Chewy"],
  },
  pwa: {
    manifest: {
      name: "Emoji Search",
      short_name: "EmojiSearch",
      theme_color: "#121212",
      background_color: "#121212",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
  },
});
