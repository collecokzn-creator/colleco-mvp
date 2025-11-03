import React, { useState } from "react";
import { PUBLIC_SITE_URL, CONTACT_EMAIL } from "../config";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // '', 'ok', 'err'

  async function handleSubmit(e){
    e.preventDefault();
    setStatus("");
    try{
      const res = await fetch((import.meta.env.VITE_API_BASE||'http://localhost:4000')+"/api/contact",{
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      if(!res.ok) throw new Error('Failed');
      setStatus('ok'); setName(''); setEmail(''); setMessage('');
    }catch{
      setStatus('err');
    }
  }
  return (
    <div className="px-6 py-8 text-brand-russty">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <div className="bg-surface p-6 rounded-md border border-cream-border space-y-4">
        <p>📍 Address: South Africa, South Coast, Port Shepstone</p>
        <p>📞 Phone / WhatsApp: 0733994708</p>
        <p>📧 Email: <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a></p>
        <p>🌍 Website: <a href={PUBLIC_SITE_URL} target="_blank" rel="noreferrer" className="underline">{PUBLIC_SITE_URL}</a></p>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
          <label className="text-sm">Name
            <input value={name} onChange={e=>setName(e.target.value)} className="block w-full mt-1 p-2 rounded border border-cream-border bg-cream" required />
          </label>
          <label className="text-sm">Email
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="block w-full mt-1 p-2 rounded border border-cream-border bg-cream" required />
          </label>
          <label className="text-sm">Message
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} className="block w-full mt-1 p-2 rounded border border-cream-border bg-cream" required />
          </label>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded bg-brand-orange text-white text-sm">Send</button>
              {status==='ok' && <span className="text-green-700 text-sm">Thanks! We&apos;ll reply shortly.</span>}
            {status==='err' && <span className="text-red-700 text-sm">Could not send right now.</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
