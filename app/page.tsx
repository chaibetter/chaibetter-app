'use client'
import { useState, useEffect } from 'react'

export default function Home(){
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [view, setView] = useState('feed')
  const [chars, setChars] = useState<any[]>([])
  const [selected, setSelected] = useState<any>({personality: 'You are a friendly assistant', name:'ChaiBetter'})

  useEffect(()=>{
    const k = localStorage.getItem('groq_key')
    if(k) setApiKey(k)
    else setShowKey(true)
    const c = localStorage.getItem('chaibetter_chars')
    if(c){ try{ setChars(JSON.parse(c)) }catch{} }
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
    const newMsgs = [...messages, {role:'user', content:input}]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)
    try{
      if(!apiKey || !apiKey.trim().startsWith('gsk_')){
        throw new Error('Invalid API key - get new one at console.groq.com/keys')
      }
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {role:'system', content: selected.personality + ' Keep reply short, fun, under 80 words.'},
            ...newMsgs.slice(-10).map((m:any)=>({role:m.role, content:m.content}))
          ],
          max_tokens: 300,
          temperature: 0.9
        })
      })
      const data = await res.json()
      if(!res.ok){
        throw new Error(data.error?.message || 'Groq error '+res.status)
      }
      const reply = data.choices?.[0]?.message?.content || 'hmm try again?'
      setMessages([...newMsgs, {role:'assistant', content: reply}])
    }catch(e:any){
      setMessages([...newMsgs, {role:'assistant', content: 'Error: ' + (e.message || e)}])
      setShowKey(true)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div style={{maxWidth:600, margin:'0 auto', padding:16, background:'#0f0f0f', color:'white', minHeight:'100vh'}}>
      {showKey && (
        <div style={{background:'#222', padding:12, borderRadius:12, marginBottom:12}}>
          <p>Enter Groq API Key (gsk_...)</p>
          <input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="gsk_..." style={{width:'100%', padding:10, background:'#333', color:'white', border:'1px solid #555', borderRadius:8}}/>
          <button onClick={saveKey} style={{marginTop:8, background:'#ff2a6d', border:0, padding:'10px 16px', borderRadius:8, color:'#fff', width:'100%'}}>Save Key</button>
          <a href="https://console.groq.com/keys" target="_blank" style={{color:'#ff8', fontSize:12}}>Get key at console.groq.com/keys</a>
        </div>
      )}
      <h1>ChaiBetter ☕</h1>
      <div style={{height:400, overflowY:'auto', background:'#151515', padding:12, borderRadius:12}}>
        {messages.map((m,i)=><div key={i} style={{margin:'8px 0', textAlign: m.role==='user'?'right':'left'}}><span style={{background: m.role==='user'?'#ff2a6d':'#333', padding:'8px 12px', borderRadius:12, display:'inline-block'}}>{m.content}</span></div>)}
        {loading && <div>typing...</div>}
      </div>
      <div style={{display:'flex', gap:8, marginTop:12}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendMessage()} placeholder="Say hi..." style={{flex:1, padding:12, borderRadius:12, background:'#1f1f1f', color:'white', border:'1px solid #333'}}/>
        <button onClick={sendMessage} style={{background:'#ff2a6d', border:0, padding:'12px 18px', borderRadius:12, color:'#fff'}}>Send</button>
      </div>
    </div>
  )
}

function CreateForm({chars, setChars, setView}:{chars:any, setChars:any, setView:any}){
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [personality, setPersonality] = useState('')
  const save = () => {
    const stored = JSON.parse(localStorage.getItem('chaibetter_chars')||'[]')
    const newChar = {id: Date.now(), name, tagline, personality}
    localStorage.setItem('chaibetter_chars', JSON.stringify([...stored, newChar]))
    setChars([...chars, newChar])
    setView('feed')
  }
  return (
    <div style={{padding:16}}>
      <h2>Create Character - Free</h2>
      <div style={{display:'grid', gap:12, marginTop:16}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Character name" style={{background:'#15151f', padding:12, borderRadius:8, color:'white'}}/>
        <input value={tagline} onChange={e=>setTagline(e.target.value)} placeholder="Short tagline" style={{background:'#15151f', padding:12, borderRadius:8, color:'white'}}/>
        <div style={{display:'flex', gap:8}}>
          {['💖','💜','💼','👩','😊','⭐'].map(e=><button key={e} onClick={()=>setPersonality(personality + e)}>{e}</button>)}
        </div>
        <textarea value={personality} onChange={e=>setPersonality(e.target.value)} placeholder="Personality - Describe how they talk" style={{background:'#15151f', padding:12, borderRadius:8, color:'white', minHeight:100}}/>
        <button onClick={save} style={{background:'#ff2a6d', border:0, padding:14, borderRadius:12, color:'#fff', fontWeight:'bold'}}>Save Character</button>
      </div>
    </div>
  )
}
