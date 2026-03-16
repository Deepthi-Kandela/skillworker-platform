import { StarRating } from '../common';
import './ReviewCard.css';

export default function ReviewCard({ review }) {
  const { customer, rating, comment, createdAt } = review;
  return (
    <div className="review-card">
      <div className="rc-header">
        <img
          src={customer?.avatar || `https://ui-avatars.com/api/?name=${customer?.name}&background=FF6584&color=fff&size=40`}
          alt={customer?.name}
          className="rc-avatar"
        />
        <div className="rc-info">
          <p className="rc-name">{customer?.name}</p>
          <StarRating rating={rating} size={14} />
        </div>
        <span className="rc-date">{new Date(createdAt).toLocaleDateString()}</span>
      </div>
      {comment && <p className="rc-comment">"{comment}"</p>}
    </div>
  );
}
