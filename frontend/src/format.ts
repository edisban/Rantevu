export const formatDateTime = (d: Date, locale: string) =>
  d.toLocaleString(locale, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export const formatTime = (d: Date, locale: string) => d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
