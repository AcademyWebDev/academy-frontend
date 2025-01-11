import {useAuthStore} from "~/strores/auth";

export default defineNuxtRouteMiddleware(() => {
    const authStore = useAuthStore()

    if (authStore.isAuthenticated) {
        return navigateTo('/dashboard')
    }
})