import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">⚡ Skill<span>Worker</span></div>
          <p>Connecting skilled workers with customers in your local area. Fast, reliable, and transparent.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/search">Find Workers</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/register">Join as Worker</Link>
        </div>
        <div className="footer-links">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>📧 support@skillworker.com</p>
          <p>📞 +91 98765 43210</p>
          <p>📍 India</p>
          <div className="footer-social">
            <a href="#">FB</a><a href="#">TW</a><a href="#">IN</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 SkillWorker Platform. All rights reserved. | B.Tech Final Year Project</p>
      </div>
    </footer>
  );
}
