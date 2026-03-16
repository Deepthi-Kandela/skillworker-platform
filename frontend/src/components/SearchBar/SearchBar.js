import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import './SearchBar.css';

export default function SearchBar({ placeholder = 'What service do you need?', compact = false }) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?category=${query}&city=${city}`);
  };

  return (
    <form className={`searchbar ${compact ? 'compact' : ''}`} onSubmit={handleSubmit}>
      <div className="searchbar-field">
        <FiSearch className="searchbar-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {!compact && (
        <div className="searchbar-field">
          <FiMapPin className="searchbar-icon" />
          <input
            type="text"
            placeholder="Your city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      )}
      <button type="submit" className="btn btn-primary">Search</button>
    </form>
  );
}
