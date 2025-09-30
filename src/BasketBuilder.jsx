import React from 'react'
import useBasketReducer from './hooks/useBasketReducer.js'

// quick mock catalog
const catalog = [
  { id: 1, name: 'Flight: Durban → JHB', category: 'flight', price: 3500, startTime: '06:00', endTime: '08:00' },
  { id: 2, name: 'Hotel: Sandton (3 nights)', category: 'hotel', price: 4800, startTime: '14:00', endTime: '11:00' }
]

export default function BasketBuilder() {
  const [basket, dispatch] = useBasketReducer()

  const add = (p) => dispatch({ type: 'add', payload: p })

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Basket Builder</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Catalog</h3>
          <ul className="space-y-2">
            {catalog.map(p => (
              <li key={p.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">R{p.price}</div>
                </div>
                <button onClick={() => add(p)} className="px-3 py-1 bg-blue-600 text-white rounded">Add</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-2">Basket</h3>
          {basket.length === 0 ? <p>No items yet.</p> : (
            <ul className="space-y-2">
              {basket.map(it => (
                <li key={it.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-500">R{it.price} × {it.qty ?? 1}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => dispatch({type:'dec',payload:it.id})} className="px-2 border rounded">-</button>
                    <span>{it.qty ?? 1}</span>
                    <button onClick={() => dispatch({type:'inc',payload:it.id})} className="px-2 border rounded">+</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}