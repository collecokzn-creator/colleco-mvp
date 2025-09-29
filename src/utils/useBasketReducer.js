import { useReducer, useEffect } from 'react'

const reducer = (state, action) => {
  switch (action.type) {
    case 'add': {
      const idx = state.findIndex(i=>i.id===action.payload.id)
      if (idx>=0) {
        const copy = [...state]
        copy[idx].qty = (copy[idx].qty ?? 1) + 1
        return copy
      }
      return [...state, {...action.payload, qty:1}]
    }
    case 'inc': return state.map(i=> i.id===action.payload? {...i, qty:(i.qty??1)+1}:i)
    case 'dec': return state.map(i=> i.id===action.payload? {...i, qty:Math.max(1,(i.qty??1)-1)}:i)
    case 'remove': return state.filter(i=>i.id!==action.payload)
    case 'reset': return []
    default: return state
  }
}

export default function useBasketReducer() {
  const [state, dispatch] = useReducer(reducer, [], () => {
    try {
      const raw = localStorage.getItem('basket')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  useEffect(()=>{ localStorage.setItem('basket', JSON.stringify(state)) }, [state])
  return [state, dispatch]
}