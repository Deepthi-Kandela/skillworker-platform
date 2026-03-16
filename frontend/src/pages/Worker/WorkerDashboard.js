import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { StatusBadge, Spinner, EmptyState } from '../../components/common';
import VoiceGuide from '../../components/VoiceGuide/VoiceGuide';
import { FiCalendar, FiDollarSign, FiStar, FiUsers, FiCheck, FiX, FiTrendingUp, FiClock, FiToggleLeft, FiToggleRight, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './WorkerDashboard.css';

export default function WorkerDashboard() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, pRes] = await Promise.all([
          API.get('/bookings/my'),
          API.get('/auth/profile'),
        ]);
        setBookings(bRes.data);
        setProfile(pRes.data.workerProfile);
        setAvailable(pRes.data.workerProfile?.isAvailable ?? true);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/bookings/${id}/status`, { status });
      setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
      toast.success(`${t('worker.dashboard')}: ${status}`);
    } catch { toast.error('Update failed'); }
  };

  const toggleAvailability = async () => {
    try {
      await API.put('/workers', { isAvailable: !available });
      setAvailable(!available);
      toast.success(!available ? t('worker.available') : t('worker.busy'));
    } catch { toast.error('Failed to update'); }
  };

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    accepted:  bookings.filter(b => b.status === 'accepted').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    earnings:  bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + b.amount, 0),
    inProgress: bookings.filter(b => b.status === 'in-progress').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <Spinner />;

  return (
    <div className="wd-page">

      {/* ── Header ── */}
      <div className="wd-header">
        <div>
          <h1 className="wd-title">⚡ {t('worker.dashboard')}</h1>
          <p className="wd-subtitle">{t('worker.register_skills')}</p>
        </div>
        <div className="wd-header-actions">
          <VoiceGuide script="accept_job" label={t('voice.voice_guide')} />
          <button className={`wd-avail-toggle ${available ? 'on' : 'off'}`} onClick={toggleAvailability}>
            {available ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
            {available ? t('worker.available') : t('worker.busy')}
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="wd-stats">
        {[
          { label: t('worker.total_bookings'), value: stats.total,     icon: '📋', color: '#6C63FF', bg: '#f0eeff' },
          { label: t('worker.pending'),        value: stats.pending,   icon: '⏳', color: '#F7971E', bg: '#fff8ee' },
          { label: t('worker.completed'),      value: stats.completed, icon: '✅', color: '#43E97B', bg: '#edfff5' },
          { label: t('worker.earnings'),       value: `₹${stats.earnings}`, icon: '💰', color: '#FF6584', bg: '#fff0f3' },
        ].map((s, i) => (
          <div key={i} className="wd-stat-card" style={{ '--card-color': s.color, '--card-bg': s.bg }}>
            <div className="wd-stat-icon">{s.icon}</div>
            <div className="wd-stat-info">
              <p className="wd-stat-val">{s.value}</p>
              <p className="wd-stat-label">{s.label}</p>
            </div>
            <div className="wd-stat-trend"><FiTrendingUp size={14} /></div>
          </div>
        ))}
      </div>

      {/* ── Profile + Progress ── */}
      {profile && (
        <div className="wd-profile-row">
          <div className="wd-profile-card">
            <div className="wd-profile-top">
              <div className="wd-profile-info">
                <h3>{profile.category}</h3>
                <div className="wd-profile-meta">
                  <span>⭐ {profile.rating}</span>
                  <span>📝 {profile.totalReviews} {t('common.reviews')}</span>
                  <span>📦 {profile.totalBookings} {t('worker.total_bookings')}</span>
                </div>
              </div>
              <div className="wd-profile-badges">
                <span className={`wd-badge ${profile.isVerified ? 'green' : 'yellow'}`}>
                  {profile.isVerified ? `✓ ${t('worker.verified')}` : '⏳ Pending'}
                </span>
                <span className={`wd-badge ${available ? 'green' : 'red'}`}>
                  {available ? `● ${t('worker.available')}` : `● ${t('worker.busy')}`}
                </span>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="wd-progress-section">
              <div className="wd-progress-item">
                <div className="wd-progress-label">
                  <span>Completion Rate</span><span>{completionRate}%</span>
                </div>
                <div className="wd-progress-bar">
                  <div className="wd-progress-fill green" style={{ width: `${completionRate}%` }} />
                </div>
              </div>
              <div className="wd-progress-item">
                <div className="wd-progress-label">
                  <span>Rating</span><span>{profile.rating}/5</span>
                </div>
                <div className="wd-progress-bar">
                  <div className="wd-progress-fill yellow" style={{ width: `${(profile.rating / 5) * 100}%` }} />
                </div>
              </div>
              <div className="wd-progress-item">
                <div className="wd-progress-label">
                  <span>Active Jobs</span><span>{stats.inProgress + stats.accepted}</span>
                </div>
                <div className="wd-progress-bar">
                  <div className="wd-progress-fill purple" style={{ width: `${Math.min(((stats.inProgress + stats.accepted) / Math.max(stats.total, 1)) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="wd-quick-stats">
            <h4>📊 Quick Overview</h4>
            {[
              { label: 'In Progress', value: stats.inProgress, color: '#6C63FF' },
              { label: 'Accepted',    value: stats.accepted,   color: '#43E97B' },
              { label: 'Pending',     value: stats.pending,    color: '#F7971E' },
              { label: 'Completed',   value: stats.completed,  color: '#2196F3' },
            ].map((q, i) => (
              <div key={i} className="wd-quick-item">
                <div className="wd-quick-dot" style={{ background: q.color }} />
                <span>{q.label}</span>
                <strong style={{ color: q.color }}>{q.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bookings ── */}
      <div className="wd-section-header">
        <h3>📅 {t('worker.total_bookings')}</h3>
        <div className="wd-filters">
          {[
            { key: 'all',         label: t('common.all') },
            { key: 'pending',     label: t('worker.pending') },
            { key: 'accepted',    label: t('worker.accept') },
            { key: 'in-progress', label: t('worker.start_work') },
            { key: 'completed',   label: t('worker.completed') },
          ].map(f => (
            <button key={f.key} className={`wd-filter-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📋" title={t('booking.no_bookings')} subtitle={t('worker.bookings_appear')} />
      ) : (
        <div className="wd-bookings">
          {filtered.map(b => (
            <div key={b._id} className={`wd-booking-card status-${b.status}`}>
              <div className="wd-booking-left">
                <img
                  src={b.customer?.avatar || `https://ui-avatars.com/api/?name=${b.customer?.name}&background=FF6584&color=fff`}
                  alt={b.customer?.name}
                  className="wd-booking-avatar"
                />
                <div>
                  <h4>{b.service}</h4>
                  <p className="wd-booking-customer">{b.customer?.name}</p>
                  <div className="wd-booking-meta">
                    <span><FiCalendar size={12} /> {new Date(b.scheduledDate).toLocaleDateString()}</span>
                    <span><FiClock size={12} /> {b.scheduledTime}</span>
                    <span><FiPhone size={12} /> {b.customer?.phone}</span>
                  </div>
                  {b.description && <p className="wd-booking-desc">{b.description}</p>}
                </div>
              </div>
              <div className="wd-booking-right">
                <StatusBadge status={b.status} />
                <p className="wd-booking-amount">₹{b.amount}</p>
                <div className="wd-booking-actions">
                  {b.status === 'pending' && (
                    <>
                      <button className="wd-action-btn accept" onClick={() => updateStatus(b._id, 'accepted')}>
                        <FiCheck /> {t('worker.accept')}
                      </button>
                      <button className="wd-action-btn reject" onClick={() => updateStatus(b._id, 'rejected')}>
                        <FiX /> {t('worker.reject')}
                      </button>
                    </>
                  )}
                  {b.status === 'accepted' && (
                    <button className="wd-action-btn start" onClick={() => updateStatus(b._id, 'in-progress')}>
                      🚀 {t('worker.start_work')}
                    </button>
                  )}
                  {b.status === 'in-progress' && (
                    <button className="wd-action-btn complete" onClick={() => updateStatus(b._id, 'completed')}>
                      <FiCheck /> {t('worker.mark_complete')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
