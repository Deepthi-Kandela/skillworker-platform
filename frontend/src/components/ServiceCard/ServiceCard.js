import { useNavigate } from 'react-router-dom';
import './ServiceCard.css';

export default function ServiceCard({ icon, name, color, count }) {
  const navigate = useNavigate();
  return (
    <div
      className="service-card"
      style={{ '--sc-color': color }}
      onClick={() => navigate(`/search?category=${name}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?category=${name}`)}
    >
      <div className="sc-icon-wrap">
        <span className="sc-icon">{icon}</span>
      </div>
      <span className="sc-name">{name}</span>
      {count !== undefined && <span className="sc-count">{count} workers</span>}
    </div>
  );
}
