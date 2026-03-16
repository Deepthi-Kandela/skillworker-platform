import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import { StatusBadge } from '../common';
import './BookingCard.css';

export default function BookingCard({ booking, actions }) {
  const { service, scheduledDate, scheduledTime, amount, status, paymentStatus, address, description } = booking;
  const person = booking.worker || booking.customer;
  const personLabel = booking.worker ? '👷' : '👤';

  return (
    <div className={`booking-card-item status-${status}`}>
      <div className="bci-left">
        <img
          src={person?.avatar || `https://ui-avatars.com/api/?name=${person?.name}&background=6C63FF&color=fff`}
          alt={person?.name}
          className="bci-avatar"
        />
      </div>
      <div className="bci-body">
        <div className="bci-top">
          <div>
            <h4>{service}</h4>
            <p className="bci-person">{personLabel} {person?.name}</p>
          </div>
          <div className="bci-right">
            <StatusBadge status={status} />
            <span className="bci-amount">₹{amount}</span>
            {paymentStatus && <StatusBadge status={paymentStatus} />}
          </div>
        </div>
        <div className="bci-meta">
          <span><FiCalendar size={12} /> {new Date(scheduledDate).toLocaleDateString()}</span>
          <span><FiClock size={12} /> {scheduledTime}</span>
          {address?.city && <span><FiMapPin size={12} /> {address.city}</span>}
        </div>
        {description && <p className="bci-desc">{description}</p>}
        {actions && <div className="bci-actions">{actions}</div>}
      </div>
    </div>
  );
}
