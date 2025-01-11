import {useAuthStore} from "~/strores/auth";

export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore()
    const isAuthenticated = authStore.isAuthenticated

    if (to.meta.auth === false) {
        if (isAuthenticated && to.name === 'login') {
            return navigateTo('/dashboard')
        }
        return
    }

    if (!isAuthenticated) {
        const redirect = to.fullPath
        return navigateTo(`/login?redirect=${encodeURIComponent(redirect)}`)
    }

    if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
        return navigateTo('/unauthorized')
    }
})