import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { StarRating, Spinner, StatusBadge } from '../components/common';
import VoiceGuide from '../components/VoiceGuide/VoiceGuide';
import { FiMapPin, FiClock, FiStar, FiCheckCircle, FiPhone, FiCalendar, FiNavigation } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './WorkerProfile.css';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapClickHandler({ onSelect }) {
  useMapEvents({ click(e) { onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }); } });
  return null;
}

export default function WorkerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [booking, setBooking] = useState({ scheduledDate: '', scheduledTime: '', service: '', description: '', amount: 0, paymentMethod: 'online' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [serviceLocation, setServiceLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setServiceLocation({ lat: coords.latitude, lng: coords.longitude });
        setLocating(false);
        toast.success('📍 Location detected!');
      },
      () => { toast.error('Could not get location'); setLocating(false); }
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, rRes] = await Promise.all([
          API.get(`/workers/${id}`),
          API.get(`/reviews/worker/${id}`),
        ]);
        setWorker(wRes.data);
        setReviews(rRes.data);
        setBooking(b => ({ ...b, amount: wRes.data.hourlyRate, service: wRes.data.category }));
      } catch {
        toast.error('Worker not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setBookingLoading(true);
    try {
      await API.post('/bookings', { worker: worker.user._id, workerProfile: worker._id, ...booking, address: user.address, serviceLocation });
      toast.success('Booking request sent!');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!worker) return <div className="page-container mt-4"><p>Worker not found.</p></div>;

  const { user: u, category, skills, bio, experience, hourlyRate, rating, totalReviews, isAvailable, availability, portfolio } = worker;

  return (
    <div className="worker-profile-page">
      {/* Header Banner */}
      <div className="profile-banner">
        <div className="page-container">
          <div className="profile-header">
            <img
              src={u?.avatar || `https://ui-avatars.com/api/?name=${u?.name}&background=6C63FF&color=fff&size=120`}
              alt={u?.name}
              className="profile-avatar"
            />
            <div className="profile-info">
              <div className="profile-name-row">
                <h1>{u?.name}</h1>
                {worker.isVerified && <span className="verified-chip"><FiCheckCircle /> Verified</span>}
                <span className={`avail-chip ${isAvailable ? 'avail' : 'busy'}`}>{isAvailable ? '● Available' : '● Busy'}</span>
              </div>
              <p className="profile-category">{category}</p>
              <div className="profile-meta">
                <span><FiMapPin /> {u?.address?.city}, {u?.address?.state}</span>
                <span><FiClock /> {experience} years experience</span>
                <span><FiStar /> {rating} ({totalReviews} reviews)</span>
              </div>
              <div className="profile-skills">
                {skills?.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
              </div>
            </div>
            <div className="profile-rate-box">
              <div className="rate-display">
                <span className="rate-big">₹{hourlyRate}</span>
                <span className="rate-unit">/hour</span>
              </div>
              <StarRating rating={rating} size={18} />
              <p className="rate-reviews">{totalReviews} reviews</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container profile-body">
        <div className="profile-main">
          {/* Tabs */}
          <div className="profile-tabs">
            {['about', 'portfolio', 'reviews'].map(tab => (
              <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'about' && (
            <div className="card">
              <h3 className="mb-2">About</h3>
              <p style={{ color: 'var(--text-light)', lineHeight: 1.8 }}>{bio || 'No bio provided.'}</p>

              <h3 className="mt-3 mb-2">Availability</h3>
              <div className="avail-days">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <span key={d} className={`day-chip ${availability?.days?.includes(d) ? 'active' : ''}`}>{d}</span>
                ))}
              </div>
              <p className="mt-1 text-light text-sm">
                <FiClock style={{ marginRight: 4 }} />
                {availability?.startTime} – {availability?.endTime}
              </p>

              <h3 className="mt-3 mb-2">Contact</h3>
              <p className="flex-gap"><FiPhone /> {u?.phone}</p>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="card">
              <h3 className="mb-2">Portfolio</h3>
              {portfolio?.length > 0 ? (
                <div className="portfolio-grid">
                  {portfolio.map((img, i) => <img key={i} src={img} alt={`work-${i}`} className="portfolio-img" />)}
                </div>
              ) : <p className="text-light">No portfolio images uploaded.</p>}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="card">
              <h3 className="mb-3">Customer Reviews ({totalReviews})</h3>
              {reviews.length === 0 ? <p className="text-light">No reviews yet.</p> : (
                <div className="reviews-list">
                  {reviews.map(r => (
                    <div key={r._id} className="review-item">
                      <div className="review-header">
                        <img
                          src={r.customer?.avatar || `https://ui-avatars.com/api/?name=${r.customer?.name}&background=FF6584&color=fff&size=40`}
                          alt={r.customer?.name}
                          className="review-avatar"
                        />
                        <div>
                          <p className="fw-600">{r.customer?.name}</p>
                          <StarRating rating={r.rating} size={14} />
                        </div>
                        <span className="text-light text-sm" style={{ marginLeft: 'auto' }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="review-comment">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="booking-sidebar">
          <div className="card booking-card">
            <h3 className="mb-3"><FiCalendar /> {t('booking.book_worker')}</h3>
            {!user ? (
              <div className="text-center">
                <p className="text-light mb-2">Login to book this worker</p>
                <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>Login to Book</button>
              </div>
            ) : user.role === 'worker' ? (
              <p className="text-light text-center">Workers cannot book other workers.</p>
            ) : (
              <form onSubmit={handleBook}>
                <div className="form-group">
                  <label>Service</label>
                  <input type="text" className="form-control" value={booking.service} onChange={e => setBooking({ ...booking, service: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" className="form-control" value={booking.scheduledDate} min={new Date().toISOString().split('T')[0]} onChange={e => setBooking({ ...booking, scheduledDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" className="form-control" value={booking.scheduledTime} onChange={e => setBooking({ ...booking, scheduledTime: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows={3} placeholder="Describe your requirement..." value={booking.description} onChange={e => setBooking({ ...booking, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Estimated Amount (₹)</label>
                  <input type="number" className="form-control" value={booking.amount} onChange={e => setBooking({ ...booking, amount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>{t('payment.select_method')}</label>
                  <div className="payment-method-inline">
                    {[{id:'online',icon:'💳'},{id:'upi',icon:'📱'},{id:'cash',icon:'💵'}].map(m => (
                      <button key={m.id} type="button"
                        className={`payment-inline-btn ${booking.paymentMethod === m.id ? 'active' : ''}`}
                        onClick={() => setBooking({ ...booking, paymentMethod: m.id })}>
                        {m.icon} {t(`payment.${m.id}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="booking-summary">
                  <div className="flex-between"><span>{t('booking.service')}</span><span>₹{hourlyRate}/hr</span></div>
                  <div className="flex-between fw-600"><span>Total</span><span className="text-primary">₹{booking.amount}</span></div>
                </div>
                <VoiceGuide script="booking_confirmed" label={t('voice.voice_guide')} />

                {/* Service Location Map */}
                <div className="form-group">
                  <div className="booking-map-header">
                    <label><FiMapPin /> Service Location</label>
                    <button type="button" className="btn-locate-sm" onClick={handleCurrentLocation} disabled={locating}>
                      <FiNavigation size={12} /> {locating ? 'Locating...' : 'My Location'}
                    </button>
                  </div>
                  <p className="booking-map-hint">Click map to pin your location</p>
                  <MapContainer
                    center={serviceLocation ? [serviceLocation.lat, serviceLocation.lng] : [17.385, 78.4867]}
                    zoom={serviceLocation ? 14 : 11}
                    className="booking-map"
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onSelect={setServiceLocation} />
                    {serviceLocation && (
                      <Marker position={[serviceLocation.lat, serviceLocation.lng]}>
                        <Popup>📍 Service Location</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                  {serviceLocation && (
                    <p className="booking-map-coords">
                      📍 {serviceLocation.lat.toFixed(4)}, {serviceLocation.lng.toFixed(4)}
                    </p>
                  )}
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg mt-2" disabled={bookingLoading}>
                  {bookingLoading ? t('common.loading') : t('booking.send_request')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
