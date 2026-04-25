const API = 'https://api.mymemory.translated.net/get'

const cache = new Map<string, string>()

export async function translate(
  text: string,
  from = 'de',
  to   = 'ru',
): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed) return ''

  const key = `${from}|${to}|${trimmed}`
  if (cache.has(key)) return cache.get(key)!

  const url = `${API}?${new URLSearchParams({ q: trimmed, langpair: `${from}|${to}` })}`
  const res  = await fetch(url)

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const json = await res.json() as {
    responseStatus: number
    responseData:   { translatedText: string }
    responseMessage?: string
  }

  if (json.responseStatus !== 200) {
    throw new Error(json.responseMessage ?? 'Translation failed')
  }

  const result = json.responseData.translatedText
  cache.set(key, result)
  return result
}
