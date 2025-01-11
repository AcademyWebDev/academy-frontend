// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: {enabled: true},
    modules: [
        '@pinia/nuxt',
        '@vueuse/nuxt',
    ],
    css: [
        '@/assets/scss/main.scss',
    ],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    runtimeConfig: {
        public: {
            isDev: process.env.NODE_ENV === 'development',
            baseURL: 'http://127.0.0.1:8000/api/'
        },
    },
})
