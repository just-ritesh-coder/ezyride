import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import styled, { keyframes } from "styled-components";
import { FaTimes, FaPaperPlane, FaComments } from "react-icons/fa";
import { API_BASE_URL } from "../utils/config";

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
      const res = await fetch(`${API_BASE_URL}/api/chats/${rideId}`, {
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
    const s = io(API_BASE_URL, { auth: { token } });
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
          <Title>
            <FaComments /> Ride Chat
          </Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>

        <Messages>
          {msgs.map((m) => (
            <Msg key={m._id} mine={m.sender?._id === "me"}>
              {m.message}
            </Msg>
          ))}
          {typing && (
            <Typing>
              <TypingDots>
                <span></span>
                <span></span>
                <span></span>
              </TypingDots>
              Someone is typing…
            </Typing>
          )}
          <div ref={messagesEndRef} />
        </Messages>

        <InputArea>
          <Input
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
          />
          <Send onClick={send}>
            <FaPaperPlane /> Send
          </Send>
        </InputArea>
      </Popup>
    </Overlay>
  );
};

export default ChatPanel;

/* ===========================
          STYLES
=========================== */

const slideUp = keyframes`
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Popup = styled.div`
  width: 400px;
  height: 550px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(30, 144, 255, 0.1);
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  @media (max-width: 500px) {
    width: 100%;
    height: 85%;
    border-radius: 24px 24px 0 0;
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: #fff;
  padding: 18px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(30, 144, 255, 0.3);
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  
  svg {
    font-size: 1.1rem;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 1.3rem;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

const Messages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(30, 144, 255, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(30, 144, 255, 0.5);
    }
  }
`;

const Msg = styled.div`
  align-self: ${(p) => (p.mine ? "flex-end" : "flex-start")};
  background: ${(p) =>
    p.mine
      ? "linear-gradient(135deg, #1e90ff 0%, #0066cc 100%)"
      : "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)"};
  color: ${(p) => (p.mine ? "#fff" : "#333")};
  padding: 12px 16px;
  border-radius: ${(p) => p.mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px"};
  max-width: 75%;
  word-break: break-word;
  font-size: 0.95rem;
  line-height: 1.5;
  box-shadow: ${(p) =>
    p.mine
      ? "0 4px 12px rgba(30, 144, 255, 0.3)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};
  animation: ${fadeIn} 0.3s ease-out;
  border: ${(p) => p.mine ? "none" : "1px solid rgba(30, 144, 255, 0.1)"};
`;

const Typing = styled.div`
  font-style: italic;
  color: #6b7280;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  border-radius: 12px;
  width: fit-content;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 4px;
  
  span {
    width: 6px;
    height: 6px;
    background: #1e90ff;
    border-radius: 50%;
    animation: ${pulse} 1.4s ease-in-out infinite;
    
    &:nth-child(1) {
      animation-delay: 0s;
    }
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
`;

const InputArea = styled.div`
  display: flex;
  padding: 16px 20px;
  border-top: 2px solid rgba(30, 144, 255, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  gap: 12px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid #e1e5e9;
  font-size: 15px;
  font-family: 'Poppins', sans-serif;
  background-color: #fafbfc;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    outline: none;
    box-shadow: 0 0 0 4px rgba(30, 144, 255, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Send = styled.button`
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3);
  min-height: 44px;
  
  svg {
    font-size: 0.9rem;
  }
  
  &:hover {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(30, 144, 255, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;
