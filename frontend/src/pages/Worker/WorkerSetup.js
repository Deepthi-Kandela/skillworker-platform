import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import VoiceGuide from '../../components/VoiceGuide/VoiceGuide';
import toast from 'react-hot-toast';
import './WorkerSetup.css';

const CATEGORIES = ['Plumber', 'Electrician', 'Mechanic', 'Tutor', 'Carpenter', 'Painter', 'Cleaner', 'Tailor', 'Cook', 'Driver', 'Other'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WorkerSetup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: '',
    skills: '',
    bio: '',
    experience: '',
    hourlyRate: '',
    availability: { days: [], startTime: '09:00', endTime: '18:00' },
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleDay = (day) => {
    const days = form.availability.days.includes(day)
      ? form.availability.days.filter(d => d !== day)
      : [...form.availability.days, day];
    setForm({ ...form, availability: { ...form.availability, days } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/workers', {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      toast.success('Worker profile created!');
      navigate('/worker/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-page">
      <div className="setup-container">
        <div className="setup-header">
          <h1>⚡ {t('worker.setup_profile')}</h1>
          <p>{t('worker.register_skills')}</p>
          <div className="setup-voice-hint">
            <VoiceGuide script="register_skills" label={t('voice.voice_guide')} />
          </div>
          <div className="setup-steps">
            {[1, 2, 3].map(s => (
              <div key={s} className={`setup-step ${step >= s ? 'active' : ''}`}>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="setup-form card">
          {step === 1 && (
            <div>
              <h2 className="mb-3">Basic Information</h2>
              <div className="form-group">
                <label>Service Category *</label>
                <select name="category" className="form-control" value={form.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Skills (comma separated) *</label>
                <input type="text" name="skills" className="form-control" placeholder="e.g. Pipe fitting, Leak repair, Bathroom installation" value={form.skills} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Bio / About You</label>
                <textarea name="bio" className="form-control" rows={4} placeholder="Describe your experience and expertise..." value={form.bio} onChange={handleChange} maxLength={500} />
                <small className="text-light">{form.bio.length}/500</small>
              </div>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep(2)} disabled={!form.category || !form.skills}>
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-3">Experience & Pricing</h2>
              <div className="grid-2">
                <div className="form-group">
                  <label>Years of Experience *</label>
                  <input type="number" name="experience" className="form-control" placeholder="e.g. 5" value={form.experience} onChange={handleChange} min={0} required />
                </div>
                <div className="form-group">
                  <label>Hourly Rate (₹) *</label>
                  <input type="number" name="hourlyRate" className="form-control" placeholder="e.g. 500" value={form.hourlyRate} onChange={handleChange} min={1} required />
                </div>
              </div>
              <div className="flex-gap mt-2">
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep(3)} disabled={!form.experience || !form.hourlyRate}>
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-3">Availability</h2>
              <div className="form-group">
                <label>Working Days</label>
                <div className="days-selector">
                  {DAYS.map(d => (
                    <button key={d} type="button" className={`day-btn ${form.availability.days.includes(d) ? 'active' : ''}`} onClick={() => toggleDay(d)}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" className="form-control" value={form.availability.startTime} onChange={e => setForm({ ...form, availability: { ...form.availability, startTime: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" className="form-control" value={form.availability.endTime} onChange={e => setForm({ ...form, availability: { ...form.availability, endTime: e.target.value } })} />
                </div>
              </div>
              <div className="flex-gap mt-2">
                <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? 'Creating Profile...' : '🚀 Create Profile'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
