import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`${t('auth.welcome_back')}, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'worker') navigate('/worker/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.invalid_credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">⚡ SkillConnect</div>
          <h2>{t('auth.welcome_back')}</h2>
          <p>{t('auth.login_message')}</p>
          <div className="auth-illustration">🔐</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-title">{t('auth.login_title')}</h2>
          <p className="auth-subtitle">{t('auth.login_subtitle')}</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('auth.email')}</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('auth.password')}</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? t('auth.logging_in') : t('auth.login_btn')}
            </button>
          </form>

          <div className="auth-divider"><span>Demo Accounts</span></div>
          <div className="demo-accounts">
            <button className="demo-btn" onClick={() => setForm({ email: 'admin@skillworker.com', password: 'admin123' })}>Admin</button>
            <button className="demo-btn" onClick={() => setForm({ email: 'worker@test.com', password: 'test123' })}>Worker</button>
            <button className="demo-btn" onClick={() => setForm({ email: 'customer@test.com', password: 'test123' })}>Customer</button>
          </div>

          <p className="auth-switch">
            {t('auth.no_account')} <Link to="/register">{t('auth.register_here')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
