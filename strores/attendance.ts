import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {useAxios} from '~/composables/useAxios'

const config = useRuntimeConfig()

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
    attendanceMarked?: {
        timestamp: string;
    };
}

interface CreateSessionData {
    courseId: number
    startTime: string
    requireLocation: boolean
}

export const useAttendanceStore = defineStore('attendance', () => {
    const sessions = ref<AttendanceSession[]>([])
    const loading = ref(false)
    const creatingSession = ref(false)
    const error = ref<string | null>(null)

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
            if (config.public.isDev) {
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
            if (config.public.isDev) {
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
            if (config.public.isDev) {
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

    const markedAttendances = ref<Record<number, string>>({}) // sessionId -> timestamp

    function hasMarkedAttendance(sessionId: number) {
        return !!markedAttendances.value[sessionId]
    }

    function getAttendanceTime(sessionId: number) {
        return markedAttendances.value[sessionId]
    }

    async function markAttendance(sessionId: number) {
        try {
            if (config.public.isDev) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                const session = sessions.value.find(s => s.id === sessionId)
                if (session) {
                    session.presentCount++
                    markedAttendances.value[sessionId] = new Date().toISOString()
                }
                return
            }

            const axios = useAxios()
            const {data} = await axios.post(`/api/attendance/sessions/${sessionId}/mark`)
            markedAttendances.value[sessionId] = data.timestamp
            await fetchSessions()
        } catch (err) {
            console.error('Error marking attendance:', err)
            error.value = 'Failed to mark attendance'
            throw err
        }
    }


    return {
        sessions,
        loading,
        creatingSession,
        error,

        activeSessions,
        endedSessions,
        markedAttendances,

        fetchSessions,
        createSession,
        endSession,
        markAttendance,
        hasMarkedAttendance,
        getAttendanceTime,
    }
})