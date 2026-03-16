import { Link } from 'react-router-dom';
import './Categories.css';

const CATEGORIES = [
  { name: 'Plumber', icon: '🔧', desc: 'Pipe fitting, leak repair, bathroom installation', count: '45+' },
  { name: 'Electrician', icon: '⚡', desc: 'Wiring, panel upgrades, lighting installation', count: '38+' },
  { name: 'Mechanic', icon: '🔩', desc: 'Car repair, bike service, engine diagnostics', count: '52+' },
  { name: 'Tutor', icon: '📚', desc: 'Math, science, language, competitive exams', count: '120+' },
  { name: 'Carpenter', icon: '🪚', desc: 'Furniture making, wood repair, custom cabinets', count: '29+' },
  { name: 'Painter', icon: '🎨', desc: 'Interior, exterior, waterproofing, texture', count: '34+' },
  { name: 'Cleaner', icon: '🧹', desc: 'Home cleaning, deep cleaning, office cleaning', count: '67+' },
  { name: 'Tailor', icon: '🧵', desc: 'Stitching, alterations, custom clothing', count: '41+' },
  { name: 'Cook', icon: '👨‍🍳', desc: 'Home cooking, catering, meal prep', count: '28+' },
  { name: 'Driver', icon: '🚗', desc: 'Personal driver, cab, goods transport', count: '55+' },
  { name: 'Gardener', icon: '🌿', desc: 'Lawn care, plant maintenance, landscaping', count: '22+' },
  { name: 'Security', icon: '🛡️', desc: 'Home security, event security, watchman', count: '18+' },
];

export default function Categories() {
  return (
    <div>
      <div className="cat-hero">
        <div className="page-container">
          <h1>All Service Categories</h1>
          <p>Browse all available service categories and find the right professional</p>
        </div>
      </div>
      <div className="page-container" style={{ padding: '40px 20px' }}>
        <div className="cat-grid">
          {CATEGORIES.map((cat, i) => (
            <Link to={`/search?category=${cat.name}`} key={i} className="cat-detail-card">
              <div className="cat-detail-icon">{cat.icon}</div>
              <div className="cat-detail-info">
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
                <span className="cat-count">{cat.count} workers</span>
              </div>
              <span className="cat-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
