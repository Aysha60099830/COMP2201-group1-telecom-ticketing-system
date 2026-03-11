// pages/Dashboard.js — Metrics Dashboard (spec Section 8)

import React, { useEffect, useState } from 'react';
import { getDashboardMetrics } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  New: 'bg-blue-100 text-blue-800',
  Assigned: 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-200 text-gray-700',
};

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardMetrics()
      .then((res) => setMetrics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;
  if (!metrics) return <div className="p-6 text-red-500">Failed to load metrics.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Welcome, {user?.name} ({user?.role})</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Tickets" value={metrics.total_tickets} color="blue" />
        <MetricCard label="Open Tickets" value={metrics.open_tickets} color="orange" />
        <MetricCard label="Avg Resolution" value={`${metrics.avg_resolution_hours}h`} color="green" />
        <MetricCard label="Closed" value={metrics.status_counts['Closed']} color="gray" />
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded shadow p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Ticket Lifecycle Status</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(metrics.status_counts).map(([status, count]) => (
            <div key={status} className={`px-4 py-2 rounded-full text-sm font-medium ${STATUS_COLORS[status]}`}>
              {status}: <span className="font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white rounded shadow p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Priority Distribution</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(metrics.priority_counts).map(([priority, count]) => (
            <div key={priority} className={`px-4 py-2 rounded-full text-sm font-medium ${PRIORITY_COLORS[priority]}`}>
              {priority}: <span className="font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Workload */}
      {metrics.staff_workload?.length > 0 && (
        <div className="bg-white rounded shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Staff Workload (Active Tickets)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Staff Member</th>
                <th className="pb-2">Active Tickets</th>
              </tr>
            </thead>
            <tbody>
              {metrics.staff_workload.map((s, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{s.name}</td>
                  <td className="py-2 font-bold">{s.active_tickets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800',
  };
  return (
    <div className={`border rounded p-4 ${colors[color]}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm mt-1">{label}</div>
    </div>
  );
};

export default Dashboard;
