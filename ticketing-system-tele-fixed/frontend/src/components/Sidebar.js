// components/Sidebar.js — Telecom-themed navigation sidebar
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '??';

const AV_COLORS = ['av-blue','av-purple','av-teal','av-amber'];
const avatarColor = (name) => AV_COLORS[(name?.charCodeAt(0) || 0) % AV_COLORS.length];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navCls = ({ isActive }) => 'nav-item' + (isActive ? ' active' : '');

  return (
    <div className="sidebar">
      <div className="logo-area">
        <div className="logo-mark">▲ TeleCo Portal</div>
        <div className="logo-sub">Network Operations</div>
      </div>

      <div style={{marginTop:'8px'}}>
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <NavLink to="/dashboard" className={navCls}>
            <span className="nav-dot" style={{background:'#00c8ff'}}></span>
            Dashboard
          </NavLink>
        )}
        <NavLink to="/tickets" className={navCls}>
          <span className="nav-dot" style={{background:'#f59e0b'}}></span>
          {user?.role === 'requester' ? 'My Tickets' : 'All Tickets'}
        </NavLink>
        <NavLink to="/tickets/new" className={navCls}>
          <span className="nav-dot" style={{background:'#10b981'}}></span>
          New Ticket
        </NavLink>
        {user?.role === 'admin' && (
          <>
            <NavLink to="/users" className={navCls}>
              <span className="nav-dot" style={{background:'#a78bfa'}}></span>
              Users
            </NavLink>
            <NavLink to="/logs" className={navCls}>
              <span className="nav-dot" style={{background:'#4a7fa5'}}></span>
              Audit Logs
            </NavLink>
          </>
        )}
      </div>

      <div className="sidebar-user">
        <div className={`avatar ${avatarColor(user?.name)}`} style={{background:'#1e3a5f',color:'#00c8ff'}}>
          {initials(user?.name || 'User')}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div className="user-name" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {user?.name}
          </div>
          <div className="user-role">{user?.role}</div>
        </div>
        <button onClick={handleLogout} title="Logout"
          style={{background:'none',border:'none',color:'#4a7fa5',cursor:'pointer',fontSize:'14px',padding:'2px'}}>
          ⏏
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
