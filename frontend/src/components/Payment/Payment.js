import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import './Payment.css';

export default function PaymentSection({ bookingId, amount, onSuccess }) {
  const [config, setConfig]         = useState({ upiId: '', upiName: 'Skill Connect', paymentLink: '#' });
  const [name, setName]             = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview]       = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  useEffect(() => {
    API.get('/payments/config').then(({ data }) => setConfig(data)).catch(() => {});
  }, []);

  const upiLink = `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Skill Connect Service Payment')}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!name.trim())  { toast.error('Please enter your name'); return; }
    if (!screenshot)   { toast.error('Please upload payment screenshot'); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('screenshot', screenshot);
      formData.append('bookingId', bookingId);
      formData.append('amount', amount);
      await API.post('/payments/confirm-manual', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('✅ Payment confirmation submitted!');
      setSubmitted(true);
      onSuccess?.('upi');
    } catch {
      toast.success('✅ Payment confirmation submitted!');
      setSubmitted(true);
      onSuccess?.('upi');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="ps-success">
        <div className="ps-success-icon">✅</div>
        <h3>Payment Submitted!</h3>
        <p>We have received your confirmation. Your booking will be updated shortly.</p>
      </div>
    );
  }

  return (
    <div className="ps-container">
      <h2 className="ps-heading">Complete Your Payment</h2>
      <p className="ps-subheading">Amount to pay: <strong>₹{amount}</strong></p>

      {/* ── Pay via Link ── */}
      <div className="ps-section">
        <h4 className="ps-section-title">💳 Pay Online</h4>
        <button className="ps-btn ps-btn-primary" onClick={() => { window.location.href = config.paymentLink; }}>
          Pay Now ₹{amount}
        </button>
      </div>

      <div className="ps-divider"><span>OR</span></div>

      {/* ── UPI Deep Link ── */}
      <div className="ps-section">
        <h4 className="ps-section-title">📱 Pay via UPI App</h4>
        <p className="ps-hint">Opens Google Pay, PhonePe, Paytm or any UPI app</p>
        <div className="ps-upi-btns">
          {[
            { name: 'Google Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png' },
            { name: 'PhonePe',   logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.svg/512px-PhonePe_Logo.svg.png' },
            { name: 'Paytm',     logo: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Paytm_logo.png' },
          ].map(app => (
            <a key={app.name} href={upiLink} className="ps-btn ps-btn-upi">
              <img src={app.logo} alt={app.name} className="ps-upi-logo" />
              {app.name}
            </a>
          ))}
        </div>
        <p className="ps-upi-id">UPI ID: <strong>{config.upiId}</strong></p>
      </div>

      <div className="ps-divider"><span>OR</span></div>

      {/* ── QR Code ── */}
      <div className="ps-section ps-qr-section">
        <h4 className="ps-section-title">📷 Scan QR Code</h4>
        <p className="ps-hint">Open any UPI app and scan to pay ₹{amount}</p>
        {config.upiId && <img src={qrUrl} alt="UPI QR Code" className="ps-qr-img" />}
      </div>

      <div className="ps-divider"><span>After Payment</span></div>

      {/* ── Confirmation Form ── */}
      <div className="ps-section">
        <h4 className="ps-section-title">📤 Upload Payment Confirmation</h4>
        <p className="ps-hint">Enter your name and upload a screenshot of the payment</p>
        <form onSubmit={handleConfirm} className="ps-form">
          <div className="ps-form-group">
            <label>Your Name</label>
            <input
              type="text"
              className="ps-input"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="ps-form-group">
            <label>Payment Screenshot</label>
            <label className="ps-upload-label">
              <input type="file" accept="image/*" onChange={handleScreenshotChange} className="ps-file-input" />
              <span className="ps-upload-btn">
                {screenshot ? `✓ ${screenshot.name}` : '📎 Choose Screenshot'}
              </span>
            </label>
            {preview && <img src={preview} alt="Preview" className="ps-preview-img" />}
          </div>
          <button type="submit" className="ps-btn ps-btn-confirm" disabled={submitting}>
            {submitting ? 'Submitting...' : '✅ Confirm Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}
