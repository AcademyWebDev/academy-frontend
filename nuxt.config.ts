// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    ssr: false,
    compatibilityDate: '2024-11-01',
    devtools: {enabled: true},
    modules: [
        '@pinia/nuxt',
        '@vueuse/nuxt',
        'pinia-plugin-persistedstate/nuxt',
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
    app: {
        pageTransition: {
            name: 'page',
            mode: 'out-in'
        },
        baseURL: '/academy-frontend/',
    },
    nitro: {
        preset: 'github_pages'
    },
    runtimeConfig: {
        public: {
            isDev: process.env.NODE_ENV === 'development',
            baseURL: 'http://127.0.0.1:8000/api/'
        },
    },
})
