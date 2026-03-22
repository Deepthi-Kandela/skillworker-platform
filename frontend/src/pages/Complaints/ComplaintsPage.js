import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Spinner, EmptyState, StatusBadge } from '../../components/common';
import toast from 'react-hot-toast';
import './Complaints.css';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get('/complaints/my')
      .then(({ data }) => setComplaints(data))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await API.post('/complaints', form);
      setComplaints([data, ...complaints]);
      toast.success('Complaint submitted!');
      setShowForm(false);
      setForm({ subject: '', description: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const STATUS_COLOR = { open: 'badge-warning', 'in-review': 'badge-info', resolved: 'badge-success', closed: 'badge-danger' };

  if (loading) return <Spinner />;

  return (
    <div className="complaints-page">
      <div className="complaints-container">
        <div className="complaints-header">
          <div>
            <h1>📢 Complaints</h1>
            <p className="text-light">Report issues or concerns</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ New Complaint'}
          </button>
        </div>

        {showForm && (
          <form className="complaint-form card" onSubmit={handleSubmit}>
            <h3>File a Complaint</h3>
            <div className="form-group">
              <label>Subject</label>
              <input type="text" className="form-control" placeholder="Brief subject..." value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" rows={4} placeholder="Describe the issue in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required maxLength={1000} />
              <small className="text-light">{form.description.length}/1000</small>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : '📤 Submit Complaint'}
            </button>
          </form>
        )}

        {complaints.length === 0 ? (
          <EmptyState icon="📢" title="No complaints" subtitle="You haven't filed any complaints yet" />
        ) : (
          <div className="complaints-list">
            {complaints.map(c => (
              <div key={c._id} className="complaint-card card">
                <div className="complaint-top">
                  <h4>{c.subject}</h4>
                  <span className={`badge ${STATUS_COLOR[c.status]}`}>{c.status}</span>
                </div>
                <p className="complaint-desc">{c.description}</p>
                {c.adminNote && (
                  <div className="complaint-admin-note">
                    <strong>Admin Response:</strong> {c.adminNote}
                  </div>
                )}
                <p className="complaint-date text-light text-sm">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
