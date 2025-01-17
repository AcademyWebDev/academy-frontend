import {useAuthStore} from "~/strores/auth";


export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore()

    if (authStore.token) {
        const isValid = await authStore.checkAuth()
        if (isValid) {
            const redirect = to.query.redirect as string || '/dashboard'
            return navigateTo(redirect)
        }
    }
})