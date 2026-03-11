// pages/TicketDetail.js — View, update lifecycle, assign, and see audit trail

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicket, updateTicket, getTicketLogs, getStaff, deleteTicket } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Lifecycle rules — spec Section 5
const NEXT_STATUS = {
  New: 'Assigned',
  Assigned: 'In Progress',
  'In Progress': 'Resolved',
  Resolved: 'Closed',
  Closed: null,
};

const STATUS_BADGE = {
  New: 'bg-blue-100 text-blue-800',
  Assigned: 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-200 text-gray-600',
};

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [logs, setLogs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [assignTo, setAssignTo] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    Promise.all([getTicket(id), getTicketLogs(id)])
      .then(([tRes, lRes]) => {
        setTicket(tRes.data);
        setLogs(lRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    if (user?.role === 'admin') {
      getStaff().then((res) => setStaff(res.data)).catch(console.error);
    }
  }, [id]);

  const advanceStatus = async () => {
    const next = NEXT_STATUS[ticket.status];
    if (!next) return;
    try {
      await updateTicket(id, { status: next });
      setMessage(`Status updated to '${next}'`);
      refresh();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Update failed');
    }
  };

  const handleAssign = async () => {
    if (!assignTo) return;
    try {
      await updateTicket(id, { assigned_to: parseInt(assignTo), status: 'Assigned' });
      setMessage('Ticket assigned successfully');
      refresh();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Assignment failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this ticket?')) return;
    await deleteTicket(id);
    navigate('/tickets');
  };

  if (loading) return <div className="p-6 text-gray-500">Loading ticket...</div>;
  if (!ticket) return <div className="p-6 text-red-500">Ticket not found.</div>;

  const nextStatus = NEXT_STATUS[ticket.status];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">#{ticket.id} — {ticket.title}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Submitted by <strong>{ticket.requester_name}</strong> on{' '}
            {new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_BADGE[ticket.status]}`}>
            {ticket.status}
          </span>
          {user?.role === 'admin' && (
            <button
              onClick={handleDelete}
              className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>
      )}

      {/* Ticket Info */}
      <div className="bg-white rounded shadow p-5 mb-5">
        <p className="text-gray-700 whitespace-pre-line mb-4">{ticket.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Priority:</span> <strong className="capitalize">{ticket.priority}</strong></div>
          <div><span className="text-gray-500">Assigned To:</span> <strong>{ticket.assignee_name || 'Unassigned'}</strong></div>
          {ticket.fixture && (
            <>
              <div><span className="text-gray-500">Fixture Type:</span> <strong>{ticket.fixture.type}</strong></div>
              <div><span className="text-gray-500">Location:</span> <strong>{ticket.fixture.location}</strong></div>
            </>
          )}
        </div>
      </div>

      {/* Lifecycle Controls — spec Section 5 */}
      {user?.role !== 'requester' && nextStatus && (
        <div className="bg-white rounded shadow p-5 mb-5">
          <h2 className="font-semibold text-gray-700 mb-3">Advance Lifecycle</h2>
          <p className="text-sm text-gray-500 mb-3">
            Current: <strong>{ticket.status}</strong> → Next: <strong>{nextStatus}</strong>
          </p>
          <button
            onClick={advanceStatus}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm"
          >
            Move to "{nextStatus}"
          </button>
        </div>
      )}

      {/* Admin: Assign Ticket — spec Section 4 */}
      {user?.role === 'admin' && ticket.status === 'New' && (
        <div className="bg-white rounded shadow p-5 mb-5">
          <h2 className="font-semibold text-gray-700 mb-3">Assign Ticket</h2>
          <div className="flex gap-3">
            <select
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
            >
              <option value="">Select staff member</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm"
            >
              Assign
            </button>
          </div>
        </div>
      )}

      {/* Audit Trail — spec Section 6 */}
      <div className="bg-white rounded shadow p-5">
        <h2 className="font-semibold text-gray-700 mb-3">Audit Trail</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm">No activity logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {logs.map((log) => (
              <li key={log.id} className="border-l-2 border-blue-300 pl-3 text-sm">
                <span className="text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                {' — '}
                <strong>{log.user_name}</strong>: {log.action}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;
