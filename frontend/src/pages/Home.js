import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiStar, FiShield, FiClock, FiCheckCircle } from 'react-icons/fi';
import API from '../api/axios';
import './Home.css';

const CATEGORIES = [
  { name: 'Plumber', icon: '🔧', color: '#6C63FF' },
  { name: 'Electrician', icon: '⚡', color: '#FF6584' },
  { name: 'Mechanic', icon: '🔩', color: '#43E97B' },
  { name: 'Tutor', icon: '📚', color: '#F7971E' },
  { name: 'Carpenter', icon: '🪚', color: '#2196F3' },
  { name: 'Painter', icon: '🎨', color: '#9C27B0' },
  { name: 'Cleaner', icon: '🧹', color: '#00BCD4' },
  { name: 'Tailor', icon: '🧵', color: '#FF5722' },
];

const STATS = [
  { value: '500+', label: 'Skilled Workers', icon: '👷' },
  { value: '2000+', label: 'Happy Customers', icon: '😊' },
  { value: '50+', label: 'Service Categories', icon: '🛠️' },
  { value: '4.8★', label: 'Average Rating', icon: '⭐' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Search Workers', desc: 'Search by category, location, or skill to find the right professional.', icon: '🔍' },
  { step: '02', title: 'View Profiles', desc: 'Check ratings, reviews, pricing, and availability before booking.', icon: '👤' },
  { step: '03', title: 'Book & Pay', desc: 'Book your preferred worker and pay securely online.', icon: '📅' },
  { step: '04', title: 'Get Service', desc: 'Worker arrives at your location and completes the job.', icon: '✅' },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [recommended, setRecommended] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/workers/recommended?limit=4').then(({ data }) => setRecommended(data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?category=${search}&city=${city}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🚀 India's #1 Local Skill Platform</div>
          <h1>Find Trusted <span>Skilled Workers</span> Near You</h1>
          <p>Connect with verified plumbers, electricians, tutors, mechanics and more. Book instantly, pay securely.</p>

          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-wrap">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="What service do you need?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="search-input-wrap">
              <FiMapPin className="search-icon" />
              <input
                type="text"
                placeholder="Your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">Search</button>
          </form>

          <div className="hero-tags">
            {['Plumber', 'Electrician', 'Tutor', 'Mechanic', 'Carpenter'].map(t => (
              <button key={t} className="tag-btn" onClick={() => navigate(`/search?category=${t}`)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-img-card">
            <div className="floating-card card1">
              <FiCheckCircle color="#43E97B" size={20} />
              <span>Verified Worker</span>
            </div>
            <div className="floating-card card2">
              <FiStar color="#FFC107" size={20} />
              <span>4.9 Rating</span>
            </div>
            <div className="hero-circle gradient-primary">
              <span>⚡</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="page-container">
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div key={i} className="stat-card">
                <span className="stat-icon">{s.icon}</span>
                <h2 className="stat-value">{s.value}</h2>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="page-container">
          <div className="section-header">
            <h2>Browse by Category</h2>
            <p>Find professionals across all service categories</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat, i) => (
              <Link to={`/search?category=${cat.name}`} key={i} className="category-card" style={{ '--cat-color': cat.color }}>
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-3">
            <Link to="/categories" className="btn btn-outline">View All Categories</Link>
          </div>
        </div>
      </section>

      {/* Recommended Workers */}
      {recommended.length > 0 && (
        <section className="recommended-section">
          <div className="page-container">
            <div className="section-header">
              <h2>⭐ Recommended Workers</h2>
              <p>Top-rated verified professionals near you</p>
            </div>
            <div className="recommended-grid">
              {recommended.map(w => (
                <div key={w._id} className="recommended-card" onClick={() => navigate(`/worker/${w._id}`)}
                  style={{ cursor: 'pointer' }}>
                  <img
                    src={w.user?.avatar || `https://ui-avatars.com/api/?name=${w.user?.name}&background=6C63FF&color=fff&size=80`}
                    alt={w.user?.name}
                    className="rec-avatar"
                  />
                  <div className="rec-info">
                    <h4>{w.user?.name}</h4>
                    <p className="rec-category">{w.category}</p>
                    <div className="rec-meta">
                      <span>⭐ {w.rating}</span>
                      <span>₹{w.hourlyRate}/hr</span>
                      <span>📍 {w.user?.address?.city}</span>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm">Book</button>
                </div>
              ))}
            </div>
            <div className="text-center mt-3">
              <Link to="/search" className="btn btn-outline">View All Workers</Link>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="how-section">
        <div className="page-container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get your work done in 4 simple steps</p>
          </div>
          <div className="how-grid">
            {HOW_IT_WORKS.map((h, i) => (
              <div key={i} className="how-card">
                <div className="how-step">{h.step}</div>
                <div className="how-icon">{h.icon}</div>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="page-container">
          <div className="features-grid">
            <div className="features-text">
              <h2>Why Choose <span>SkillWorker?</span></h2>
              <p>We make it easy to find, book, and pay for local services with complete transparency and trust.</p>
              <div className="feature-list">
                {[
                  { icon: <FiShield />, title: 'Verified Workers', desc: 'All workers are ID-verified and background checked.' },
                  { icon: <FiStar />, title: 'Rated & Reviewed', desc: 'Real reviews from real customers for every worker.' },
                  { icon: <FiClock />, title: 'Quick Booking', desc: 'Book in minutes, get service within hours.' },
                  { icon: <FiCheckCircle />, title: 'Secure Payments', desc: 'Pay safely online with Razorpay integration.' },
                ].map((f, i) => (
                  <div key={i} className="feature-item">
                    <div className="feature-icon">{f.icon}</div>
                    <div>
                      <h4>{f.title}</h4>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn btn-primary btn-lg mt-3">Get Started Free</Link>
            </div>
            <div className="features-visual">
              <div className="visual-card gradient-primary">
                <h3>Join as a Worker</h3>
                <p>Create your profile, list your skills, and start earning today.</p>
                <Link to="/register?role=worker" className="btn" style={{ background: '#fff', color: 'var(--primary)' }}>Register as Worker</Link>
              </div>
              <div className="visual-card gradient-success">
                <h3>Find a Worker</h3>
                <p>Search nearby verified workers and book instantly.</p>
                <Link to="/search" className="btn" style={{ background: '#fff', color: '#16a34a' }}>Find Now</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="page-container">
          <div className="cta-card gradient-primary">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of customers and workers on SkillWorker platform today.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)' }}>Create Account</Link>
              <Link to="/search" className="btn btn-lg btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>Browse Workers</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
