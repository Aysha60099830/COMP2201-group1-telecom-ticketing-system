// pages/AuditLogs.js — Full audit trail for admin
import React, { useEffect, useState } from 'react';
import { getAllLogs } from '../services/api';
import { Link } from 'react-router-dom';

const AV_OPTS = ['av-blue','av-purple','av-teal','av-amber'];
const avColor = (name) => AV_OPTS[(name?.charCodeAt(0)||0) % AV_OPTS.length];
const initials = (name) => name ? name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllLogs().then(r => setLogs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const visible = logs.filter(l =>
    !search ||
    l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    String(l.ticket_id).includes(search)
  );

  if (loading) return <div className="loading-state">Loading audit logs...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Audit Trail</div>
          <div className="page-sub">all ticket changes logged with user, action, and timestamp</div>
        </div>
      </div>

      <div style={{marginBottom:'16px',display:'flex',gap:'10px'}}>
        <input placeholder="Search by user, action, or ticket ID..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="form-input" style={{maxWidth:'300px'}} />
        <div style={{fontSize:'13px',color:'var(--text-muted2)',display:'flex',alignItems:'center'}}>
          {visible.length} log{visible.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="panel">
        {visible.length === 0 ? (
          <div style={{padding:'40px',textAlign:'center',color:'var(--text-muted2)',fontSize:'13px'}}>
            {search ? 'No logs match your search.' : 'No audit logs yet.'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Ticket</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(log => (
                <tr key={log.id}>
                  <td style={{whiteSpace:'nowrap',fontSize:'12px',color:'var(--text-muted2)'}}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <div className={`avatar ${avColor(log.user_name)}`} style={{width:'26px',height:'26px',fontSize:'10px'}}>
                        {initials(log.user_name)}
                      </div>
                      <span style={{fontSize:'13px',fontWeight:500}}>{log.user_name}</span>
                    </div>
                  </td>
                  <td>
                    <Link to={`/tickets/${log.ticket_id}`} style={{color:'var(--cyan)',textDecoration:'none',fontWeight:500,fontSize:'13px'}}>
                      #{log.ticket_id}
                    </Link>
                  </td>
                  <td style={{fontSize:'13px',color:'var(--text-secondary)'}}>{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
