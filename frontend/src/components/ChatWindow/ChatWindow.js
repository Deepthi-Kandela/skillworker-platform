import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FiSend, FiX } from 'react-icons/fi';
import './ChatWindow.css';

let socket;

export default function ChatWindow({ bookingId, otherUser, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef();

  useEffect(() => {
    socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socket.emit('joinRoom', bookingId);

    socket.on('newMessage', (msg) => {
      setMessages(prev => {
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    API.get(`/chat/${bookingId}`)
      .then(({ data }) => setMessages(data))
      .finally(() => setLoading(false));

    return () => {
      socket.emit('leaveRoom', bookingId);
      socket.disconnect();
    };
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await API.post(`/chat/${bookingId}`, { text });
      setText('');
    } catch {}
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user">
          <img
            src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${otherUser?.name}&background=6C63FF&color=fff`}
            alt={otherUser?.name}
            className="chat-avatar"
          />
          <div>
            <p className="chat-name">{otherUser?.name}</p>
            <span className="chat-online">● Online</span>
          </div>
        </div>
        {onClose && <button className="chat-close" onClick={onClose}><FiX /></button>}
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">No messages yet. Say hello! 👋</div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
            return (
              <div key={msg._id || i} className={`chat-msg ${isMine ? 'mine' : 'theirs'}`}>
                <div className="chat-bubble">{msg.text}</div>
                <span className="chat-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="chat-send-btn" disabled={!text.trim()}>
          <FiSend size={18} />
        </button>
      </form>
    </div>
  );
}
