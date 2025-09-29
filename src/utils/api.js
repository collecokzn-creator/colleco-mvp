const base = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export const api = async (path, opts={}) => {
  const res = await fetch(base + path, opts)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}