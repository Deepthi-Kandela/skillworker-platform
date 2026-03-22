import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import API from '../../../api/axios';
import { Spinner, EmptyState } from '../../../components/common';
import { FiMapPin, FiNavigation } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './NearbyWorkers.css';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom user location marker (blue)
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Custom worker marker (red)
const workerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const DEFAULT_CENTER = [17.385, 78.4867];

export default function NearbyWorkers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [workers, setWorkers]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords]     = useState(null);
  const [category, setCategory] = useState('');
  const [radius, setRadius]     = useState(10);
  const [view, setView]         = useState('map'); // 'map' | 'list'

  const locate = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        setCoords({ lat: c.latitude, lng: c.longitude });
        setLocating(false);
        toast.success('📍 Location detected!');
      },
      () => { toast.error('Could not get location. Please allow location access.'); setLocating(false); }
    );
  };

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    const params = new URLSearchParams({ lat: coords.lat, lng: coords.lng, maxDistance: radius * 1000 });
    if (category) params.append('category', category);
    API.get(`/workers/nearby?${params}`)
      .then(({ data }) => setWorkers(data))
      .catch(() => toast.error('Failed to fetch nearby workers'))
      .finally(() => setLoading(false));
  }, [coords, radius, category]);

  const mapCenter = coords ? [coords.lat, coords.lng] : DEFAULT_CENTER;

  return (
    <div className="page-container nearby-page">
      <div className="page-header">
        <h1><FiMapPin /> {t('home.find_worker')}</h1>
        <p>Find skilled workers near your location</p>
      </div>

      {/* Controls */}
      <div className="nearby-controls card">
        <div className="nearby-filters">
          <input className="form-control" placeholder="Category (e.g. Plumber)" value={category} onChange={e => setCategory(e.target.value)} />
          <select className="form-control" value={radius} onChange={e => setRadius(Number(e.target.value))}>
            <option value={5}>Within 5 km</option>
            <option value={10}>Within 10 km</option>
            <option value={25}>Within 25 km</option>
            <option value={50}>Within 50 km</option>
          </select>
        </div>
        <div className="nearby-actions">
          <button className="btn btn-primary locate-btn" onClick={locate} disabled={locating}>
            <FiNavigation /> {locating ? 'Locating...' : 'Use My Location'}
          </button>
          <div className="view-toggle">
            <button className={`view-btn ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>🗺 Map</button>
            <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>📋 List</button>
          </div>
        </div>
      </div>

      {/* Map View */}
      {view === 'map' && (
        <div className="nearby-map-wrap card">
          <MapContainer center={mapCenter} zoom={coords ? 13 : 11} className="nearby-map" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* User location marker */}
            {coords && (
              <Marker position={[coords.lat, coords.lng]} icon={userIcon}>
                <Popup>📍 Your Location</Popup>
              </Marker>
            )}
            {/* Worker markers */}
            {workers.map(w => {
              const wCoords = w.user?.location?.coordinates;
              if (!wCoords || (wCoords[0] === 0 && wCoords[1] === 0)) return null;
              return (
                <Marker key={w._id} position={[wCoords[1], wCoords[0]]} icon={workerIcon}>
                  <Popup>
                    <div className="map-popup">
                      <strong>{w.user?.name}</strong>
                      <p>{w.category} · ⭐ {w.rating}</p>
                      <p>₹{w.hourlyRate}/hr</p>
                      <button className="map-popup-btn" onClick={() => navigate(`/worker/${w._id}`)}>View Profile</button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          {!coords && (
            <div className="map-overlay-hint">
              <p>📍 Click "Use My Location" to find workers near you</p>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <>
          {!coords && !loading && <EmptyState icon="📍" title="Share your location" subtitle="Tap 'Use My Location' to find workers near you" />}
          {loading && <Spinner />}
          {coords && !loading && workers.length === 0 && <EmptyState icon="🔍" title={t('common.no_results')} subtitle={t('common.adjust_filters')} />}
          <div className="nearby-grid">
            {workers.map(w => (
              <div key={w._id} className="nearby-card card" onClick={() => navigate(`/worker/${w._id}`)}>
                <img
                  src={w.user?.avatar || `https://ui-avatars.com/api/?name=${w.user?.name}&background=6C63FF&color=fff&size=80`}
                  alt={w.user?.name}
                  className="nearby-avatar"
                />
                <div className="nearby-info">
                  <h3>{w.user?.name}</h3>
                  <p className="nearby-category">{w.category}</p>
                  <p className="nearby-location"><FiMapPin size={12} /> {w.user?.address?.city}</p>
                  <div className="nearby-meta">
                    <span>⭐ {w.rating}</span>
                    <span>₹{w.hourlyRate}/hr</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm nearby-book-btn" onClick={(e) => { e.stopPropagation(); navigate(`/book/${w._id}`); }}>Book</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
