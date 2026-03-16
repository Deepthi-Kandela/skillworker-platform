import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiClock, FiCheckCircle } from 'react-icons/fi';
import './WorkerCard.css';

export default function WorkerCard({ worker }) {
  const { _id, user, category, hourlyRate, rating, totalReviews, experience, isAvailable, skills } = worker;

  return (
    <div className="worker-card">
      <div className="worker-card-header">
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6C63FF&color=fff&size=80`}
          alt={user?.name}
          className="worker-avatar"
        />
        <div className="worker-badge-wrap">
          {worker.isVerified && <span className="verified-badge"><FiCheckCircle /> Verified</span>}
          <span className={`avail-badge ${isAvailable ? 'available' : 'busy'}`}>
            {isAvailable ? 'Available' : 'Busy'}
          </span>
        </div>
      </div>

      <div className="worker-card-body">
        <h3 className="worker-name">{user?.name}</h3>
        <span className="worker-category">{category}</span>

        <div className="worker-rating">
          <FiStar className="star-icon" />
          <span className="rating-val">{rating || '0.0'}</span>
          <span className="rating-count">({totalReviews} reviews)</span>
        </div>

        <div className="worker-meta">
          <span><FiMapPin /> {user?.address?.city || 'N/A'}</span>
          <span><FiClock /> {experience} yrs exp</span>
        </div>

        {skills?.length > 0 && (
          <div className="worker-skills">
            {skills.slice(0, 3).map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
            {skills.length > 3 && <span className="skill-tag">+{skills.length - 3}</span>}
          </div>
        )}
      </div>

      <div className="worker-card-footer">
        <div className="worker-rate">
          <span className="rate-amount">₹{hourlyRate}</span>
          <span className="rate-label">/hour</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/worker/${_id}`} className="btn btn-outline btn-sm">Profile</Link>
          <Link to={`/book/${_id}`} className="btn btn-primary btn-sm">Book Now</Link>
        </div>
      </div>
    </div>
  );
}
