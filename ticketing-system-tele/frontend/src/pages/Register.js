// pages/Register.js — Styled registration page
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'requester' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width:'100%', background:'#0a1628', border:'0.5px solid #1e3a5f',
    borderRadius:'7px', padding:'10px 12px', fontSize:'13px', color:'#e2eaf3',
    outline:'none', boxSizing:'border-box'
  };

  return (
    <div style={{minHeight:'100vh',background:'#0a1628',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{color:'#00c8ff',fontSize:'28px',fontWeight:'700'}}>▲ TeleCo Portal</div>
          <div style={{color:'#4a7fa5',fontSize:'13px',marginTop:'6px'}}>Create your account</div>
        </div>
        <div style={{background:'#0d2140',borderRadius:'14px',border:'1px solid #1e3a5f',padding:'32px'}}>
          <h2 style={{color:'#e2eaf3',fontSize:'17px',fontWeight:'600',marginBottom:'24px',marginTop:0}}>New Account</h2>
          {error && <div className="alert-error">{error}</div>}
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            {[
              {name:'name', label:'Full Name', type:'text', placeholder:'e.g. Abdulla Ahmed'},
              {name:'email', label:'Email Address', type:'email', placeholder:'you@telecom.qa'},
              {name:'password', label:'Password', type:'password', placeholder:'Min 8 characters'},
            ].map(f => (
              <div key={f.name}>
                <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#7ba3c0',marginBottom:'6px'}}>{f.label}</label>
                <input name={f.name} type={f.type} required value={form[f.name]} onChange={handleChange}
                  placeholder={f.placeholder} style={inputStyle}
                  onFocus={e => e.target.style.borderColor='#00c8ff'}
                  onBlur={e => e.target.style.borderColor='#1e3a5f'}
                />
              </div>
            ))}
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#7ba3c0',marginBottom:'6px'}}>Role</label>
              <select name="role" value={form.role} onChange={handleChange}
                style={{...inputStyle, background:'#0a1628'}}>
                <option value="requester">Requester</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{justifyContent:'center',padding:'11px',marginTop:'8px'}}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p style={{marginTop:'20px',textAlign:'center',fontSize:'12px',color:'#4a7fa5'}}>
            Already have an account? <Link to="/login" style={{color:'#00c8ff',textDecoration:'none'}}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
