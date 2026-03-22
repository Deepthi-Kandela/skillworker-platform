import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';
import { Spinner, EmptyState } from '../../../components/common';
import DashboardWidget from '../../../components/DashboardWidget/DashboardWidget';
import BookingCard from '../../../components/BookingCard/BookingCard';
import WorkerCard from '../../../components/WorkerCard/WorkerCard';
import SearchBar from '../../../components/SearchBar/SearchBar';
import { FiCalendar, FiCheckCircle, FiClock, FiStar } from 'react-icons/fi';
import './CustomerDashboard.css';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/bookings/my'),
      API.get('/workers/recommended?limit=4'),
    ])
      .then(([bRes, wRes]) => {
        setBookings(bRes.data);
        setWorkers(Array.isArray(wRes.data) ? wRes.data : wRes.data.workers || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === 'pending').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    spent:     bookings.filter((b) => b.paymentStatus === 'paid').reduce((s, b) => s + b.amount, 0),
  };

  const recent = bookings.slice(0, 3);

  if (loading) return <Spinner />;

  return (
    <div className="cd-page">
      {/* Welcome Banner */}
      <div className="cd-banner">
        <div className="cd-banner-text">
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Find and book trusted skilled workers near you.</p>
        </div>
        <Link to="/search" className="btn btn-primary">Find Workers</Link>
      </div>

      {/* Search */}
      <div className="cd-search-section">
        <h3>🔍 Search a Service</h3>
        <SearchBar />
      </div>

      {/* Stats */}
      <div className="cd-widgets">
        <DashboardWidget icon="📋" label="Total Bookings"  value={stats.total}     color="#6C63FF" bg="#f0eeff" />
        <DashboardWidget icon="⏳" label="Pending"         value={stats.pending}   color="#F7971E" bg="#fff8ee" />
        <DashboardWidget icon="✅" label="Completed"       value={stats.completed} color="#43E97B" bg="#edfff5" />
        <DashboardWidget icon="💰" label="Total Spent"     value={`₹${stats.spent}`} color="#FF6584" bg="#fff0f3" />
      </div>

      <div className="cd-grid">
        {/* Recent Bookings */}
        <section className="cd-section">
          <div className="cd-section-header">
            <h3><FiCalendar /> Recent Bookings</h3>
            <Link to="/my-bookings" className="cd-view-all">View All</Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon="📅" title="No bookings yet" subtitle="Book a worker to get started" />
          ) : (
            <div className="cd-bookings-list">
              {recent.map((b) => (
                <BookingCard key={b._id} booking={b} />
              ))}
            </div>
          )}
        </section>

        {/* Booking Status Summary */}
        <section className="cd-section">
          <div className="cd-section-header">
            <h3><FiClock /> Booking Status</h3>
          </div>
          <div className="cd-status-list">
            {[
              { label: 'Pending',     count: stats.pending,                                                   color: '#F7971E', icon: '⏳' },
              { label: 'Accepted',    count: bookings.filter(b => b.status === 'accepted').length,            color: '#43E97B', icon: '✅' },
              { label: 'In Progress', count: bookings.filter(b => b.status === 'in-progress').length,        color: '#6C63FF', icon: '🔧' },
              { label: 'Completed',   count: stats.completed,                                                 color: '#2196F3', icon: '🎉' },
              { label: 'Cancelled',   count: bookings.filter(b => b.status === 'cancelled').length,          color: '#FF6584', icon: '❌' },
            ].map((s, i) => (
              <div key={i} className="cd-status-row">
                <span className="cd-status-icon">{s.icon}</span>
                <span className="cd-status-label">{s.label}</span>
                <div className="cd-status-bar-wrap">
                  <div
                    className="cd-status-bar"
                    style={{ width: `${stats.total ? (s.count / stats.total) * 100 : 0}%`, background: s.color }}
                  />
                </div>
                <span className="cd-status-count" style={{ color: s.color }}>{s.count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recommended Workers */}
      <section className="cd-section">
        <div className="cd-section-header">
          <h3><FiStar /> Recommended Workers</h3>
          <Link to="/search" className="cd-view-all">Browse All</Link>
        </div>
        {workers.length === 0 ? (
          <EmptyState icon="👷" title="No workers found" subtitle="Check back later" />
        ) : (
          <div className="cd-workers-grid">
            {workers.map((w) => <WorkerCard key={w._id} worker={w} />)}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="cd-quick-actions">
        <Link to="/search" className="cd-action-card" style={{ '--qa-color': '#6C63FF' }}>
          <span>🔍</span><p>Find Workers</p>
        </Link>
        <Link to="/my-bookings" className="cd-action-card" style={{ '--qa-color': '#43E97B' }}>
          <span>📅</span><p>My Bookings</p>
        </Link>
        <Link to="/categories" className="cd-action-card" style={{ '--qa-color': '#F7971E' }}>
          <span>🛠️</span><p>Categories</p>
        </Link>
        <Link to="/nearby" className="cd-action-card" style={{ '--qa-color': '#FF6584' }}>
          <span>📍</span><p>Nearby</p>
        </Link>
      </section>
    </div>
  );
}
