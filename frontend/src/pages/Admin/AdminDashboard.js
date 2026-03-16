import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { StatusBadge, Spinner } from '../../components/common';
import { FiUsers, FiCalendar, FiDollarSign, FiAlertCircle, FiCheck, FiToggleLeft, FiToggleRight, FiSearch, FiGrid, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const TABS = [
  { key: 'overview', icon: '📊' },
  { key: 'users',    icon: '👥' },
  { key: 'workers',  icon: '👷' },
  { key: 'bookings', icon: '📅' },
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [workers, setWorkers]   = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, uRes, wRes] = await Promise.all([
          API.get('/admin/dashboard'),
          API.get('/admin/users'),
          API.get('/admin/users?role=worker'),
        ]);
        setStats(sRes.data);
        setUsers(uRes.data.users);
        setWorkers(wRes.data.users);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const toggleUser = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/toggle`);
      toast.success(data.message);
      setUsers(users.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
      setWorkers(workers.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
    } catch { toast.error('Failed'); }
  };

  const verifyWorker = async (workerId) => {
    try {
      await API.put(`/admin/workers/${workerId}/verify`);
      toast.success(t('admin.verified'));
      setWorkers(workers.map(w => w._id === workerId ? { ...w, isVerified: true } : w));
    } catch { toast.error('Failed'); }
  };

  const filteredUsers    = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredWorkers  = workers.filter(w => w.name?.toLowerCase().includes(search.toLowerCase()) || w.email?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Spinner />;

  const STAT_CARDS = [
    { label: t('admin.total_customers'),       value: stats?.totalUsers,            icon: <FiUsers />,       gradient: 'linear-gradient(135deg,#6C63FF,#a78bfa)', emoji: '👥' },
    { label: t('admin.total_workers'),         value: stats?.totalWorkers,          icon: <FiUsers />,       gradient: 'linear-gradient(135deg,#FF6584,#ff9a9e)', emoji: '👷' },
    { label: t('admin.total_bookings'),        value: stats?.totalBookings,         icon: <FiCalendar />,    gradient: 'linear-gradient(135deg,#43E97B,#38f9d7)', emoji: '📅' },
    { label: t('admin.total_revenue'),         value: `₹${stats?.revenue || 0}`,   icon: <FiDollarSign />,  gradient: 'linear-gradient(135deg,#F7971E,#FFD200)', emoji: '💰' },
    { label: t('admin.pending_verifications'), value: stats?.pendingVerifications,  icon: <FiAlertCircle />, gradient: 'linear-gradient(135deg,#2196F3,#21CBF3)', emoji: '⏳' },
  ];

  return (
    <div className="ad-page">

      {/* ── Sidebar ── */}
      <div className="ad-sidebar">
        <div className="ad-logo">⚡ {t('admin.panel')}</div>
        {TABS.map(tab => (
          <button key={tab.key} className={`ad-sidebar-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            <span className="ad-tab-icon">{tab.icon}</span>
            {t(`admin.${tab.key}`)}
          </button>
        ))}

        {/* Sidebar Stats */}
        <div className="ad-sidebar-stats">
          <div className="ad-sidebar-stat"><span>👥</span><div><p>{stats?.totalUsers}</p><small>Users</small></div></div>
          <div className="ad-sidebar-stat"><span>👷</span><div><p>{stats?.totalWorkers}</p><small>Workers</small></div></div>
          <div className="ad-sidebar-stat"><span>📅</span><div><p>{stats?.totalBookings}</p><small>Bookings</small></div></div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="ad-content">

        {/* Topbar */}
        <div className="ad-topbar">
          <div>
            <h2>{TABS.find(t => t.key === activeTab)?.emoji} {t(`admin.${activeTab}`)}</h2>
            <p className="ad-topbar-sub">Skill Connect Admin Panel</p>
          </div>
          {(activeTab === 'users' || activeTab === 'workers') && (
            <div className="ad-search-wrap">
              <FiSearch className="ad-search-icon" />
              <input className="ad-search" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          )}
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div>
            <div className="ad-stats">
              {STAT_CARDS.map((s, i) => (
                <div key={i} className="ad-stat-card" style={{ background: s.gradient }}>
                  <div className="ad-stat-emoji">{s.emoji}</div>
                  <div className="ad-stat-info">
                    <p className="ad-stat-val">{s.value}</p>
                    <p className="ad-stat-label">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div className="ad-card">
              <div className="ad-card-header">
                <h3>📋 {t('admin.recent_bookings')}</h3>
                <span className="ad-badge purple">{stats?.recentBookings?.length || 0} entries</span>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>{t('admin.customer')}</th>
                      <th>{t('admin.worker')}</th>
                      <th>{t('admin.service')}</th>
                      <th>{t('admin.amount')}</th>
                      <th>{t('admin.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentBookings?.map(b => (
                      <tr key={b._id}>
                        <td><div className="ad-cell-name"><div className="ad-cell-avatar purple">{b.customer?.name?.[0]}</div>{b.customer?.name}</div></td>
                        <td><div className="ad-cell-name"><div className="ad-cell-avatar pink">{b.worker?.name?.[0]}</div>{b.worker?.name}</div></td>
                        <td><span className="ad-service-tag">{b.service}</span></td>
                        <td><strong className="ad-amount">₹{b.amount}</strong></td>
                        <td><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {activeTab === 'users' && (
          <div className="ad-card">
            <div className="ad-card-header">
              <h3>👥 {t('admin.all_users')}</h3>
              <span className="ad-badge purple">{filteredUsers.length} users</span>
            </div>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>{t('admin.name')}</th>
                    <th>{t('admin.email')}</th>
                    <th>{t('admin.phone')}</th>
                    <th>{t('admin.city')}</th>
                    <th>{t('admin.status')}</th>
                    <th>{t('admin.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="ad-cell-name">
                          <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=6C63FF&color=fff&size=32`} alt={u.name} className="ad-avatar" />
                          {u.name}
                        </div>
                      </td>
                      <td className="ad-muted">{u.email}</td>
                      <td className="ad-muted">{u.phone}</td>
                      <td className="ad-muted">{u.address?.city || '—'}</td>
                      <td><span className={`ad-status-badge ${u.isActive ? 'green' : 'red'}`}>{u.isActive ? t('admin.active') : t('admin.suspended')}</span></td>
                      <td>
                        <button className={`ad-action-btn ${u.isActive ? 'danger' : 'success'}`} onClick={() => toggleUser(u._id)}>
                          {u.isActive ? <><FiToggleRight /> {t('admin.suspend')}</> : <><FiToggleLeft /> {t('admin.activate')}</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Workers ── */}
        {activeTab === 'workers' && (
          <div className="ad-card">
            <div className="ad-card-header">
              <h3>👷 {t('admin.all_workers')}</h3>
              <span className="ad-badge pink">{filteredWorkers.length} workers</span>
            </div>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>{t('admin.name')}</th>
                    <th>{t('admin.email')}</th>
                    <th>{t('admin.city')}</th>
                    <th>{t('admin.verified')}</th>
                    <th>{t('admin.status')}</th>
                    <th>{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map(w => (
                    <tr key={w._id}>
                      <td>
                        <div className="ad-cell-name">
                          <img src={w.avatar || `https://ui-avatars.com/api/?name=${w.name}&background=FF6584&color=fff&size=32`} alt={w.name} className="ad-avatar" />
                          {w.name}
                        </div>
                      </td>
                      <td className="ad-muted">{w.email}</td>
                      <td className="ad-muted">{w.address?.city || '—'}</td>
                      <td><span className={`ad-status-badge ${w.isVerified ? 'green' : 'yellow'}`}>{w.isVerified ? t('admin.verified') : t('admin.pending')}</span></td>
                      <td><span className={`ad-status-badge ${w.isActive ? 'green' : 'red'}`}>{w.isActive ? t('admin.active') : t('admin.suspended')}</span></td>
                      <td className="ad-actions-cell">
                        {!w.isVerified && (
                          <button className="ad-action-btn success" onClick={() => verifyWorker(w._id)}>
                            <FiCheck /> {t('admin.verify')}
                          </button>
                        )}
                        <button className={`ad-action-btn ${w.isActive ? 'danger' : 'success'}`} onClick={() => toggleUser(w._id)}>
                          {w.isActive ? t('admin.suspend') : t('admin.activate')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Bookings ── */}
        {activeTab === 'bookings' && (
          <div className="ad-card">
            <div className="ad-card-header">
              <h3>📅 {t('admin.recent_bookings')}</h3>
              <span className="ad-badge blue">{stats?.recentBookings?.length || 0} entries</span>
            </div>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>{t('admin.customer')}</th>
                    <th>{t('admin.worker')}</th>
                    <th>{t('admin.service')}</th>
                    <th>{t('admin.amount')}</th>
                    <th>{t('admin.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentBookings?.map(b => (
                    <tr key={b._id}>
                      <td><div className="ad-cell-name"><div className="ad-cell-avatar purple">{b.customer?.name?.[0]}</div>{b.customer?.name}</div></td>
                      <td><div className="ad-cell-name"><div className="ad-cell-avatar pink">{b.worker?.name?.[0]}</div>{b.worker?.name}</div></td>
                      <td><span className="ad-service-tag">{b.service}</span></td>
                      <td><strong className="ad-amount">₹{b.amount}</strong></td>
                      <td><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
