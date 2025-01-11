import {ref, onMounted} from 'vue'

export const useTheme = () => {
    const isDark = ref(false)

    const toggleTheme = () => {
        isDark.value = !isDark.value
        updateTheme()
    }

    const updateTheme = () => {
        localStorage.setItem('theme', isDark.value ? 'dark' : 'light')

        if (isDark.value) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    onMounted(() => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
            isDark.value = savedTheme === 'dark'
        } else {
            isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        updateTheme()
    })

    return {
        isDark,
        toggleTheme
    }
}