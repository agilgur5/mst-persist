export function getItem(key: string) {
  const item = window.localStorage.getItem(key)
  return item ? JSON.parse(item) : null // can only parse strings
}
