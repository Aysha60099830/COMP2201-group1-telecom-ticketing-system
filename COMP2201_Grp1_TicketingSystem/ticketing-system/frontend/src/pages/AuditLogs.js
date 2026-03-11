// pages/AuditLogs.js — Full audit trail view for admin (spec Section 6)

import React, { useEffect, useState } from 'react';
import { getAllLogs } from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllLogs().then((res) => setLogs(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading audit logs...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Audit Trail</h1>
      <p className="text-gray-500 text-sm mb-4">
        All ticket activity is logged here for accountability and transparency (spec Section 6).
      </p>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Timestamp</th>
              <th className="text-left px-4 py-3">Ticket #</th>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-gray-400 text-center">No logs yet.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium">#{log.ticket_id}</td>
                  <td className="px-4 py-3">{log.user_name}</td>
                  <td className="px-4 py-3 text-gray-700">{log.action}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
