import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { StatusBadge, Spinner, EmptyState } from '../../components/common';
import Payment from '../../components/Payment/Payment';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiStar, FiPackage, FiCheckCircle, FiXCircle, FiLoader, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './MyBookings.css';

export default function MyBookings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [reviewModal, setReviewModal] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [review, setReview]         = useState({ rating: 5, comment: '' });

  useEffect(() => {
    API.get('/bookings/my').then(({ data }) => setBookings(data)).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    try {
      await API.put(`/bookings/${id}/status`, { status: 'cancelled' });
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast.success(t('booking.cancel'));
    } catch { toast.error('Failed to cancel'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await API.post('/reviews', { bookingId: reviewModal._id, ...review });
      toast.success('Review submitted!');
      setReviewModal(null);
      setBookings(bookings.map(b => b._id === reviewModal._id ? { ...b, isReviewed: true } : b));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handlePaymentSuccess = (method) => {
    setBookings(bookings.map(b =>
      b._id === paymentModal._id ? { ...b, paymentStatus: method === 'cash' ? 'pending' : 'paid' } : b
    ));
    setPaymentModal(null);
  };

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    spent:     bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + b.amount, 0),
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const FILTERS = [
    { key: 'all',         label: t('common.all'),          icon: '📋' },
    { key: 'pending',     label: t('worker.pending'),      icon: '⏳' },
    { key: 'accepted',    label: t('worker.accept'),       icon: '✅' },
    { key: 'in-progress', label: t('worker.start_work'),   icon: '🔧' },
    { key: 'completed',   label: t('worker.completed'),    icon: '🎉' },
    { key: 'cancelled',   label: t('booking.cancelled'),   icon: '❌' },
  ];

  return (
    <div className="mb-page">

      {/* ── Header ── */}
      <div className="mb-header">
        <div>
          <h1 className="mb-title">📅 {t('booking.my_bookings')}</h1>
          <p className="mb-subtitle">{t('booking.track_bookings')}</p>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="mb-stats">
        {[
          { label: t('worker.total_bookings'), value: stats.total,     icon: <FiPackage />,     color: '#6C63FF', bg: '#f0eeff' },
          { label: t('worker.pending'),        value: stats.pending,   icon: <FiLoader />,      color: '#F7971E', bg: '#fff8ee' },
          { label: t('worker.completed'),      value: stats.completed, icon: <FiCheckCircle />, color: '#43E97B', bg: '#edfff5' },
          { label: 'Total Spent',              value: `₹${stats.spent}`, icon: <FiStar />,      color: '#FF6584', bg: '#fff0f3' },
        ].map((s, i) => (
          <div key={i} className="mb-stat-card" style={{ '--c': s.color, '--bg': s.bg }}>
            <div className="mb-stat-icon">{s.icon}</div>
            <div>
              <p className="mb-stat-val">{s.value}</p>
              <p className="mb-stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="mb-filters">
        {FILTERS.map(f => (
          <button key={f.key} className={`mb-filter-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.icon} {f.label}
            {f.key !== 'all' && bookings.filter(b => b.status === f.key).length > 0 && (
              <span className="mb-filter-count">{bookings.filter(b => b.status === f.key).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Bookings List ── */}
      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon="📅" title={t('booking.no_bookings')} subtitle={t('booking.book_to_start')} />
      ) : (
        <div className="mb-list">
          {filtered.map(b => (
            <div key={b._id} className={`mb-card status-${b.status}`}>
              <div className="mb-card-left">
                <img
                  src={b.worker?.avatar || `https://ui-avatars.com/api/?name=${b.worker?.name}&background=6C63FF&color=fff`}
                  alt={b.worker?.name}
                  className="mb-avatar"
                />
                <div className="mb-status-dot" />
              </div>

              <div className="mb-card-body">
                <div className="mb-card-top">
                  <div>
                    <h3>{b.service}</h3>
                    <p className="mb-worker-name">👷 {b.worker?.name}</p>
                  </div>
                  <div className="mb-card-right">
                    <StatusBadge status={b.status} />
                    <p className="mb-amount">₹{b.amount}</p>
                    <StatusBadge status={b.paymentStatus} />
                  </div>
                </div>

                <div className="mb-meta">
                  <span><FiCalendar size={12} /> {new Date(b.scheduledDate).toLocaleDateString()}</span>
                  <span><FiClock size={12} /> {b.scheduledTime}</span>
                  {b.address?.city && <span><FiMapPin size={12} /> {b.address.city}</span>}
                </div>

                {b.description && <p className="mb-desc">{b.description}</p>}

                <div className="mb-actions">
                  {['accepted', 'in-progress', 'on-the-way'].includes(b.status) && (
                    <button className="mb-btn primary" onClick={() => navigate('/chat')}>
                      <FiMessageSquare size={14} /> Chat
                    </button>
                  )}
                  {b.status === 'pending' && (
                    <button className="mb-btn danger" onClick={() => handleCancel(b._id)}>
                      <FiXCircle size={14} /> {t('booking.cancel')}
                    </button>
                  )}
                  {b.status === 'accepted' && b.paymentStatus === 'pending' && (
                    <button className="mb-btn primary" onClick={() => setPaymentModal(b)}>
                      💳 {t('payment.pay_now')}
                    </button>
                  )}
                  {b.status === 'completed' && !b.isReviewed && (
                    <button className="mb-btn star" onClick={() => setReviewModal(b)}>
                      <FiStar size={14} /> {t('booking.write_review')}
                    </button>
                  )}
                  {b.status === 'completed' && b.isReviewed && (
                    <span className="mb-reviewed">✓ Reviewed</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Payment Modal ── */}
      {paymentModal && (
        <div className="mb-overlay" onClick={() => setPaymentModal(null)}>
          <div className="mb-modal" onClick={e => e.stopPropagation()}>
            <button className="mb-modal-close" onClick={() => setPaymentModal(null)}>✕</button>
            <h3 className="mb-3">{t('payment.title')}</h3>
            <Payment bookingId={paymentModal._id} amount={paymentModal.amount} onSuccess={handlePaymentSuccess} />
          </div>
        </div>
      )}

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div className="mb-overlay" onClick={() => setReviewModal(null)}>
          <div className="mb-modal" onClick={e => e.stopPropagation()}>
            <button className="mb-modal-close" onClick={() => setReviewModal(null)}>✕</button>
            <h3 className="mb-3">{t('booking.rate_review')}</h3>
            <p className="text-light mb-3">{t('booking.review_experience')} <strong>{reviewModal.worker?.name}</strong>?</p>
            <form onSubmit={handleReview}>
              <div className="mb-stars mb-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" className={`mb-star ${review.rating >= s ? 'active' : ''}`} onClick={() => setReview({ ...review, rating: s })}>★</button>
                ))}
              </div>
              <div className="form-group">
                <label>{t('common.submit')}</label>
                <textarea className="form-control" rows={4} placeholder="Share your experience..." value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })} />
              </div>
              <div className="flex-gap mt-2">
                <button type="submit" className="btn btn-primary">{t('common.submit')}</button>
                <button type="button" className="btn btn-outline" onClick={() => setReviewModal(null)}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
