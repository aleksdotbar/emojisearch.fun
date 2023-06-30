// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxthq/ui",
    "@vueuse/nuxt",
    "@nuxtjs/fontaine",
    "@nuxtjs/google-fonts",
    "nuxt-vercel-analytics",
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
})
