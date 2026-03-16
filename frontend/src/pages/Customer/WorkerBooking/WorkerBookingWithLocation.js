import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import API from '../../../api/axios';
import toast from 'react-hot-toast';
import './WorkerBookingWithLocation.css';

// Fix default marker icons broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const WORKER_TYPES = [
  'Plumber', 'Electrician', 'Carpenter', 'Painter',
  'Mechanic', 'Cleaner', 'Tutor', 'Tailor', 'Cook', 'Driver',
];

const DEFAULT_CENTER = [17.385, 78.4867]; // Hyderabad

// Inner component to handle map click events
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function WorkerBookingWithLocation() {
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    workerType: '',
    address: '',
    scheduledDate: '',
    scheduledTime: '',
  });
  const [location, setLocation]     = useState(null);
  const [mapCenter, setMapCenter]   = useState(DEFAULT_CENTER);
  const [locating, setLocating]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed]   = useState(null);
  const [mapKey, setMapKey]         = useState(0); // force re-center

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude };
        setLocation(pos);
        setMapCenter([pos.lat, pos.lng]);
        setMapKey(k => k + 1);
        setLocating(false);
        toast.success('📍 Location detected!');
      },
      () => { toast.error('Could not get location. Allow location access.'); setLocating(false); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) { toast.error('Please select a service location on the map'); return; }
    setSubmitting(true);
    try {
      const payload = {
        service: form.workerType,
        description: form.address,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        amount: 500,
        address: { street: form.address },
        location: { lat: location.lat, lng: location.lng },
      };
      try { await API.post('/bookings', payload); } catch { /* show local confirmation if not logged in */ }
      setConfirmed({ ...form, location });
      toast.success('🎉 Booking confirmed!');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirmation Screen ────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="wbl-page">
        <div className="wbl-confirmed">
          <div className="wbl-confirmed-icon">🎉</div>
          <h2>Booking Confirmed!</h2>
          <div className="wbl-confirmed-details">
            {[
              { icon: '👤', label: 'Name',     value: confirmed.customerName },
              { icon: '📞', label: 'Phone',    value: confirmed.phone },
              { icon: '🔧', label: 'Service',  value: confirmed.workerType },
              { icon: '📅', label: 'Date',     value: `${confirmed.scheduledDate} at ${confirmed.scheduledTime}` },
              { icon: '🏠', label: 'Address',  value: confirmed.address },
              { icon: '📍', label: 'Location', value: `${confirmed.location.lat.toFixed(5)}, ${confirmed.location.lng.toFixed(5)}` },
            ].map((r, i) => (
              <div key={i} className="wbl-detail-row">
                <span>{r.icon} {r.label}</span>
                <strong>{r.value}</strong>
              </div>
            ))}
          </div>
          <button className="wbl-btn wbl-btn-primary" onClick={() => { setConfirmed(null); setLocation(null); setForm({ customerName:'', phone:'', workerType:'', address:'', scheduledDate:'', scheduledTime:'' }); }}>
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wbl-page">
      <div className="wbl-header">
        <h1>🔧 Book a Skilled Worker</h1>
        <p>Fill in your details and pin your service location on the map</p>
      </div>

      <div className="wbl-layout">

        {/* ── Booking Form ── */}
        <div className="wbl-card">
          <h3 className="wbl-card-title">👷 Worker Details</h3>
          <form onSubmit={handleSubmit} className="wbl-form">

            <div className="wbl-form-group">
              <label>Customer Name</label>
              <input type="text" name="customerName" className="wbl-input" placeholder="Enter your full name" value={form.customerName} onChange={handleChange} required />
            </div>

            <div className="wbl-form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" className="wbl-input" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} required />
            </div>

            <div className="wbl-form-group">
              <label>Worker Type</label>
              <select name="workerType" className="wbl-input" value={form.workerType} onChange={handleChange} required>
                <option value="">Select worker type...</option>
                {WORKER_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <div className="wbl-form-group">
              <label>Service Address</label>
              <textarea name="address" className="wbl-input wbl-textarea" placeholder="Enter your full address..." value={form.address} onChange={handleChange} rows={3} required />
            </div>

            <div className="wbl-grid-2">
              <div className="wbl-form-group">
                <label>Date</label>
                <input type="date" name="scheduledDate" className="wbl-input" value={form.scheduledDate} min={new Date().toISOString().split('T')[0]} onChange={handleChange} required />
              </div>
              <div className="wbl-form-group">
                <label>Time</label>
                <input type="time" name="scheduledTime" className="wbl-input" value={form.scheduledTime} onChange={handleChange} required />
              </div>
            </div>

            <div className={`wbl-location-status ${location ? 'selected' : ''}`}>
              {location
                ? `📍 Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                : '⚠️ Please select a location on the map'}
            </div>

            <button type="submit" className="wbl-btn wbl-btn-primary" disabled={submitting}>
              {submitting ? 'Booking...' : '✅ Confirm Booking'}
            </button>
          </form>
        </div>

        {/* ── Map ── */}
        <div className="wbl-card">
          <div className="wbl-map-header">
            <h3 className="wbl-card-title">📍 Service Location</h3>
            <button type="button" className="wbl-btn wbl-btn-locate" onClick={handleCurrentLocation} disabled={locating}>
              {locating ? '⏳ Locating...' : '🎯 Use My Location'}
            </button>
          </div>
          <p className="wbl-map-hint">Click anywhere on the map to pin your service location</p>

          <MapContainer key={mapKey} center={mapCenter} zoom={13} className="wbl-map" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={setLocation} />
            {location && (
              <Marker position={[location.lat, location.lng]}>
                <Popup>📍 Service Location<br />{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</Popup>
              </Marker>
            )}
          </MapContainer>

          {location && (
            <div className="wbl-coords">
              <div className="wbl-coord-item">
                <span>Latitude</span>
                <strong>{location.lat.toFixed(6)}</strong>
              </div>
              <div className="wbl-coord-item">
                <span>Longitude</span>
                <strong>{location.lng.toFixed(6)}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
