import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ logo, links }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">{logo}</div>
      <nav className="sidebar-nav">
        {links.map((link, i) => (
          <NavLink
            key={i}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            end={link.end}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
