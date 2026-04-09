// pages/TicketList.js — View and filter all tickets
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_CLS = { New:'badge-new', Assigned:'badge-assigned', 'In Progress':'badge-progress', Resolved:'badge-resolved', Closed:'badge-closed' };
const PRIORITY_CLS = { low:'badge-low', medium:'badge-medium', high:'badge-high', critical:'badge-critical', Low:'badge-low', Medium:'badge-medium', High:'badge-high', Critical:'badge-critical' };

const AV_OPTS = ['av-blue','av-purple','av-teal','av-amber'];
const avColor = (name) => AV_OPTS[(name?.charCodeAt(0)||0) % AV_OPTS.length];
const initials = (name) => name ? name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';

const TicketList = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status:'', priority:'' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    getTickets(params).then(r => setTickets(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [filters]);

  const visible = tickets.filter(t =>
    !search || t.title?.toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{user?.role === 'requester' ? 'My Tickets' : 'All Tickets'}</div>
          <div className="page-sub">{visible.length} ticket{visible.length !== 1 ? 's' : ''} shown</div>
        </div>
        <Link to="/tickets/new" className="btn-primary">+ New Ticket</Link>
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:'10px',marginBottom:'18px',flexWrap:'wrap'}}>
        <input
          placeholder="Search by title or ID..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="form-input" style={{maxWidth:'240px'}}
        />
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="form-select" style={{width:'auto'}}>
          <option value="">All Statuses</option>
          {['New','Assigned','In Progress','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})} className="form-select" style={{width:'auto'}}>
          <option value="">All Priorities</option>
          {['Low','Medium','High','Critical'].map(p => <option key={p}>{p}</option>)}
        </select>
        {(filters.status || filters.priority || search) && (
          <button className="btn-secondary" onClick={() => { setFilters({status:'',priority:''}); setSearch(''); }}>
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">Loading tickets...</div>
      ) : visible.length === 0 ? (
        <div className="panel" style={{padding:'40px',textAlign:'center',color:'var(--text-muted2)'}}>
          No tickets found. <Link to="/tickets/new" style={{color:'var(--cyan)'}}>Submit one?</Link>
        </div>
      ) : (
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title / Fixture</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Requester</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(t => (
                <tr key={t.id}>
                  <td style={{color:'var(--text-muted2)',fontWeight:500,fontSize:'12px'}}>#{t.id}</td>
                  <td>
                    <div style={{fontWeight:500,color:'var(--text-secondary)'}}>{t.title}</div>
                    {t.fixture && (
                      <div style={{fontSize:'11px',color:'var(--text-muted2)',marginTop:'2px'}}>
                        {t.fixture.type} · {t.fixture.location}
                      </div>
                    )}
                  </td>
                  <td><span className={`badge ${STATUS_CLS[t.status]}`}>{t.status}</span></td>
                  <td><span className={`badge ${PRIORITY_CLS[t.priority]}`}>{t.priority}</span></td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                      <div className={`avatar ${avColor(t.requester_name)}`} style={{width:'24px',height:'24px',fontSize:'10px'}}>{initials(t.requester_name)}</div>
                      <span style={{fontSize:'12px'}}>{t.requester_name}</span>
                    </div>
                  </td>
                  <td style={{fontSize:'12px',color: t.assignee_name ? 'var(--text-secondary)' : 'var(--text-muted2)'}}>
                    {t.assignee_name || '—'}
                  </td>
                  <td style={{fontSize:'12px',color:'var(--text-muted2)',whiteSpace:'nowrap'}}>
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link to={`/tickets/${t.id}`} style={{color:'var(--cyan)',fontSize:'12px',textDecoration:'none',fontWeight:500}}>
                      View →
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
