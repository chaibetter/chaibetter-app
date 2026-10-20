'use client'
import { useState, useEffect } from 'react'

export default function Home(){
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(()=>{
    const k = localStorage.getItem('groq_key')
    if(k){ setApiKey(k) } else { setShowKey(true) }
  },[])

  const saveKey = () => {
    if(!apiKey.trim().startsWith('gsk_')){
      alert('Key must start with gsk_ - get from console.groq.com/keys')
      return
    }
    localStorage.setItem('groq_key', apiKey.trim())
    setShowKey(false)
  }

  const sendMessage = async () => {
    if(!input.trim()) return
    const userMsg = {role:'user', content:input}
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)
    try{
      if(!apiKey.trim().startsWith('gsk_')){
        throw new Error('Invalid key - get new key at console.groq.com/keys')
      }
      // NEW MODEL THAT WORKS IN 2026
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization': 'Bearer ' + apiKey.trim()
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            {role:'system', content: 'You are ChaiBetter - a friendly, flirty, fun AI. Keep replies short under 80 words.'},
            ...newMsgs.slice(-8).map((m:any)=>({role:m.role, content:m.content}))
          ],
          max_tokens: 400,
          temperature: 0.8
        })
      })
      const data = await res.json()
      if(!res.ok){
        throw new Error(data.error?.message || 'Groq error: ' + res.status)
      }
      const reply = data.choices?.[0]?.message?.content || 'hey, say that again?'
      setMessages([...newMsgs, {role:'assistant', content: reply}])
    }catch(e:any){
      setMessages([...newMsgs, {role:'assistant', content: '⚠️ ' + (e.message || e)}])
      setShowKey(true)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div style={{maxWidth:600, margin:'0 auto', padding:16, background:'#0a0a0a', color:'white', minHeight:'100vh', fontFamily:'sans-serif'}}>
      {showKey && (
        <div style={{background:'#1e1e1e', padding:16, borderRadius:12, marginBottom:16, border:'1px solid #333'}}>
          <h3 style={{margin:'0 0 8px 0'}}>Enter Groq API Key</h3>
          <input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="gsk_..." style={{width:'100%', padding:12, background:'#2a2a2a', color:'white', border:'1px solid #444', borderRadius:8, boxSizing:'border-box'}}/>
          <button onClick={saveKey} style={{marginTop:10, background:'#ff2a6d', border:0, padding:'12px 16px', borderRadius:8, color:'#fff', width:'100%', fontWeight:'bold', cursor:'pointer'}}>Save Key</button>
          <a href="https://console.groq.com/keys" target="_blank" style={{color:'#ffeb3b', fontSize:13, display:'block', marginTop:8}}>Get key at console.groq.com/keys</a>
          <p style={{fontSize:11, color:'#888', marginTop:8}}>Delete old key gsk_j3Sx... you posted - create new one!</p>
        </div>
      )}
      <h1 style={{margin:0}}>ChaiBetter ☕</h1>
      <p style={{color:'#888', fontSize:13, marginTop:4}}>Free AI Chat</p>
      <div style={{height:450, overflowY:'auto', background:'#151515', padding:12, borderRadius:12, marginTop:16, border:'1px solid #222'}}>
        {messages.length===0 && <div style={{color:'#555', textAlign:'center', marginTop:100}}>Say hi to start chatting...</div>}
        {messages.map((m,i)=><div key={i} style={{margin:'10px 0', textAlign: m.role==='user'?'right':'left'}}><span style={{background: m.role==='user'?'#ff2a6d':'#2a2a2a', padding:'10px 14px', borderRadius:16, display:'inline-block', maxWidth:'80%', textAlign:'left'}}>{m.content}</span></div>)}
        {loading && <div style={{color:'#888', fontSize:13}}>typing...</div>}
      </div>
      <div style={{display:'flex', gap:8, marginTop:14}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendMessage()} placeholder="Type a message..." style={{flex:1, padding:14, borderRadius:12, background:'#1f1f1f', color:'white', border:'1px solid #333', outline:'none'}}/>
        <button onClick={sendMessage} disabled={loading} style={{background:'#ff2a6d', border:0, padding:'0 22px', borderRadius:12, color:'#fff', fontWeight:'bold', cursor:'pointer'}}>Send</button>
      </div>
    </div>
  )
}
