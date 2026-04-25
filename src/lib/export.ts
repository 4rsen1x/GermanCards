import type { Topic } from '../types'

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportTopicJSON(topic: Topic): void {
  const safe = topic.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
  download(JSON.stringify(topic, null, 2), `${safe}.json`, 'application/json')
}

export function exportAllJSON(topics: Topic[]): void {
  download(JSON.stringify(topics, null, 2), 'GermanCards_export.json', 'application/json')
}

export function printTopic(): void {
  window.print()
}
