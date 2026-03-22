import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Spinner } from '../../components/common';
import toast from 'react-hot-toast';
import './Subscriptions.css';

const PLAN_DETAILS = {
  basic:   { color: '#6B7280', gradient: 'linear-gradient(135deg,#6B7280,#9CA3AF)', emoji: '🥉' },
  premium: { color: '#6C63FF', gradient: 'linear-gradient(135deg,#6C63FF,#a78bfa)', emoji: '🥈' },
  pro:     { color: '#F7971E', gradient: 'linear-gradient(135deg,#F7971E,#FFD200)', emoji: '🥇' },
};

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState({});
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState('');

  useEffect(() => {
    Promise.all([API.get('/subscriptions/plans'), API.get('/subscriptions/my')])
      .then(([pRes, cRes]) => { setPlans(pRes.data); setCurrent(cRes.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (plan) => {
    setSubscribing(plan);
    try {
      await API.post('/subscriptions/subscribe', { plan });
      setCurrent({ plan, isActive: true });
      toast.success(`Subscribed to ${plan} plan!`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubscribing(''); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="subs-page">
      <div className="subs-container">
        <div className="subs-header">
          <h1>⭐ Subscription Plans</h1>
          <p className="text-light">Boost your visibility and get more bookings</p>
        </div>

        {current && (
          <div className="subs-current card">
            <p>Current Plan: <strong style={{ color: 'var(--primary)' }}>{current.plan?.toUpperCase()}</strong>
              {current.endDate && <span className="text-light text-sm"> · Expires {new Date(current.endDate).toLocaleDateString()}</span>}
            </p>
          </div>
        )}

        <div className="subs-grid">
          {Object.entries(plans).map(([key, plan]) => {
            const detail = PLAN_DETAILS[key];
            const isCurrent = current?.plan === key;
            return (
              <div key={key} className={`subs-card ${isCurrent ? 'current' : ''}`}>
                <div className="subs-card-header" style={{ background: detail.gradient }}>
                  <span className="subs-emoji">{detail.emoji}</span>
                  <h3>{key.toUpperCase()}</h3>
                  <p className="subs-price">
                    {plan.price === 0 ? 'FREE' : `₹${plan.price}/mo`}
                  </p>
                </div>
                <div className="subs-card-body">
                  <ul className="subs-features">
                    {plan.features.map((f, i) => (
                      <li key={i}><span>✓</span> {f}</li>
                    ))}
                  </ul>
                  <button
                    className={`btn btn-full ${isCurrent ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => !isCurrent && handleSubscribe(key)}
                    disabled={isCurrent || subscribing === key}
                  >
                    {isCurrent ? '✓ Current Plan' : subscribing === key ? 'Processing...' : 'Subscribe'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
