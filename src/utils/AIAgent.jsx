import React from 'react'

export default function AIAgent() {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState([
    { from: 'system', text: 'Hi — I am CollEco, your travel concierge. Tell me where you want to go.' }
  ])

  const send = (text) => {
    setMessages(m => [...m, { from: 'user', text }])
    // mock reply
    setTimeout(() => setMessages(m => [...m, { from: 'agent', text: `I found a 3-night package to ${text} from R8,500. Want it?` }]), 800)
  }

  return (
    <div className="fixed bottom-6 right-6">
      {open ? (
        <div className="w-80 p-4 bg-white border rounded shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold">AI Concierge</div>
            <button onClick={() => setOpen(false)}>Close</button>
          </div>
          <div className="h-48 overflow-auto mb-2 space-y-2">
            {messages.map((m,i) => (
              <div key={i} className={m.from==='user'? 'text-right':'text-left'}>{m.text}</div>
            ))}
          </div>
          <AIAgentInput onSend={send} />
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-full shadow">Chat</button>
      )}
    </div>
  )
}

function AIAgentInput({ onSend }) {
  const [v, setV] = React.useState('')
  return (
    <div className="flex gap-2">
      <input value={v} onChange={e=>setV(e.target.value)} className="flex-1 p-2 border rounded" />
      <button onClick={()=>{ onSend(v); setV('') }} className="px-3 py-1 bg-blue-600 text-white rounded">Send</button>
    </div>
  )
}