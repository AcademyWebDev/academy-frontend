import {useAuthStore} from "~/strores/auth";

export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore()

    if (!authStore.token) {
        const redirect = to.fullPath
        return navigateTo(`/login?redirect=${encodeURIComponent(redirect)}`)
    }

    const isValid = await authStore.checkAuth()
    if (!isValid) {
        const redirect = to.fullPath
        return navigateTo(`/login?redirect=${encodeURIComponent(redirect)}`)
    }

    // if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    //     return navigateTo('/unauthorized')
    // }
})