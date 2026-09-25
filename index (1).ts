export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported' as const
  return Notification.requestPermission()
}

export const showLocalNotification = async (title: string, body: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const registration = await navigator.serviceWorker?.getRegistration()
  if (registration) await registration.showNotification(title, { body, icon: '/pwa-192.png', badge: '/pwa-192.png' })
  else new Notification(title, { body, icon: '/pwa-192.png' })
}
