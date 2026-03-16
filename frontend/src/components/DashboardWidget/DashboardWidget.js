import { FiTrendingUp } from 'react-icons/fi';
import './DashboardWidget.css';

export default function DashboardWidget({ icon, label, value, color = '#6C63FF', bg = '#f0eeff', trend }) {
  return (
    <div className="dw-card" style={{ '--dw-color': color, '--dw-bg': bg }}>
      <div className="dw-icon">{icon}</div>
      <div className="dw-info">
        <p className="dw-value">{value}</p>
        <p className="dw-label">{label}</p>
      </div>
      {trend !== undefined && (
        <div className="dw-trend">
          <FiTrendingUp size={14} />
          <span>{trend}%</span>
        </div>
      )}
    </div>
  );
}
