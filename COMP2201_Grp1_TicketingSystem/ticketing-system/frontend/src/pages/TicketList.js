// pages/TicketList.js — View and filter tickets

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = {
  New: 'bg-blue-100 text-blue-800',
  Assigned: 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-200 text-gray-600',
};

const PRIORITY_BADGE = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const TicketList = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  const fetchTickets = () => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    getTickets(params)
      .then((res) => setTickets(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-900">
          {user?.role === 'requester' ? 'My Tickets' : 'All Tickets'}
        </h1>
        <Link
          to="/tickets/new"
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm font-medium"
        >
          + New Ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {['New', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Priorities</option>
          {['low', 'medium', 'high', 'critical'].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p className="text-gray-500">No tickets found.</p>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Requester</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">#{ticket.id}</td>
                  <td className="px-4 py-3 font-medium">{ticket.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_BADGE[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ticket.requester_name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketList;
