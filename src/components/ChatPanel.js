import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const ChatPanel = ({ rideId, onClose }) => {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const socketRef = useRef(null);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await fetch(`/api/chats/${rideId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (mounted) setMsgs(data.messages || []);
    };
    load();
    return () => { mounted = false; };
  }, [rideId, token]);

  useEffect(() => {
    const s = io('/', { auth: { token } });
    socketRef.current = s;
    s.emit('chat:join', { rideId });
    s.on('chat:message', ({ chat }) => {
      setMsgs((prev) => [...prev, chat]);
    });
    s.on('chat:typing', ({ userId, typing }) => {
      setTyping(!!typing);
    });
    return () => { s.disconnect(); };
  }, [rideId, token]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    // optimistic
    const mine = { _id: `tmp-${Date.now()}`, sender: { _id: 'me' }, message: t, createdAt: new Date().toISOString() };
    setMsgs((prev) => [...prev, mine]);
    setText('');
    socketRef.current?.emit('chat:message', { rideId, text: t });
    // fallback REST (optional)
    // await fetch(`/api/chats/${rideId}`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ message: t }) });
  };

  return (
    <div style={{ position:'fixed', bottom:0, right:0, width: 360, height: 420, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, boxShadow:'0 10px 30px rgba(0,0,0,0.15)', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:10, borderBottom:'1px solid #eee', fontWeight:800 }}>Ride Chat</div>
      <div style={{ flex:1, padding:10, overflowY:'auto' }}>
        {msgs.map((m) => (
          <div key={m._id} style={{ margin:'6px 0', textAlign: m.sender?._id === 'me' ? 'right' : 'left' }}>
            <div style={{ display:'inline-block', background: m.sender?._id === 'me' ? '#e7f0ff' : '#f3f4f6', padding:'8px 10px', borderRadius:10 }}>{m.message}</div>
          </div>
        ))}
        {typing && <div style={{ color:'#6b7280', fontStyle:'italic' }}>Someone is typing…</div>}
      </div>
      <div style={{ display:'flex', gap:8, padding:10, borderTop:'1px solid #eee' }}>
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); socketRef.current?.emit('chat:typing', { rideId, typing: true }); }}
          onBlur={() => socketRef.current?.emit('chat:typing', { rideId, typing: false })}
          placeholder="Type a message"
          style={{ flex:1, padding:'10px 12px', border:'1px solid #ddd', borderRadius:10 }}
        />
        <button onClick={send} style={{ padding:'10px 12px', border:'none', borderRadius:10, background:'#1e90ff', color:'#fff', fontWeight:800 }}>Send</button>
        <button onClick={onClose} style={{ padding:'10px 12px', border:'1px solid #eee', borderRadius:10, background:'#fff', color:'#111' }}>Close</button>
      </div>
    </div>
  );
};

export default ChatPanel;
