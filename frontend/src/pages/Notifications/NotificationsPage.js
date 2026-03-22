import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Spinner, EmptyState } from '../../components/common';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Notifications.css';

const TYPE_ICONS = { booking: '📅', payment: '💳', chat: '💬', review: '⭐', system: '🔔' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/notifications')
      .then(({ data }) => setNotifications(data.notifications))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await API.put('/notifications/all/read');
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    toast.success('All marked as read');
  };

  const handleClick = async (n) => {
    if (!n.isRead) {
      await API.put(`/notifications/${n._id}/read`);
      setNotifications(notifications.map(x => x._id === n._id ? { ...x, isRead: true } : x));
    }
    if (n.link) navigate(n.link);
  };

  if (loading) return <Spinner />;

  return (
    <div className="notif-page">
      <div className="notif-container">
        <div className="notif-header">
          <h1>🔔 Notifications</h1>
          {notifications.some(n => !n.isRead) && (
            <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark All Read</button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications" subtitle="You're all caught up!" />
        ) : (
          <div className="notif-list card">
            {notifications.map(n => (
              <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`} onClick={() => handleClick(n)}>
                <div className="notif-icon">{TYPE_ICONS[n.type] || '🔔'}</div>
                <div className="notif-body">
                  <p className="notif-title">{n.title}</p>
                  <p className="notif-msg">{n.message}</p>
                  <p className="notif-time">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <div className="notif-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
