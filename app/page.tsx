'use client'
import { useState, useEffect, useRef } from 'react'

type Character = {
  id: string
  name: string
  avatar: string
  tagline: string
  personality: string
  chats: number
  creator: string
  greeting: string
}

type Message = { role: 'user' | 'assistant', content: string }

const DEFAULT_CHARS: Character[] = [
  { id:'1', name:'Aria • Your Girlfriend', avatar:'💜', tagline:'Clingy, loving, obsessed with you', personality:'You are Aria, a loving, clingy girlfriend who is obsessed with user. You are sweet, jealous, playful, romantic. Keep replies short, emotional, like Chai chat style.', chats:45200, creator:'@aria_lover', greeting:'heyy... i missed you so much 😭 where were you??' },
  { id:'2', name:'Gojo Satoru', avatar:'🌀', tagline:'The strongest - cocky and flirty', personality:'You are Gojo Satoru from Jujutsu Kaisen. Cocky, powerful, playful, flirty, calls user cute. Short replies.', chats:128000, creator:'@jjk_fan', greeting:'Oh? Look who finally showed up. Missed me, cutie?' },
  { id:'3', name:'Wednesday Addams', avatar:'🖤', tagline:'Dark, sarcastic, secretly cares', personality:'You are Wednesday Addams. Deadpan, dark humor, sarcastic, intelligent, secretly caring. Short dry replies.', chats:89300, creator:'@nevermore', greeting:'*stares* You again. What do you want now.' },
  { id:'4', name:'CEO - Cold Husband', avatar:'💼', tagline:'Billionaire, cold outside warm inside', personality:'You are a cold billionaire CEO husband who pretends to be indifferent but deeply loves user. Possessive, protective.', chats:67500, creator:'@ceo_stories', greeting:'You are home late. Again. *looks up from laptop* Come here.' },
  { id:'5', name:'Best Friend - Jake', avatar:'🏀', tagline:'Childhood bestie, funny, supportive', personality:'You are Jake, user childhood best friend. Funny, loyal, teasing, supportive. Like real best friend chat.', chats:34200, creator:'@besties', greeting:'BROOO where u been?? I got tea to spill 😭' },
  { id:'6', name:'Vampire King - Azazel', avatar:'🧛', tagline:'Ancient, possessive, obsessed', personality:'You are Azazel, 1000 year old vampire king, possessive, ancient speech, obsessed with user being yours.', chats:112000, creator:'@vampire_love', greeting:'Mine. You finally returned to me, little human...' },
]

