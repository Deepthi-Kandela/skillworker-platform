import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import WorkerCard from '../components/WorkerCard/WorkerCard';
import { Spinner, EmptyState } from '../components/common';
import { FiSearch, FiFilter, FiMapPin, FiSliders } from 'react-icons/fi';
import './Search.css';

const CATEGORIES = ['Plumber', 'Electrician', 'Mechanic', 'Tutor', 'Carpenter', 'Painter', 'Cleaner', 'Tailor', 'Cook', 'Driver'];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    category: params.get('category') || '',
    city: params.get('city') || '',
    minRate: '',
    maxRate: '',
    rating: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
      const { data } = await API.get(`/workers/search?${query}`);
      setWorkers(data.workers);
      setTotal(data.total);
    } catch {
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkers(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const clearFilters = () => {
    setFilters({ category: '', city: '', minRate: '', maxRate: '', rating: '' });
  };

  return (
    <div className="search-page">
      <div className="search-hero">
        <div className="page-container">
          <h1>Find Skilled Workers</h1>
          <p>Search from hundreds of verified professionals near you</p>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-field">
              <FiSearch />
              <input
                type="text"
                name="category"
                placeholder="Service or skill..."
                value={filters.category}
                onChange={handleFilterChange}
              />
            </div>
            <div className="search-field">
              <FiMapPin />
              <input
                type="text"
                name="city"
                placeholder="City..."
                value={filters.city}
                onChange={handleFilterChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowFilters(!showFilters)}>
              <FiSliders /> Filters
            </button>
          </form>
        </div>
      </div>

      <div className="page-container search-body">
        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel card">
            <div className="flex-between mb-2">
              <h3><FiFilter /> Filters</h3>
              <button className="btn btn-sm btn-outline" onClick={clearFilters}>Clear All</button>
            </div>
            <div className="filter-group">
              <label>Category</label>
              <select name="category" className="form-control" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Min Rate (₹/hr)</label>
              <input type="number" name="minRate" className="form-control" placeholder="0" value={filters.minRate} onChange={handleFilterChange} />
            </div>
            <div className="filter-group">
              <label>Max Rate (₹/hr)</label>
              <input type="number" name="maxRate" className="form-control" placeholder="5000" value={filters.maxRate} onChange={handleFilterChange} />
            </div>
            <div className="filter-group">
              <label>Min Rating</label>
              <select name="rating" className="form-control" value={filters.rating} onChange={handleFilterChange}>
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full mt-2" onClick={fetchWorkers}>Apply Filters</button>
          </div>
        )}

        {/* Category Pills */}
        <div className="category-pills">
          <button className={`pill ${!filters.category ? 'active' : ''}`} onClick={() => setFilters({ ...filters, category: '' })}>All</button>
          {CATEGORIES.map(c => (
            <button key={c} className={`pill ${filters.category === c ? 'active' : ''}`} onClick={() => { setFilters({ ...filters, category: c }); }}>
              {c}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="results-header">
          <p className="results-count">{total} workers found</p>
        </div>

        {loading ? <Spinner /> : workers.length === 0 ? (
          <EmptyState icon="🔍" title="No workers found" subtitle="Try adjusting your search filters" />
        ) : (
          <div className="workers-grid">
            {workers.map(w => <WorkerCard key={w._id} worker={w} />)}
          </div>
        )}
      </div>
    </div>
  );
}
