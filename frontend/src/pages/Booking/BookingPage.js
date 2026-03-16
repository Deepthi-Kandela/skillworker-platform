import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/common';
import { FiCalendar, FiClock, FiMapPin, FiFileText, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './BookingPage.css';

export default function BookingPage() {
  const { workerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    service: '',
    description: '',
    amount: '',
    paymentMethod: 'online',
    address: { street: '', city: '', state: '', pincode: '' },
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    API.get(`/workers/${workerId}`)
      .then(({ data }) => {
        setWorker(data);
        setForm((f) => ({ ...f, service: data.category, amount: data.hourlyRate }));
      })
      .catch(() => toast.error('Worker not found'))
      .finally(() => setLoading(false));
  }, [workerId, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['street', 'city', 'state', 'pincode'].includes(name)) {
      setForm((f) => ({ ...f, address: { ...f.address, [name]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/bookings', {
        worker: worker.user._id,
        workerProfile: worker._id,
        ...form,
      });
      toast.success('Booking request sent!');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (!worker) return null;

  const { user: wu, category, hourlyRate, rating } = worker;

  return (
    <div className="bp-page">
      <div className="bp-container">
        {/* Worker Summary */}
        <div className="bp-worker-card">
          <img
            src={wu?.avatar || `https://ui-avatars.com/api/?name=${wu?.name}&background=6C63FF&color=fff&size=80`}
            alt={wu?.name}
            className="bp-worker-avatar"
          />
          <div className="bp-worker-info">
            <h2>{wu?.name}</h2>
            <p className="bp-worker-cat">{category}</p>
            <div className="bp-worker-meta">
              <span>⭐ {rating}</span>
              <span>₹{hourlyRate}/hr</span>
              <span>📍 {wu?.address?.city}</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form className="bp-form card" onSubmit={handleSubmit}>
          <h3 className="bp-form-title">📅 Book Service</h3>

          <div className="bp-field">
            <label><FiFileText /> Service</label>
            <input
              type="text"
              name="service"
              className="form-control"
              value={form.service}
              onChange={handleChange}
              required
            />
          </div>

          <div className="bp-row">
            <div className="bp-field">
              <label><FiCalendar /> Date</label>
              <input
                type="date"
                name="scheduledDate"
                className="form-control"
                value={form.scheduledDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                required
              />
            </div>
            <div className="bp-field">
              <label><FiClock /> Time</label>
              <input
                type="time"
                name="scheduledTime"
                className="form-control"
                value={form.scheduledTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="bp-field">
            <label>Description</label>
            <textarea
              name="description"
              className="form-control"
              rows={3}
              placeholder="Describe your requirement..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="bp-field">
            <label><FiDollarSign /> Amount (₹)</label>
            <input
              type="number"
              name="amount"
              className="form-control"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          {/* Address */}
          <div className="bp-address-section">
            <h4><FiMapPin /> Service Address</h4>
            <div className="bp-field">
              <label>Street</label>
              <input type="text" name="street" className="form-control" placeholder="Street / Area" value={form.address.street} onChange={handleChange} />
            </div>
            <div className="bp-row">
              <div className="bp-field">
                <label>City</label>
                <input type="text" name="city" className="form-control" placeholder="City" value={form.address.city} onChange={handleChange} required />
              </div>
              <div className="bp-field">
                <label>State</label>
                <input type="text" name="state" className="form-control" placeholder="State" value={form.address.state} onChange={handleChange} />
              </div>
              <div className="bp-field">
                <label>Pincode</label>
                <input type="text" name="pincode" className="form-control" placeholder="Pincode" value={form.address.pincode} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bp-field">
            <label>Payment Method</label>
            <div className="bp-payment-methods">
              {[
                { id: 'online', icon: '💳', label: 'Card / Online' },
                { id: 'upi',    icon: '📱', label: 'UPI' },
                { id: 'cash',   icon: '💵', label: 'Cash' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`bp-pay-btn ${form.paymentMethod === m.id ? 'active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, paymentMethod: m.id }))}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bp-summary">
            <div className="bp-summary-row">
              <span>Service Rate</span>
              <span>₹{hourlyRate}/hr</span>
            </div>
            <div className="bp-summary-row total">
              <span>Total Amount</span>
              <span className="text-primary">₹{form.amount}</span>
            </div>
          </div>

          <div className="bp-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? 'Sending...' : '✅ Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
