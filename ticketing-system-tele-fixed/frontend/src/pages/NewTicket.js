// pages/NewTicket.js — Create a new ticket
// Priority fix: Requesters cannot select priority. It defaults to 'Medium'.
// Only Staff and Admin can adjust priority after the ticket is created.
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTicket, getFixtureTypes } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TELECOM_FIXTURES = ['5G Tower','Fiber Node','Signal Booster','Core Router','Data Center','BTS Station','OLT Node','Microwave Link'];
const LOCATIONS = ['Doha — West Bay','Doha — Al Rayyan','Doha — The Pearl','Al Wakra','Umm Salal','Lusail City','Al Khor','Al Daayen'];

const NewTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRequester = user?.role === 'requester';

  const [fixtureTypes, setFixtureTypes] = useState([]);
  const [form, setForm] = useState({
    title:'', description:'',
    priority: isRequester ? 'Medium' : 'Medium', // requesters always send Medium
    fixture_type:'', fixture_location:''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFixtureTypes().then(r => setFixtureTypes(r.data)).catch(() => setFixtureTypes(TELECOM_FIXTURES));
  }, []);

  const types = fixtureTypes.length > 0 ? fixtureTypes : TELECOM_FIXTURES;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        fixture_type: form.fixture_type || undefined,
        fixture_location: form.fixture_location || undefined,
      };
      // Only include priority in payload for staff/admin — backend ignores it for requesters anyway,
      // but we keep the frontend consistent with the backend rule.
      if (!isRequester) {
        payload.priority = form.priority;
      }
      const res = await createTicket(payload);
      navigate(`/tickets/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create ticket');
    } finally { setLoading(false); }
  };

  return (
    <div style={{maxWidth:'680px'}}>
      <div className="page-header">
        <div>
          <div style={{fontSize:'13px',color:'var(--text-muted2)',marginBottom:'6px'}}>
            <Link to="/tickets" style={{color:'var(--text-muted2)',textDecoration:'none'}}>← Tickets</Link>
          </div>
          <div className="page-title">Submit New Ticket</div>
          <div className="page-sub">ticket fields: title, description, priority, requester, status</div>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="panel">
        <div className="panel-header">Ticket Information</div>
        <form onSubmit={handleSubmit} style={{padding:'24px',display:'flex',flexDirection:'column',gap:'18px'}}>

          <div>
            <label className="form-label">Issue Title *</label>
            <input name="title" required value={form.title} onChange={handleChange}
              className="form-input" placeholder="e.g. 5G Tower signal drop — Zone 4, Al Wakra" />
          </div>

          <div>
            <label className="form-label">Description *</label>
            <textarea name="description" required value={form.description} onChange={handleChange}
              className="form-textarea" rows={5}
              placeholder="Describe the issue in detail — what happened, when it started, any error messages..." />
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>

            {/* Priority — only visible to Staff and Admin */}
            {isRequester ? (
              <div>
                <label className="form-label">Priority</label>
                <div style={{
                  padding:'10px 12px', borderRadius:'7px',
                  background:'#0a1628', border:'0.5px solid #1e3a5f',
                  fontSize:'13px', color:'#4a7fa5'
                }}>
                  Medium (default) — a staff member will review
                </div>
                <div style={{fontSize:'11px',color:'#4a7fa5',marginTop:'5px'}}>
                  Priority is set by staff after reviewing your ticket.
                </div>
              </div>
            ) : (
              <div>
                <label className="form-label">Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange} className="form-select">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            )}

            <div>
              <label className="form-label">Fixture Type (Telecom)</label>
              <select name="fixture_type" value={form.fixture_type} onChange={handleChange} className="form-select">
                <option value="">None / Not applicable</option>
                {types.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {form.fixture_type && (
            <div>
              <label className="form-label">Fixture Location</label>
              <input name="fixture_location" value={form.fixture_location} onChange={handleChange}
                className="form-input" placeholder="e.g. Al Wakra Industrial Zone, Tower 4"
                list="location-list"
              />
              <datalist id="location-list">
                {LOCATIONS.map(l => <option key={l} value={l} />)}
              </datalist>
            </div>
          )}

          <div style={{borderTop:'0.5px solid var(--border-light)',paddingTop:'18px',display:'flex',gap:'10px'}}>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTicket;
