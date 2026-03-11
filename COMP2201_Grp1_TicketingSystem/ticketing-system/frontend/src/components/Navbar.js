// components/Navbar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-blue-800 text-white px-6 py-3 flex items-center justify-between shadow">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg tracking-tight">📡 TeleTicket</span>
        {user.role !== 'requester' && (
          <Link to="/dashboard" className="text-sm hover:text-blue-200">Dashboard</Link>
        )}
        <Link to="/tickets" className="text-sm hover:text-blue-200">
          {user.role === 'requester' ? 'My Tickets' : 'All Tickets'}
        </Link>
        {user.role === 'admin' && (
          <>
            <Link to="/users" className="text-sm hover:text-blue-200">Users</Link>
            <Link to="/logs" className="text-sm hover:text-blue-200">Audit Logs</Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-blue-200">
          {user.name} <span className="bg-blue-600 px-2 py-0.5 rounded text-xs ml-1">{user.role}</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm border border-blue-400 px-3 py-1 rounded hover:bg-blue-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
