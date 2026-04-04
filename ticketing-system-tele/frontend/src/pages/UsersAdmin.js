// pages/UsersAdmin.js — Admin user management
import React, { useEffect, useState } from 'react';
import { getUsers, updateUser, deleteUser } from '../services/api';

const ROLE_CLS = { admin:'badge-admin', staff:'badge-staff', requester:'badge-requester' };
const AV_OPTS = ['av-blue','av-purple','av-teal','av-amber'];
const avColor = (name) => AV_OPTS[(name?.charCodeAt(0)||0) % AV_OPTS.length];
const initials = (name) => name ? name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('success');

  const fetchUsers = () => {
    getUsers().then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchUsers(); }, []);

  const showMsg = (text, type='success') => { setMessage(text); setMsgType(type); setTimeout(() => setMessage(''), 3000); };

  const handleRoleChange = async (userId, newRole) => {
    try { await updateUser(userId, { role: newRole }); showMsg('Role updated.'); fetchUsers(); }
    catch { showMsg('Failed to update role.', 'error'); }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try { await deleteUser(userId); showMsg('User deleted.'); fetchUsers(); }
    catch { showMsg('Failed to delete user.', 'error'); }
  };

  if (loading) return <div className="loading-state">Loading users...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-sub">Manage roles — Admin, Staff, Requester</div>
        </div>
        <div style={{fontSize:'13px',color:'var(--text-muted2)',display:'flex',alignItems:'center'}}>
          {users.length} user{users.length !== 1 ? 's' : ''}
        </div>
      </div>

      {message && <div className={msgType === 'error' ? 'alert-error' : 'alert-success'}>{message}</div>}

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Change Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{color:'var(--text-muted2)',fontSize:'12px'}}>#{u.id}</td>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div className={`avatar ${avColor(u.name)}`}>{initials(u.name)}</div>
                    <div>
                      <div style={{fontWeight:500,fontSize:'13px'}}>{u.name}</div>
                      <div style={{fontSize:'11px',color:'var(--text-muted2)'}}>
                        Joined {new Date(u.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{fontSize:'12px',color:'var(--text-muted2)'}}>{u.email}</td>
                <td><span className={`badge ${ROLE_CLS[u.role]}`}>{u.role}</span></td>
                <td>
                  <select defaultValue={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="form-select" style={{width:'auto',padding:'5px 8px',fontSize:'12px'}}>
                    <option value="requester">requester</option>
                    <option value="staff">staff</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <button className="btn-danger" style={{fontSize:'11px',padding:'4px 10px'}}
                    onClick={() => handleDelete(u.id, u.name)}>
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
