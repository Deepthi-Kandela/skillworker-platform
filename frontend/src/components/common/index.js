export function Spinner() {
  return <div className="spinner"></div>;
}

export function StarRating({ rating, size = 16 }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? '#FFC107' : '#ddd', fontSize: size }}>★</span>
      ))}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending: 'badge-warning',
    accepted: 'badge-info',
    'in-progress': 'badge-primary',
    completed: 'badge-success',
    rejected: 'badge-danger',
    cancelled: 'badge-danger',
    paid: 'badge-success',
    unpaid: 'badge-warning',
  };
  return <span className={`badge ${map[status] || 'badge-primary'}`}>{status}</span>;
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{icon || '📭'}</div>
      <h3 style={{ color: 'var(--dark)', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-light)' }}>{subtitle}</p>
    </div>
  );
}
