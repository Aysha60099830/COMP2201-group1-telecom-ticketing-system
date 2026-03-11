// pages/NewTicket.js — Create a new ticket (spec Sections 3, 5)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, getFixtureTypes } from '../services/api';

const NewTicket = () => {
  const navigate = useNavigate();
  const [fixtureTypes, setFixtureTypes] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    fixture_type: '',
    fixture_location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFixtureTypes().then((res) => setFixtureTypes(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await createTicket({
        title: form.title,
        description: form.description,
        priority: form.priority,
      });
      navigate(`/tickets/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Submit New Ticket</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="e.g. 5G Tower outage at Al Wakrah"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            required
            value={form.description}
            onChange={handleChange}
            rows={5}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Describe the issue in detail..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fixture Type (Telecom)
          </label>
          <select
            name="fixture_type"
            value={form.fixture_type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">Select fixture (optional)</option>
            {fixtureTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {form.fixture_type && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fixture Location</label>
            <input
              name="fixture_location"
              value={form.fixture_location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="e.g. Al Wakrah Industrial Zone, Tower 4"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border border-gray-300 px-5 py-2 rounded hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTicket;