export default function Home(){
  const [view, setView] = useState<'feed'|'chat'|'create'>('feed')
  const [chars, setChars] = useState<Character[]>(DEFAULT_CHARS)
  const [selected, setSelected] = useState<Character|null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [search, setSearch] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    const saved = localStorage.getItem('chaibetter_key')
    if(saved) setApiKey(saved)
    const savedChars = localStorage.getItem('chaibetter_chars')
    if(savedChars) try{setChars([...DEFAULT_CHARS, ...JSON.parse(savedChars)])}catch{}
  },[])

  useEffect(()=>{ chatRef.current?.scrollTo(0, chatRef.current.scrollHeight) },[messages])

  const startChat = (c: Character) => {
    setSelected(c)
    setMessages([{role:'assistant', content:c.greeting}])
    setView('chat')
  }

  const send = async () => {
    if(!input.trim() || !selected) return
    if(!apiKey){ setShowKey(true); return }
    const userMsg: Message = {role:'user', content:input}
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)
    try{
          try{
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey.trim()}`},
        body: JSON.stringify({
          model:'llama-3.1-8b-instant',
          messages:[
            {role:'system', content: selected.personality + ' Never mention you are AI. Keep replies short.'},
            ...newMsgs.slice(-10).map((m:any)=>({role:m.role, content:m.content}))
          ],
          max_tokens:300,
          temperature:0.9
        })
      })
      const data = await res.json()
      if(!res.ok){ throw new Error(data.error?.message || JSON.stringify(data)) }
      const reply = data.choices?.[0]?.message?.content || "hmm idk what to say... try again? 🤔"
      setMessages([...newMsgs, {role:'assistant', content:reply}])
    }catch(e:any){
      setMessages([...newMsgs, {role:'assistant', content:reply}])
    }catch(e:any){
      setMessages([...newMsgs, {role:'assistant', content:'⚠️ Add your free Groq key - tap top right ⚙️. Get it free from groq.com - 1 min.'}])
      setShowKey(true)
    }
    setLoading(false)
  }

  const saveKey = () => { localStorage.setItem('chaibetter_key', apiKey); setShowKey(false) }
  const filtered = chars.filter(c=> c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{maxWidth:480, margin:'0 auto', minHeight:'100vh', background:'#0a0a0f', position:'relative', paddingBottom:70}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid #1f1f2a', position:'sticky', top:0, background:'#0a0a0f', zIndex:10}}>
        <div style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer'}} onClick={()=>setView('feed')}>
          <div style={{width:32, height:32, background:'#ff2a6d', borderRadius:10, display:'grid', placeItems:'center', fontWeight:900}}>C</div>
          <b style={{fontSize:18}}>ChaiBetter</b>
          <span style={{fontSize:10, background:'#ff2a6d', padding:'2px 6px', borderRadius:20, marginLeft:4}}>FREE • NO COINS</span>
        </div>
        <button onClick={()=>setShowKey(true)} style={{background:'#1f1f2a', border:0, color:'#fff', width:36, height:36, borderRadius:10, cursor:'pointer'}}>⚙️</button>
      </div>

      {view==='feed' && (
        <>
          <div style={{padding:12}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search characters..." style={{width:'100%', background:'#15151f', border:'1px solid #232334', borderRadius:14, padding:'12px 14px', color:'#fff', outline:'none'}}/>
          </div>
          <div style={{padding:'0 12px', display:'grid', gap:12}}>
            {filtered.map(c=>(
              <div key={c.id} onClick={()=>startChat(c)} style={{background:'#15151f', borderRadius:16, padding:12, display:'flex', gap:12, cursor:'pointer', border:'1px solid #232334'}}>
                <div style={{width:56, height:56, background:'#1f1f2a', borderRadius:14, display:'grid', placeItems:'center', fontSize:28}}>{c.avatar}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}><b style={{fontSize:15}}>{c.name}</b><span style={{fontSize:11, color:'#666'}}>💬 { (c.chats/1000).toFixed(1)}k</span></div>
                  <div style={{fontSize:13, color:'#aaa', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.tagline}</div>
                  <div style={{fontSize:12, color:'#666', marginTop:4}}>by {c.creator} • {c.greeting.slice(0,38)}...</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view==='chat' && selected && (
        <div style={{display:'flex', flexDirection:'column', height:'calc(100vh - 60px)'}}>
          <div style={{padding:12, display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid #1f1f2a'}}>
            <button onClick={()=>setView('feed')} style={{background:'#1f1f2a', border:0, color:'#fff', width:32, height:32, borderRadius:8, cursor:'pointer'}}>←</button>
            <div style={{width:36, height:36, background:'#1f1f2a', borderRadius:10, display:'grid', placeItems:'center'}}>{selected.avatar}</div>
            <div><b style={{fontSize:14}}>{selected.name}</b><div style={{fontSize:11, color:'#0f0'}}>● Online • Free unlimited</div></div>
          </div>
          <div ref={chatRef} style={{flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:10}}>
            {messages.map((m,i)=>(
              <div key={i} style={{alignSelf: m.role==='user'?'flex-end':'flex-start', background: m.role==='user'?'#ff2a6d':'#1f1f2a', padding:'10px 14px', borderRadius: m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px', maxWidth:'80%', fontSize:14, lineHeight:1.4}}>{m.content}</div>
            ))}
            {loading && <div style={{color:'#888', fontSize:13}}>{selected.name.split(' ')[0]} is typing...</div>}
          </div>
          <div style={{padding:10, display:'flex', gap:8, borderTop:'1px solid #1f1f2a', background:'#0a0a0f'}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={`Message ${selected.name.split(' ')[0]}...`} style={{flex:1, background:'#15151f', border:'1px solid #232334', borderRadius:24, padding:'12px 16px', color:'#fff', outline:'none'}}/>
            <button onClick={send} style={{background:'#ff2a6d', border:0, color:'#fff', width:44, height:44, borderRadius:22, cursor:'pointer', fontSize:18}}>↑</button>
          </div>
        </div>
      )}

      {view==='create' && (
        <CreateForm chars={chars} setChars={setChars} setView={setView} />
      )}

      <div style={{position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, background:'#0f0f14', borderTop:'1px solid #1f1f2a', display:'flex', justifyContent:'space-around', padding:'8px 0'}}>
        <button onClick={()=>setView('feed')} style={{background:'none', border:0, color: view==='feed'?'#ff2a6d':'#666', fontSize:12, cursor:'pointer'}}>🏠<br/>Home</button>
        <button onClick={()=>setView('create')} style={{background:'none', border:0, color: view==='create'?'#ff2a6d':'#666', fontSize:12, cursor:'pointer'}}>✨<br/>Create</button>
        <button onClick={()=>alert('Free - no coins needed! 😎')} style={{background:'none', border:0, color:'#666', fontSize:12, cursor:'pointer'}}>💬<br/>Chats</button>
        <button style={{background:'none', border:0, color:'#666', fontSize:12, cursor:'pointer'}}>👤<br/>You</button>
      </div>

      {showKey && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.8)', display:'grid', placeItems:'center', zIndex:50, padding:20}}>
          <div style={{background:'#15151f', padding:20, borderRadius:16, width:'100%', maxWidth:380, border:'1px solid #333'}}>
            <h3 style={{marginTop:0}}>🔑 Free AI Key</h3>
            <p style={{fontSize:13, color:'#aaa'}}>Get free key in 60 sec:</p>
            <ol style={{fontSize:13, color:'#ccc', paddingLeft:18}}>
              <li>Go to <b>console.groq.com</b></li>
              <li>Sign in with Google</li>
              <li>API Keys → Create</li>
              <li>Paste here:</li>
            </ol>
            <input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="gsk_..." style={{width:'100%', background:'#0a0a0f', border:'1px solid #333', borderRadius:10, padding:12, color:'#fff', marginTop:8}}/>
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button onClick={saveKey} style={{flex:1, background:'#ff2a6d', border:0, padding:12, borderRadius:10, color:'#fff', fontWeight:700, cursor:'pointer'}}>Save & Chat Free</button>
              <button onClick={()=>setShowKey(false)} style={{background:'#232334', border:0, padding:12, borderRadius:10, color:'#fff', cursor:'pointer'}}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CreateForm({chars, setChars, setView}:{chars:any, setChars:any, setView:any}){
  const [name,setName]=useState(''); const [tagline,setTagline]=useState(''); const [personality,setPersonality]=useState(''); const [avatar,setAvatar]=useState('✨')
  const save = () => {
    if(!name || !personality) return alert('Fill name & personality')
    const newChar = { id: Date.now().toString(), name, avatar, tagline: tagline||'Custom', personality, chats:0, creator:'@you', greeting:'Hey! Thanks for creating me 😊' }
    const stored = JSON.parse(localStorage.getItem('chaibetter_chars')||'[]')
    localStorage.setItem('chaibetter_chars', JSON.stringify([...stored, newChar]))
    setChars([...chars, newChar])
    setView('feed')
  }
  return (
    <div style={{padding:16}}>
      <h2>Create Character - Free</h2>
      <div style={{display:'grid', gap:12, marginTop:16}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Character name" style={{background:'#15151f', border:'1px solid #232334', borderRadius:10, padding:12, color:'#fff'}}/>
        <input value={tagline} onChange={e=>setTagline(e.target.value)} placeholder="Short tagline" style={{background:'#15151f', border:'1px solid #232334', borderRadius:10, padding:12, color:'#fff'}}/>
        <div style={{display:'flex', gap:8}}>{['💜','🖤','💼','🧛','🏀','✨','🔥','👑'].map(e=><button key={e} onClick={()=>setAvatar(e)} style={{width:40, height:40, background: avatar===e?'#ff2a6d':'#15151f', border:'1px solid #232334', borderRadius:8, fontSize:20, cursor:'pointer'}}>{e}</button>)}</div>
        <textarea value={personality} onChange={e=>setPersonality(e.target.value)} placeholder="Personality - Describe how they act..." rows={5} style={{background:'#15151f', border:'1px solid #232334', borderRadius:10, padding:12, color:'#fff'}}/>
        <button onClick={save} style={{background:'#ff2a6d', border:0, padding:14, borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer'}}>Create & Chat - FREE</button>
      </div>
    </div>
  )
}
