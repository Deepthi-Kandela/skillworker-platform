import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: params.get('role') || 'customer',
    address: { city: '', state: '', pincode: '' },
  });
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['city', 'state', 'pincode'].includes(name)) {
      setForm({ ...form, address: { ...form.address, [name]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSendOTP = async () => {
    if (!form.phone || form.phone.length < 10) {
      toast.error('Enter a valid phone number');
      return;
    }
    setOtpLoading(true);
    try {
      const { data } = await API.post('/auth/send-otp', { phone: form.phone });
      toast.success(t('auth.otp_sent'));
      setOtpStep(true);
      // Show OTP in dev mode
      if (data.otp) toast(`Dev OTP: ${data.otp}`, { icon: '🔑', duration: 10000 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error(t('auth.otp_invalid'));
      return;
    }
    setOtpLoading(true);
    try {
      await API.post('/auth/verify-otp', { phone: form.phone, otp });
      toast.success(t('auth.otp_verified'));
      setOtpVerified(true);
      setOtpStep(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.otp_invalid'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      toast.error(t('auth.phone_verify'));
      return;
    }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(t('auth.account_created'));
      if (user.role === 'worker') navigate('/worker/setup');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.registration_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">⚡ SkillConnect</div>
          <h2>{t('auth.register_title')}</h2>
          <p>{t('auth.register_subtitle')}</p>
          <div className="auth-illustration">🚀</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-title">{t('auth.register_title')}</h2>
          <p className="auth-subtitle">{t('auth.register_subtitle')}</p>

          {/* Role Toggle */}
          <div className="role-toggle">
            <button type="button" className={`role-btn ${form.role === 'customer' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'customer' })}>
              👤 {t('auth.as_customer')}
            </button>
            <button type="button" className={`role-btn ${form.role === 'worker' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'worker' })}>
              👷 {t('auth.as_worker')}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>{t('auth.name')}</label>
                <div className="input-icon-wrap">
                  <FiUser className="input-icon" />
                  <input type="text" name="name" className="form-control" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                </div>
              </div>

              {/* Phone + OTP */}
              <div className="form-group">
                <label>{t('auth.phone')}</label>
                <div className="otp-phone-row">
                  <div className="input-icon-wrap" style={{ flex: 1 }}>
                    <FiPhone className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      disabled={otpVerified}
                    />
                  </div>
                  {!otpVerified && (
                    <button type="button" className="btn btn-outline btn-sm otp-send-btn" onClick={handleSendOTP} disabled={otpLoading}>
                      {otpLoading ? '...' : t('auth.send_otp')}
                    </button>
                  )}
                  {otpVerified && <span className="otp-verified-badge">✓ {t('auth.otp_verified')}</span>}
                </div>
              </div>
            </div>

            {/* OTP Input */}
            {otpStep && !otpVerified && (
              <div className="otp-box">
                <p className="otp-hint"><FiShield /> {t('auth.phone_verify')} — {t('auth.otp_expires')}</p>
                <div className="otp-input-row">
                  <input
                    type="text"
                    className="form-control otp-input"
                    placeholder={t('auth.otp_placeholder')}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                  <button type="button" className="btn btn-primary" onClick={handleVerifyOTP} disabled={otpLoading}>
                    {otpLoading ? '...' : t('auth.verify_otp')}
                  </button>
                </div>
                <button type="button" className="resend-btn" onClick={handleSendOTP} disabled={otpLoading}>
                  {t('auth.resend_otp')}
                </button>
              </div>
            )}

            <div className="form-group">
              <label>{t('auth.email')}</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" />
                <input type="email" name="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>{t('auth.password')}</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input type="password" name="password" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label>{t('auth.city')}</label>
                <div className="input-icon-wrap">
                  <FiMapPin className="input-icon" />
                  <input type="text" name="city" className="form-control" placeholder="Mumbai" value={form.address.city} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>{t('auth.state')}</label>
                <input type="text" name="state" className="form-control" placeholder="Maharashtra" value={form.address.state} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>{t('auth.pincode')}</label>
                <input type="text" name="pincode" className="form-control" placeholder="400001" value={form.address.pincode} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || !otpVerified}>
              {loading ? t('auth.registering') : `${t('auth.register_btn')} — ${form.role === 'worker' ? t('auth.as_worker') : t('auth.as_customer')}`}
            </button>
          </form>

          <p className="auth-switch">
            {t('auth.have_account')} <Link to="/login">{t('auth.sign_in')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
