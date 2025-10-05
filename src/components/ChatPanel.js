import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import styled from "styled-components";

const ChatPanel = ({ rideId, onClose }) => {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const popupRef = useRef(null);
  const token = localStorage.getItem("authToken");
  let typingTimeout = useRef(null);

  // Load chat history
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await fetch(`/api/chats/${rideId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (mounted) setMsgs(data.messages || []);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [rideId, token]);

  // Connect socket
  useEffect(() => {
    const s = io("/", { auth: { token } });
    socketRef.current = s;
    s.emit("chat:join", { rideId });
    s.on("chat:message", ({ chat }) => {
      setMsgs((prev) => [...prev, chat]);
    });
    s.on("chat:typing", ({ typing }) => {
      setTyping(!!typing);
    });
    return () => {
      s.disconnect();
    };
  }, [rideId, token]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Send message
  const send = () => {
    const t = text.trim();
    if (!t) return;
    const mine = {
      _id: `tmp-${Date.now()}`,
      sender: { _id: "me" },
      message: t,
      createdAt: new Date().toISOString(),
    };
    setMsgs((prev) => [...prev, mine]);
    setText("");
    socketRef.current?.emit("chat:message", { rideId, text: t });
    socketRef.current?.emit("chat:typing", { rideId, typing: false });
  };

  // Handle typing with debounce
  const handleTyping = (e) => {
    setText(e.target.value);
    socketRef.current?.emit("chat:typing", { rideId, typing: true });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit("chat:typing", { rideId, typing: false });
    }, 1000);
  };

  // Send on Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <Overlay>
      <Popup ref={popupRef}>
        <Header>
          <Title>Ride Chat</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Messages>
          {msgs.map((m) => (
            <Msg key={m._id} mine={m.sender?._id === "me"}>
              {m.message}
            </Msg>
          ))}
          {typing && <Typing>Someone is typing…</Typing>}
          <div ref={messagesEndRef} />
        </Messages>

        <InputArea>
          <Input
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
          />
          <Send onClick={send}>Send</Send>
        </InputArea>
      </Popup>
    </Overlay>
  );
};

export default ChatPanel;

/* ===========================
          STYLES
=========================== */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  z-index: 1000;
`;

const Popup = styled.div`
  width: 380px;
  height: 480px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 500px) {
    width: 100%;
    height: 80%;
    border-radius: 20px 20px 0 0;
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, #1e90ff, #0066cc);
  color: #fff;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.4rem;
  cursor: pointer;
`;

const Messages = styled.div`
  flex: 1;
  padding: 14px;
  overflow-y: auto;
  background: #f8fbff;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Msg = styled.div`
  align-self: ${(p) => (p.mine ? "flex-end" : "flex-start")};
  background: ${(p) =>
    p.mine ? "linear-gradient(135deg, #1e90ff, #0066cc)" : "#e6f0ff"};
  color: ${(p) => (p.mine ? "#fff" : "#333")};
  padding: 10px 14px;
  border-radius: 14px;
  max-width: 75%;
  word-break: break-word;
`;

const Typing = styled.div`
  font-style: italic;
  color: #6b7280;
  font-size: 0.9rem;
`;

const InputArea = styled.div`
  display: flex;
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  border: 2px solid #e1e5e9;
  font-size: 1rem;
  &:focus {
    border-color: #1e90ff;
    outline: none;
    box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1);
  }
`;

const Send = styled.button`
  background: linear-gradient(135deg, #1e90ff, #0066cc);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  margin-left: 10px;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    transform: translateY(-2px);
  }
`;
