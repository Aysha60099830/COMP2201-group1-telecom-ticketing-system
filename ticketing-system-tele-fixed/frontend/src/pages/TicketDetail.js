// pages/TicketDetail.js — Full ticket view with lifecycle, assign, priority, audit trail
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTicket, updateTicket, getTicketLogs, getStaff, deleteTicket } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LIFECYCLE = ['New','Assigned','In Progress','Resolved','Closed'];
const NEXT_STATUS = { New:'Assigned', Assigned:'In Progress', 'In Progress':'Resolved', Resolved:'Closed', Closed:null };
const STATUS_CLS = { New:'badge-new', Assigned:'badge-assigned', 'In Progress':'badge-progress', Resolved:'badge-resolved', Closed:'badge-closed' };
const PRIORITY_CLS = { low:'badge-low', medium:'badge-medium', high:'badge-high', critical:'badge-critical', Low:'badge-low', Medium:'badge-medium', High:'badge-high', Critical:'badge-critical' };

const AV_OPTS = ['av-blue','av-purple','av-teal','av-amber'];
const avColor = (name) => AV_OPTS[(name?.charCodeAt(0)||0) % AV_OPTS.length];
const initials = (name) => name ? name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [logs, setLogs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [assignTo, setAssignTo] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    Promise.all([getTicket(id), getTicketLogs(id)])
      .then(([tRes, lRes]) => {
        setTicket(tRes.data);
        setSelectedPriority(tRes.data.priority);
        setLogs(lRes.data);
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    if (user?.role === 'admin') getStaff().then(r => setStaff(r.data)).catch(console.error);
  }, [id]);

  const showMsg = (text, type='success') => { setMessage(text); setMsgType(type); setTimeout(() => setMessage(''), 4000); };

  const advanceStatus = async () => {
    const next = NEXT_STATUS[ticket.status];
    if (!next) return;
    try { await updateTicket(id, { status: next }); showMsg(`Ticket moved to "${next}"`); refresh(); }
    catch (err) { showMsg(err.response?.data?.error || 'Update failed', 'error'); }
  };

  const handleAssign = async () => {
    if (!assignTo) return;
    try { await updateTicket(id, { assigned_to: parseInt(assignTo), status: 'Assigned' }); showMsg('Ticket assigned successfully'); refresh(); }
    catch (err) { showMsg(err.response?.data?.error || 'Assignment failed', 'error'); }
  };

  // Staff and Admin can update priority at any time
  const handlePriorityChange = async () => {
    if (!selectedPriority || selectedPriority === ticket.priority) return;
    try {
      await updateTicket(id, { priority: selectedPriority });
      showMsg(`Priority updated to "${selectedPriority}"`);
      refresh();
    } catch (err) { showMsg(err.response?.data?.error || 'Priority update failed', 'error'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this ticket?')) return;
    await deleteTicket(id); navigate('/tickets');
  };

  if (loading) return <div className="loading-state">Loading ticket...</div>;
  if (!ticket) return <div className="loading-state" style={{color:'#ef4444'}}>Ticket not found.</div>;

  const nextStatus = NEXT_STATUS[ticket.status];
  const currentIdx = LIFECYCLE.indexOf(ticket.status);
  const canChangePriority = user?.role === 'staff' || user?.role === 'admin';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
            <Link to="/tickets" style={{color:'var(--text-muted2)',textDecoration:'none',fontSize:'13px'}}>← Tickets</Link>
            <span style={{color:'var(--border)'}}>·</span>
            <span style={{fontSize:'13px',color:'var(--text-muted2)'}}>#{ticket.id}</span>
          </div>
          <div className="page-title">{ticket.title}</div>
          <div className="page-sub">
            Submitted by <strong>{ticket.requester_name}</strong> · {new Date(ticket.created_at).toLocaleString()}
          </div>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <span className={`badge ${STATUS_CLS[ticket.status]}`} style={{fontSize:'12px',padding:'5px 12px'}}>{ticket.status}</span>
          {user?.role === 'admin' && (
            <button className="btn-danger" onClick={handleDelete}>Delete</button>
          )}
        </div>
      </div>

      {message && <div className={msgType === 'error' ? 'alert-error' : 'alert-success'}>{message}</div>}

      {/* Lifecycle progress bar */}
      <div className="panel" style={{marginBottom:'18px',padding:'16px 18px'}}>
        <div style={{fontSize:'11px',fontWeight:600,color:'var(--text-muted2)',marginBottom:'10px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Ticket Lifecycle</div>
        <div className="lifecycle-track">
          {LIFECYCLE.map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <div className="lc-arrow">›</div>}
              <div className={`lc-step${i < currentIdx ? ' done' : i === currentIdx ? ' current' : ''}`}>{s}</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="two-col" style={{gridTemplateColumns:'1fr 300px'}}>
        <div style={{display:'flex',flexDirection:'column',gap:'18px'}}>

          {/* Ticket Info */}
          <div className="panel">
            <div className="panel-header">Ticket Details</div>
            <div style={{padding:'18px'}}>
              <div style={{fontSize:'13px',color:'var(--text-secondary)',lineHeight:'1.7',marginBottom:'20px',whiteSpace:'pre-line'}}>
                {ticket.description}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',borderTop:'0.5px solid var(--border-light)',paddingTop:'16px'}}>
                <div>
                  <div style={{fontSize:'11px',color:'var(--text-muted2)',marginBottom:'4px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.4px'}}>Priority</div>
                  <span className={`badge ${PRIORITY_CLS[ticket.priority]}`}>{ticket.priority}</span>
                </div>
                <div>
                  <div style={{fontSize:'11px',color:'var(--text-muted2)',marginBottom:'4px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.4px'}}>Assigned To</div>
                  {ticket.assignee_name ? (
                    <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                      <div className={`avatar ${avColor(ticket.assignee_name)}`} style={{width:'24px',height:'24px',fontSize:'10px'}}>{initials(ticket.assignee_name)}</div>
                      <span style={{fontSize:'13px',fontWeight:500}}>{ticket.assignee_name}</span>
                    </div>
                  ) : <span style={{color:'var(--text-muted2)',fontSize:'13px'}}>Unassigned</span>}
                </div>
                {ticket.fixture && (
                  <>
                    <div>
                      <div style={{fontSize:'11px',color:'var(--text-muted2)',marginBottom:'4px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.4px'}}>Fixture Type</div>
                      <div style={{fontSize:'13px',fontWeight:500}}>{ticket.fixture.type}</div>
                    </div>
                    <div>
                      <div style={{fontSize:'11px',color:'var(--text-muted2)',marginBottom:'4px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.4px'}}>Location</div>
                      <div style={{fontSize:'13px',fontWeight:500}}>{ticket.fixture.location}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="panel">
            <div className="panel-header">
              Audit Trail
              <span className="panel-sub">all changes logged</span>
            </div>
            {logs.length === 0 ? (
              <div style={{padding:'20px 18px',fontSize:'13px',color:'var(--text-muted2)'}}>No activity logged yet.</div>
            ) : (
              <div>
                {logs.map((log, i) => (
                  <div key={log.id} style={{display:'flex',gap:'12px',padding:'12px 18px',borderBottom: i < logs.length-1 ? '0.5px solid #f0f4f8' : 'none'}}>
                    <div className={`avatar ${avColor(log.user_name)}`}>{initials(log.user_name)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'13px',color:'var(--text-secondary)'}}>
                        <strong>{log.user_name}</strong> — {log.action}
                      </div>
                      <div style={{fontSize:'11px',color:'var(--text-muted2)',marginTop:'3px'}}>
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right actions panel */}
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>

          {/* Advance lifecycle */}
          {user?.role !== 'requester' && nextStatus && (
            <div className="panel">
              <div className="panel-header">Advance Status</div>
              <div style={{padding:'16px'}}>
                <div style={{fontSize:'12px',color:'var(--text-muted2)',marginBottom:'12px'}}>
                  Current: <strong style={{color:'var(--text-secondary)'}}>{ticket.status}</strong><br/>
                  Next: <strong style={{color:'var(--text-secondary)'}}>{nextStatus}</strong>
                </div>
                <button className="btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={advanceStatus}>
                  Move to "{nextStatus}"
                </button>
              </div>
            </div>
          )}

          {/* Change Priority — Staff and Admin only */}
          {canChangePriority && (
            <div className="panel">
              <div className="panel-header">Set Priority</div>
              <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
                <select
                  value={selectedPriority}
                  onChange={e => setSelectedPriority(e.target.value)}
                  className="form-select"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                <button
                  className="btn-primary"
                  style={{width:'100%',justifyContent:'center'}}
                  onClick={handlePriorityChange}
                  disabled={selectedPriority === ticket.priority}
                >
                  Update Priority
                </button>
                {selectedPriority === ticket.priority && (
                  <div style={{fontSize:'11px',color:'var(--text-muted2)',textAlign:'center'}}>
                    Current priority is already {ticket.priority}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assign ticket — Admin only */}
          {user?.role === 'admin' && ticket.status === 'New' && staff.length > 0 && (
            <div className="panel">
              <div className="panel-header">Assign Ticket</div>
              <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
                <select value={assignTo} onChange={e => setAssignTo(e.target.value)} className="form-select">
                  <option value="">Select staff member</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button className="btn-green" style={{width:'100%'}} onClick={handleAssign} disabled={!assignTo}>
                  Assign
                </button>
              </div>
            </div>
          )}

          {/* Ticket meta */}
          <div className="panel">
            <div className="panel-header">Ticket Info</div>
            <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
              {[
                ['ID', `#${ticket.id}`],
                ['Created', new Date(ticket.created_at).toLocaleDateString()],
                ['Updated', new Date(ticket.updated_at || ticket.created_at).toLocaleDateString()],
              ].map(([label, val]) => (
                <div key={label} style={{display:'flex',justifyContent:'space-between',fontSize:'12px'}}>
                  <span style={{color:'var(--text-muted2)'}}>{label}</span>
                  <span style={{fontWeight:500,color:'var(--text-secondary)'}}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
