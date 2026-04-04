// pages/Dashboard.js — Telecom operations dashboard
import React, { useEffect, useState } from 'react';
import { getDashboardMetrics } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const STATUS_ORDER = ['New','Assigned','In Progress','Resolved','Closed'];
const STATUS_CLS = { New:'badge-new', Assigned:'badge-assigned', 'In Progress':'badge-progress', Resolved:'badge-resolved', Closed:'badge-closed' };
const PRIORITY_CLS = { low:'badge-low', medium:'badge-medium', high:'badge-high', critical:'badge-critical', Low:'badge-low', Medium:'badge-medium', High:'badge-high', Critical:'badge-critical' };

const AV_OPTS = ['av-blue','av-purple','av-teal','av-amber'];
const avColor = (name) => AV_OPTS[(name?.charCodeAt(0)||0) % AV_OPTS.length];
const initials = (name) => name ? name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardMetrics().then(r => setMetrics(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;
  if (!metrics) return <div className="loading-state" style={{color:'#ef4444'}}>Failed to load metrics.</div>;

  const open = metrics.open_tickets || 0;
  const total = metrics.total_tickets || 0;
  const avgH = metrics.avg_resolution_hours || 0;
  const closed = metrics.status_counts?.['Closed'] || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Operations Dashboard</div>
          <div className="page-sub">Welcome back, {user?.name} · {new Date().toLocaleDateString('en-QA',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        <Link to="/tickets/new" className="btn-primary">+ New Ticket</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Tickets</div>
          <div className="stat-val">{total}</div>
          <div className="stat-change change-neutral">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Open Tickets</div>
          <div className="stat-val" style={{color: open > 0 ? '#ef4444' : '#10b981'}}>{open}</div>
          <div className="stat-change change-down">{open > 0 ? 'Needs attention' : 'All clear'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Resolution</div>
          <div className="stat-val">{Number(avgH).toFixed(1)}<span style={{fontSize:'14px',fontWeight:400,color:'var(--text-muted2)'}}>h</span></div>
          <div className="stat-change change-neutral">Mean time to resolve</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Resolved / Closed</div>
          <div className="stat-val" style={{color:'#10b981'}}>{closed}</div>
          <div className="stat-change change-up">Tickets completed</div>
        </div>
      </div>

      <div className="two-col">
        <div style={{display:'flex',flexDirection:'column',gap:'18px'}}>

          {/* Ticket Lifecycle */}
          <div className="panel">
            <div className="panel-header">
              Ticket Lifecycle Status
              <span className="panel-sub">New → Assigned → In Progress → Resolved → Closed</span>
            </div>
            <div style={{padding:'18px',display:'flex',gap:'10px',flexWrap:'wrap'}}>
              {STATUS_ORDER.map(s => (
                <div key={s} style={{textAlign:'center'}}>
                  <div style={{fontSize:'24px',fontWeight:'600',color:'var(--text-primary)'}}>{metrics.status_counts?.[s] || 0}</div>
                  <span className={`badge ${STATUS_CLS[s]}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="panel">
            <div className="panel-header">Priority Distribution</div>
            <div style={{padding:'18px',display:'flex',gap:'10px',flexWrap:'wrap'}}>
              {Object.entries(metrics.priority_counts || {}).map(([p, c]) => (
                <div key={p} style={{textAlign:'center'}}>
                  <div style={{fontSize:'24px',fontWeight:'600',color:'var(--text-primary)'}}>{c}</div>
                  <span className={`badge ${PRIORITY_CLS[p]}`}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tickets */}
          {metrics.recent_tickets?.length > 0 && (
            <div className="panel">
              <div className="panel-header">
                Recent Tickets
                <Link to="/tickets" style={{fontSize:'12px',color:'var(--cyan)',textDecoration:'none'}}>View all →</Link>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th><th>Issue</th><th>Status</th><th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recent_tickets.slice(0,6).map(t => (
                    <tr key={t.id}>
                      <td style={{color:'var(--text-muted2)',fontWeight:500}}>#{t.id}</td>
                      <td>
                        <Link to={`/tickets/${t.id}`} style={{color:'var(--text-secondary)',textDecoration:'none',fontWeight:500}}>{t.title}</Link>
                        {t.fixture && <div style={{fontSize:'11px',color:'var(--text-muted2)',marginTop:'2px'}}>{t.fixture.type} · {t.fixture.location}</div>}
                      </td>
                      <td><span className={`badge ${STATUS_CLS[t.status]}`}>{t.status}</span></td>
                      <td><span className={`badge ${PRIORITY_CLS[t.priority]}`}>{t.priority}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{display:'flex',flexDirection:'column',gap:'18px'}}>

          {/* Staff Workload */}
          {metrics.staff_workload?.length > 0 && (
            <div className="panel">
              <div className="panel-header">Staff Workload</div>
              <div style={{padding:'0'}}>
                {metrics.staff_workload.map((s,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 16px',borderBottom:'0.5px solid #f0f4f8'}}>
                    <div className={`avatar ${avColor(s.name)}`}>{initials(s.name)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'13px',fontWeight:500,color:'var(--text-secondary)'}}>{s.name}</div>
                      <div style={{fontSize:'11px',color:'var(--text-muted2)'}}>{s.active_tickets} active ticket{s.active_tickets !== 1 ? 's' : ''}</div>
                    </div>
                    <div style={{fontSize:'18px',fontWeight:'600',color: s.active_tickets > 3 ? '#ef4444' : 'var(--text-primary)'}}>{s.active_tickets}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fixtures with open tickets */}
          {metrics.fixtures_with_open?.length > 0 && (
            <div className="panel">
              <div className="panel-header">Active Fixtures</div>
              {metrics.fixtures_with_open.map((f,i) => {
                const bars = Math.min(f.open_count, 4);
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'0.5px solid #f0f4f8'}}>
                    <div>
                      <div style={{fontSize:'13px',fontWeight:500,color:'var(--text-secondary)'}}>{f.type}</div>
                      <div style={{fontSize:'11px',color:'var(--text-muted2)'}}>{f.location} · {f.open_count} open</div>
                    </div>
                    <div className="signal-bars">
                      {[6,9,12,15].map((h,bi) => (
                        <div key={bi} className={`s-bar${bi < bars ? ' on' : ''}`} style={{height:`${h}px`}}></div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className="panel">
            <div className="panel-header">Quick Actions</div>
            <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
              <Link to="/tickets/new" className="btn-primary" style={{justifyContent:'center'}}>+ Submit New Ticket</Link>
              <Link to="/tickets" className="btn-secondary" style={{justifyContent:'center'}}>View All Tickets</Link>
              {user?.role === 'admin' && <Link to="/logs" className="btn-secondary" style={{justifyContent:'center'}}>View Audit Trail</Link>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
