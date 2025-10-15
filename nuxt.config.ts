// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@prisma/nuxt',
    '@pinia/nuxt'
  ],
  css: [
    '~/assets/css/tailwind.css'
  ],
  colorMode: {
    preference: 'system',
    classSuffix: ''
  },
  tailwindcss: {
    exposeConfig: true
  }
})
