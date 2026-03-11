// pages/Register.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'requester' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-blue-800">Create Account</h1>
        <p className="text-gray-500 mb-6 text-sm">Telecom Ticketing System — COMP2201</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input name="name" required value={form.name} onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="e.g. Abdulla Ahmed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" required value={form.email} onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="you@telecom.qa" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input name="password" type="password" required value={form.password} onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Min 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select name="role" value={form.role} onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="requester">Requester</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 disabled:opacity-50 font-medium">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
