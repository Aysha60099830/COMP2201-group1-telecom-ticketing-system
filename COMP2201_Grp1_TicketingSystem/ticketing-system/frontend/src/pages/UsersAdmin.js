// pages/UsersAdmin.js — Admin user management page

import React, { useEffect, useState } from 'react';
import { getUsers, updateUser, deleteUser } from '../services/api';

const ROLE_BADGE = {
  admin: 'bg-red-100 text-red-700',
  staff: 'bg-blue-100 text-blue-700',
  requester: 'bg-gray-100 text-gray-700',
};

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchUsers = () => {
    getUsers().then((res) => setUsers(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      setMessage('Role updated successfully.');
      fetchUsers();
    } catch (err) {
      setMessage('Failed to update role.');
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try {
      await deleteUser(userId);
      setMessage('User deleted.');
      fetchUsers();
    } catch (err) {
      setMessage('Failed to delete user.');
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading users...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">User Management</h1>

      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Change Role</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">#{u.id}</td>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_BADGE[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                  >
                    <option value="requester">requester</option>
                    <option value="staff">staff</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(u.id, u.name)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersAdmin;
