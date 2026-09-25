import { useEffect, useRef } from 'react'
import { useFocus } from '../../context/FocusContext'
import { showLocalNotification } from '../../services/notifications'
import { dateKey, taskDateTime } from '../../utils/date'
import { useToast } from '../ui/Toast'

export function NotificationWatcher() {
  const { state } = useFocus()
  const toast = useToast()
  const sent = useRef(new Set<string>())

  useEffect(() => {
    if (!state.settings.notificationsEnabled) return
    const check = () => {
      const now = Date.now()
      const today = dateKey(new Date())
      state.tasks.filter(t => t.date === today && !t.completed && t.reminderMinutes !== null).forEach(task => {
        const notifyAt = taskDateTime(task.date, task.time) - (task.reminderMinutes ?? 0) * 60000
        const key = `${task.id}:${task.date}`
        if (now >= notifyAt && now < notifyAt + 60000 && !sent.current.has(key)) {
          sent.current.add(key)
          const body = task.reminderMinutes ? `${task.title} começa em ${task.reminderMinutes} min.` : `${task.title} começa agora.`
          void showLocalNotification('Focus', body)
          toast(body)
        }
      })
    }
    check()
    const id = window.setInterval(check, 30000)
    return () => window.clearInterval(id)
  }, [state.tasks, state.settings.notificationsEnabled, toast])
  return null
}
