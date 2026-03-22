import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Spinner, EmptyState } from '../../components/common';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import { useAuth } from '../../context/AuthContext';
import './Chat.css';

export default function ChatPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/bookings/my')
      .then(({ data }) => setBookings(data.filter(b => ['accepted', 'in-progress', 'on-the-way', 'completed'].includes(b.status))))
      .finally(() => setLoading(false));
  }, []);

  const getOtherUser = (b) => user?.role === 'customer' ? b.worker : b.customer;

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <h2 className="chat-sidebar-title">💬 Messages</h2>
        {loading ? <Spinner /> : bookings.length === 0 ? (
          <EmptyState icon="💬" title="No chats yet" subtitle="Accept a booking to start chatting" />
        ) : (
          bookings.map(b => {
            const other = getOtherUser(b);
            return (
              <div
                key={b._id}
                className={`chat-contact ${selected?._id === b._id ? 'active' : ''}`}
                onClick={() => setSelected(b)}
              >
                <img
                  src={other?.avatar || `https://ui-avatars.com/api/?name=${other?.name}&background=6C63FF&color=fff`}
                  alt={other?.name}
                  className="chat-contact-avatar"
                />
                <div className="chat-contact-info">
                  <p className="chat-contact-name">{other?.name}</p>
                  <p className="chat-contact-service">{b.service}</p>
                </div>
                <span className={`chat-contact-status status-${b.status}`}>{b.status}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="chat-main">
        {selected ? (
          <ChatWindow
            bookingId={selected._id}
            otherUser={getOtherUser(selected)}
          />
        ) : (
          <div className="chat-placeholder">
            <span>💬</span>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
