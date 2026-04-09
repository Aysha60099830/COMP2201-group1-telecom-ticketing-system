// pages/Login.js — Telecom-themed login screen
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'requester' ? '/tickets' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:'#0a1628',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{color:'#00c8ff',fontSize:'28px',fontWeight:'700',letterSpacing:'0.5px'}}>▲ TeleCo Portal</div>
          <div style={{color:'#4a7fa5',fontSize:'13px',marginTop:'6px'}}>Network Operations — COMP2201 Grp_1</div>
        </div>

        <div style={{background:'#0d2140',borderRadius:'14px',border:'1px solid #1e3a5f',padding:'32px'}}>
          <h2 style={{color:'#e2eaf3',fontSize:'17px',fontWeight:'600',marginBottom:'6px',marginTop:0}}>Sign in to your account</h2>
          <p style={{color:'#4a7fa5',fontSize:'12px',marginBottom:'24px',marginTop:0}}>Enter your credentials to access the ticketing system</p>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:'16px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#7ba3c0',marginBottom:'6px'}}>Email address</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                placeholder="you@telecom.qa"
                style={{width:'100%',background:'#0a1628',border:'0.5px solid #1e3a5f',borderRadius:'7px',padding:'10px 12px',fontSize:'13px',color:'#e2eaf3',outline:'none',boxSizing:'border-box'}}
                onFocus={e => e.target.style.borderColor='#00c8ff'}
                onBlur={e => e.target.style.borderColor='#1e3a5f'}
              />
            </div>
            <div style={{marginBottom:'24px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#7ba3c0',marginBottom:'6px'}}>Password</label>
              <input name="password" type="password" required value={form.password} onChange={handleChange}
                placeholder="••••••••"
                style={{width:'100%',background:'#0a1628',border:'0.5px solid #1e3a5f',borderRadius:'7px',padding:'10px 12px',fontSize:'13px',color:'#e2eaf3',outline:'none',boxSizing:'border-box'}}
                onFocus={e => e.target.style.borderColor='#00c8ff'}
                onBlur={e => e.target.style.borderColor='#1e3a5f'}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'11px'}}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{marginTop:'20px',textAlign:'center',fontSize:'12px',color:'#4a7fa5'}}>
            No account? <Link to="/register" style={{color:'#00c8ff',textDecoration:'none'}}>Register here</Link>
          </p>

          <div style={{marginTop:'20px',padding:'12px',background:'#0a1628',borderRadius:'7px',border:'0.5px solid #1e3a5f'}}>
            <p style={{fontSize:'11px',color:'#4a7fa5',margin:0,fontWeight:'600',marginBottom:'4px'}}>Demo Credentials</p>
            <p style={{fontSize:'11px',color:'#7ba3c0',margin:0}}>admin@telecom.qa / Admin@1234</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
