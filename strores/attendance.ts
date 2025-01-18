import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {useAxios} from '~/composables/useAxios'

interface AttendanceSession {
    id: number
    courseId: number
    course: {
        title: string
        lecturer: string
    }
    status: 'active' | 'ended'
    startTime: string
    requireLocation: boolean
    presentCount: number
    totalStudents: number
}

interface CreateSessionData {
    courseId: number
    startTime: string
    requireLocation: boolean
}

export const useAttendanceStore = defineStore('attendance', () => {
    // State
    const sessions = ref<AttendanceSession[]>([])
    const loading = ref(false)
    const creatingSession = ref(false)
    const error = ref<string | null>(null)

    // Getters
    const activeSessions = computed(() =>
        sessions.value.filter(session => session.status === 'active')
    )

    const endedSessions = computed(() =>
        sessions.value.filter(session => session.status === 'ended')
    )

    async function fetchSessions() {
        loading.value = true
        error.value = null

        try {
            if (process.env.NODE_ENV === 'development') {
                // Mock data
                await new Promise(resolve => setTimeout(resolve, 1000))
                sessions.value = [
                    {
                        id: 1,
                        courseId: 1,
                        course: {
                            title: 'Web Development',
                            lecturer: 'Dr. Smith'
                        },
                        status: 'active',
                        startTime: new Date().toISOString(),
                        requireLocation: true,
                        presentCount: 15,
                        totalStudents: 20
                    },
                    // Add more mock sessions as needed
                ]
                return
            }

            const axios = useAxios()
            const {data} = await axios.get('/api/attendance/sessions')
            sessions.value = data
        } catch (err) {
            console.error('Error fetching sessions:', err)
            error.value = 'Failed to load attendance sessions'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function createSession(sessionData: CreateSessionData) {
        creatingSession.value = true
        error.value = null

        try {
            if (process.env.NODE_ENV === 'development') {
                await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay
                const newSession: AttendanceSession = {
                    id: Date.now(),
                    courseId: sessionData.courseId,
                    course: {
                        title: 'Mock Course',
                        lecturer: 'Mock Lecturer'
                    },
                    status: 'active',
                    startTime: sessionData.startTime,
                    requireLocation: sessionData.requireLocation,
                    presentCount: 0,
                    totalStudents: 25
                }
                sessions.value.unshift(newSession)
                return newSession
            }

            const axios = useAxios()
            const {data} = await axios.post('/api/attendance/sessions', sessionData)
            sessions.value.unshift(data)
            return data
        } catch (err) {
            console.error('Error creating session:', err)
            error.value = 'Failed to create attendance session'
            throw err
        } finally {
            creatingSession.value = false
        }
    }

    async function endSession(sessionId: number) {
        try {
            if (process.env.NODE_ENV === 'development') {
                await new Promise(resolve => setTimeout(resolve, 500))
                const session = sessions.value.find(s => s.id === sessionId)
                if (session) {
                    session.status = 'ended'
                }
                return
            }

            const axios = useAxios()
            await axios.put(`/api/attendance/sessions/${sessionId}/end`)
            await fetchSessions() // Refresh sessions after ending one
        } catch (err) {
            console.error('Error ending session:', err)
            error.value = 'Failed to end session'
            throw err
        }
    }

    async function markAttendance(sessionId: number) {
        try {
            if (process.env.NODE_ENV === 'development') {
                await new Promise(resolve => setTimeout(resolve, 1000))
                const session = sessions.value.find(s => s.id === sessionId)
                if (session) {
                    session.presentCount++
                }
                return
            }

            const axios = useAxios()
            await axios.post(`/api/attendance/sessions/${sessionId}/mark`)
            await fetchSessions() // Refresh to get updated counts
        } catch (err) {
            console.error('Error marking attendance:', err)
            error.value = 'Failed to mark attendance'
            throw err
        }
    }

    return {
        // State
        sessions,
        loading,
        creatingSession,
        error,

        // Getters
        activeSessions,
        endedSessions,

        // Actions
        fetchSessions,
        createSession,
        endSession,
        markAttendance
    }
})