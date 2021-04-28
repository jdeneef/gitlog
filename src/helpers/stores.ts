import { readable } from 'svelte/store'

export const initStore = (url: string) => {
  console.log(url)
  return readable(null, async set => {
    try {
    const res = await fetch(url)
    const json = await res.json()
    set(json)
    } catch (e) {
      return { error: e.message}
    }
  ))
}


