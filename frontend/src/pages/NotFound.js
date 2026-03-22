import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 68px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🔍</div>
      <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary)', margin: '0 0 8px' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--dark)', margin: '0 0 12px' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '32px', maxWidth: '400px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary btn-lg">🏠 Go Home</Link>
        <Link to="/search" className="btn btn-outline btn-lg">🔍 Find Workers</Link>
      </div>
    </div>
  );
}
