export function formatDistanceToNow(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60_000)
  const hrs  = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (min < 1)   return 'gerade eben'
  if (min < 60)  return `vor ${min} Min.`
  if (hrs < 24)  return `vor ${hrs} Std.`
  if (days < 7)  return `vor ${days} Tag${days === 1 ? '' : 'en'}`
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}
