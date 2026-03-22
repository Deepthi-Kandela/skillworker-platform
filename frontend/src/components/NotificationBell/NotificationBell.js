import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import API from '../../api/axios';
import './NotificationBell.css';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    await API.put('/notifications/all/read');
    setUnread(0);
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleClick = (n) => {
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="nb-wrap" ref={ref}>
      <button className="nb-btn" onClick={() => setOpen(!open)}>
        <FiBell size={20} />
        {unread > 0 && <span className="nb-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="nb-dropdown">
          <div className="nb-header">
            <span>🔔 Notifications</span>
            {unread > 0 && <button className="nb-mark-all" onClick={markAllRead}>Mark all read</button>}
          </div>
          <div className="nb-list">
            {notifications.length === 0 ? (
              <div className="nb-empty">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div key={n._id} className={`nb-item ${!n.isRead ? 'unread' : ''}`} onClick={() => handleClick(n)}>
                  <div className="nb-item-title">{n.title}</div>
                  <div className="nb-item-msg">{n.message}</div>
                  <div className="nb-item-time">{new Date(n.createdAt).toLocaleTimeString()}</div>
                </div>
              ))
            )}
          </div>
          <div className="nb-footer" onClick={() => { setOpen(false); navigate('/notifications'); }}>
            View All
          </div>
        </div>
      )}
    </div>
  );
}
