// pages/Register.js — Styled registration page
// All accounts created via self-registration are locked to 'requester'.
// Only an Admin can elevate a role via the Users Admin panel.
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const passwordTooShort = form.password.length > 0 && form.password.length < 8;
  const passwordOk = form.password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError(''); setLoading(true);
    try {
      // Role is NOT sent — backend always assigns 'requester' on registration
      await register({ name: form.name, email: form.email, password: form.password });
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
          <h2 style={{color:'#e2eaf3',fontSize:'17px',fontWeight:'600',marginBottom:'8px',marginTop:0}}>New Account</h2>
          <p style={{color:'#4a7fa5',fontSize:'12px',marginBottom:'24px',marginTop:0}}>
            New accounts are created as <strong style={{color:'#7ba3c0'}}>Requester</strong> by default.
            Contact your administrator if you need Staff access.
          </p>
          {error && <div className="alert-error">{error}</div>}
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>

            {/* Name */}
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#7ba3c0',marginBottom:'6px'}}>Full Name</label>
              <input name="name" type="text" required value={form.name} onChange={handleChange}
                placeholder="e.g. Abdulla Ahmed" style={inputStyle}
                onFocus={e => e.target.style.borderColor='#00c8ff'}
                onBlur={e => e.target.style.borderColor='#1e3a5f'}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#7ba3c0',marginBottom:'6px'}}>Email Address</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                placeholder="you@telecom.qa" style={inputStyle}
                onFocus={e => e.target.style.borderColor='#00c8ff'}
                onBlur={e => e.target.style.borderColor='#1e3a5f'}
              />
            </div>

            {/* Password with live validation */}
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#7ba3c0',marginBottom:'6px'}}>
                Password
              </label>
              <input
                name="password" type="password" required
                value={form.password} onChange={handleChange}
                placeholder="Minimum 8 characters"
                minLength={8}
                style={{
                  ...inputStyle,
                  borderColor: passwordTooShort ? '#ef4444' : passwordOk ? '#22c55e' : '#1e3a5f'
                }}
                onFocus={e => e.target.style.borderColor = passwordTooShort ? '#ef4444' : passwordOk ? '#22c55e' : '#00c8ff'}
                onBlur={e => e.target.style.borderColor = passwordTooShort ? '#ef4444' : passwordOk ? '#22c55e' : '#1e3a5f'}
              />
              {/* Live character count feedback */}
              {form.password.length > 0 && (
                <div style={{
                  fontSize:'11px', marginTop:'5px',
                  color: passwordOk ? '#22c55e' : '#ef4444'
                }}>
                  {passwordOk
                    ? `✓ Password meets the 8-character requirement`
                    : `✗ ${8 - form.password.length} more character${8 - form.password.length === 1 ? '' : 's'} needed`
                  }
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || passwordTooShort}
              className="btn-primary"
              style={{justifyContent:'center',padding:'11px',marginTop:'8px',opacity: passwordTooShort ? 0.5 : 1}}
            >
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
