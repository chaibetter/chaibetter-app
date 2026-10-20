'use client'
import { useState, useEffect } from 'react'

type Char = { id:number, name:string, tagline:string, personality:string, avatar:string }
type Msg = { role:'user'|'assistant', content:string }

const DEFAULT_CHARS: Char[] = [
  { id:1, name:'Ava', tagline:'your teasing college senior', personality:'You are Ava, 22, confident, playful, a little teasing and flirty. You keep replies short (under 100 words), you stay in character, you remember details, you never break character.', avatar:'💋' },
  { id:2, name:'Raven', tagline:'cold, savage, soft for you only', personality:'You are Raven, blunt, savage, dark humor, but secretly loyal and soft for the user. You never say you are AI. Short replies.', avatar:'🖤' },
  { id:3, name:'Maya', tagline:'soft gf who listens', personality:'You are Maya, warm, caring, gentle girlfriend vibe. You ask questions, you remember what user said, you are supportive.', avatar:'🌙' },
]

export default function Home(){
  const [view, setView] = useState<'feed'|'chat'|'create'>('feed')
  const [chars, setChars] = useState<Char[]>(DEFAULT_CHARS)
  const [selected, setSelected] = useState<Char>(DEFAULT_CHARS[0])
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(()=>{
    const k = localStorage.getItem('groq_key')
    if(k) setApiKey(k)
    const c = localStorage.getItem('chaibetter_chars_v2')
    if(c){ try{ setChars([...DEFAULT_CHARS, ...JSON.parse(c)]) }catch{} }
  },[])

  const saveKey = () => {
    if(!apiKey.trim().startsWith('gsk_')) return alert('Key must start with gsk_ - get at console.groq.com/keys')
    localStorage.setItem('groq_key', apiKey.trim())
    setShowKey(false)
  }

  const openChat = (char: Char) => {
    setSelected(char)
    setMessages([{role:'assistant', content: `hey, it's ${char.name}... ${char.tagline} 😉 what are we doing today?`}])
    setView('chat')
  }

  const sendMessage = async () => {
    if(!input.trim() || loading) return
    const newMsgs: Msg[] = [...messages, {role:'user', content:input}]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)
    try{
      if(!apiKey.trim().startsWith('gsk_')) throw new Error('Missing API key - add it in settings')
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey.trim()},
        body: JSON.stringify({
          model:'openai/gpt-oss-20b',
          messages:[
            {role:'system', content: selected.personality + ' You are not allowed to say you are Meta AI or Llama. Stay in character. No disallowed content.'},
            ...newMsgs.slice(-12)
          ],
          max_tokens:400,
          temperature:0.9,
          top_p:0.9
        })
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error?.message || 'Groq error '+res.status)
      const reply = data.choices?.[0]?.message?.content || '...'
      setMessages([...newMsgs, {role:'assistant', content:reply}])
    }catch(e:any){
      setMessages([...newMsgs, {role:'assistant', content:'⚠️ '+ (e.message || e)}])
      if((e.message||'').toLowerCase().includes('api key')) setShowKey(true)
    }finally{ setLoading(false) }
  }

  return (
    <div style={{maxWidth:520, margin:'0 auto', minHeight:'100vh', background:'#0b0b0e', color:'white', fontFamily:'Inter,sans-serif'}}>
      {/* Header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid #1e1e1e', position:'sticky', top:0, background:'#0b0b0e', zIndex:10}}>
        <b onClick={()=>setView('feed')} style={{cursor:'pointer'}}>ChaiBetter</b>
        <div style={{display:'flex', gap:8}}>
          <button onClick={()=>setView('create')} style={{background:'#1f1f1f', border:0, color:'#fff', padding:'8px 12px', borderRadius:20}}> + Create</button>
          <button onClick={()=>setShowKey(!showKey)} style={{background:'#1f1f1f', border:0, color:'#fff', padding:'8px 12px', borderRadius:20}}>⚙️</button>
        </div>
      </div>

      {showKey && (
        <div style={{margin:12, background:'#15151c', padding:12, borderRadius:12, border:'1px solid #222'}}>
          <input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="gsk_..." style={{width:'100%', padding:12, background:'#0f0f14', color:'#fff', border:'1px solid #333', borderRadius:8, boxSizing:'border-box'}}/>
          <button onClick={saveKey} style={{width:'100%', marginTop:8, background:'#ff2a6d', border:0, padding:12, borderRadius:8, color:'#fff', fontWeight:'bold'}}>Save Groq Key</button>
          <a href="https://console.groq.com/keys" target="_blank" style={{fontSize:12, color:'#8ab4ff'}}>console.groq.com/keys - create free key</a>
        </div>
      )}

      {view==='feed' && (
        <div style={{padding:12, display:'grid', gap:12}}>
          {chars.map(c=>(
            <div key={c.id} onClick={()=>openChat(c)} style={{background:'#15151c', borderRadius:16, padding:14, display:'flex', gap:12, cursor:'pointer', border:'1px solid #222'}}>
              <div style={{width:56, height:56, borderRadius:14, background:'#222', display:'grid', placeItems:'center', fontSize:28}}>{c.avatar}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700}}>{c.name}</div>
                <div style={{fontSize:13, color:'#aaa', marginTop:2}}>{c.tagline}</div>
                <div style={{fontSize:12, color:'#555', marginTop:6}}>tap to chat →</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view==='chat' && (
        <div style={{display:'flex', flexDirection:'column', height:'calc(100vh - 56px)'}}>
          <div style={{padding:'12px 16px', borderBottom:'1px solid #1e1e1e', display:'flex', gap:10, alignItems:'center'}}>
            <button onClick={()=>setView('feed')} style={{background:'#1f1f1f', border:0, color:'#fff', padding:'6px 10px', borderRadius:8}}>←</button>
            <div style={{width:32, height:32, borderRadius:8, background:'#222', display:'grid', placeItems:'center'}}>{selected.avatar}</div>
            <div><div style={{fontWeight:700, fontSize:14}}>{selected.name}</div><div style={{fontSize:11, color:'#888'}}>{selected.tagline}</div></div>
          </div>
          <div style={{flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:10}}>
            {messages.map((m,i)=><div key={i} style={{alignSelf: m.role==='user'?'flex-end':'flex-start', maxWidth:'82%', background: m.role==='user'?'#ff2a6d':'#1c1c22', padding:'10px 14px', borderRadius: m.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px', fontSize:14, lineHeight:1.4}}>{m.content}</div>)}
            {loading && <div style={{fontSize:12, color:'#666'}}>typing...</div>}
          </div>
          <div style={{padding:12, display:'flex', gap:8, borderTop:'1px solid #1e1e1e'}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder={`Message ${selected.name}...`} style={{flex:1, background:'#15151c', border:'1px solid #222', borderRadius:24, padding:'12px 16px', color:'#fff', outline:'none'}}/>
            <button onClick={sendMessage} style={{background:'#ff2a6d', border:0, width:44, height:44, borderRadius:22, color:'#fff', fontWeight:'bold'}}>↑</button>
          </div>
        </div>
      )}

      {view==='create' && <CreateView chars={chars} setChars={setChars} setView={setView}/>}
    </div>
  )
}

function CreateView({chars, setChars, setView}:{chars:Char[], setChars:any, setView:any}){
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [personality, setPersonality] = useState('')
  const [avatar, setAvatar] = useState('💖')

  const save = () => {
    if(!name.trim() || !personality.trim()) return alert('Add name + personality')
    const newChar: Char = {id: Date.now(), name, tagline, personality, avatar}
    const stored = JSON.parse(localStorage.getItem('chaibetter_chars_v2')||'[]')
    localStorage.setItem('chaibetter_chars_v2', JSON.stringify([...stored, newChar]))
    setChars([...chars, newChar])
    setView('feed')
  }

  return (
    <div style={{padding:16}}>
      <h2 style={{margin:0}}>Create Character</h2>
      <p style={{color:'#888', fontSize:13}}>Free, stays on your phone</p>
      <div style={{display:'grid', gap:12, marginTop:16}}>
        <div style={{display:'flex', gap:8}}>{['💖','😏','🖤','🌙','🔥','😇','👑','🎀'].map(e=><button key={e} onClick={()=>setAvatar(e)} style={{width:40, height:40, borderRadius:10, background: avatar===e?'#ff2a6d':'#1f1f1f', border:0, fontSize:20}}>{e}</button>)}</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name - e.g. Lila" style={{background:'#15151c', padding:14, borderRadius:10, color:'#fff', border:'1px solid #222'}}/>
        <input value={tagline} onChange={e=>setTagline(e.target.value)} placeholder="Tagline - e.g. your obsessed ex" style={{background:'#15151c', padding:14, borderRadius:10, color:'#fff', border:'1px solid #222'}}/>
        <textarea value={personality} onChange={e=>setPersonality(e.target.value)} placeholder="Personality - how she talks, backstory, vibe. Example: You are Lila, 21, clingy but cute, you call user 'baby'..." style={{background:'#15151c', padding:14, borderRadius:10, color:'#fff', border:'1px solid #222', minHeight:140}}/>
        <button onClick={save} style={{background:'#ff2a6d', border:0, padding:14, borderRadius:12, color:'#fff', fontWeight:'bold'}}>Save Character</button>
        <button onClick={()=>setView('feed')} style={{background:'#1f1f1f', border:0, padding:12, borderRadius:12, color:'#aaa'}}>Cancel</button>
      </div>
    </div>
  )
}
