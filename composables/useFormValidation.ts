import {ref, computed} from 'vue'
import {z} from 'zod'

export function useFormValidation<T extends z.ZodType>(schema: T) {
    const errors = ref<Record<string, string>>({})
    const isValid = computed(() => Object.keys(errors.value).length === 0)

    const validate = (data: Record<string, any>) => {
        const result = schema.safeParse(data)

        if (!result.success) {
            errors.value = result.error.issues.reduce((acc, issue) => {
                const path = issue.path.join('.')
                acc[path] = issue.message
                return acc
            }, {} as Record<string, string>)
            return false
        }

        errors.value = {}
        return true
    }

    const getError = (field: string) => errors.value[field]

    const clearErrors = () => {
        errors.value = {}
    }

    return {
        errors,
        isValid,
        validate,
        getError,
        clearErrors
    }
}