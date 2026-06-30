'use client';

import React, { useState } from 'react';
import { useAuth } from '../layout';
import { useRouter } from 'next/navigation';
import { GraduationCap, Building2, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const router = useRouter();
  
  const [role, setRole] = useState('student'); // 'student' or 'company'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', role, email, password })
      });
      const data = await res.json();

      if (data.success) {
        loginUser(data.user, data.profile);
        if (data.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (data.user.role === 'student') {
          router.push('/dashboard/student');
        } else {
          router.push('/dashboard/company');
        }
      } else {
        setError(data.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div className="card-panel" style={{ maxWidth: '440px', width: '100%', padding: '2.2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Access your InternEdge Account</p>
        </div>

        {/* Role Switcher Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.6rem', border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => handleRoleSwitch('student')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: 'calc(var(--radius-md) - 2px)',
              border: 'none',
              background: role === 'student' ? '#ffffff' : 'transparent',
              color: role === 'student' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.88rem',
              boxShadow: role === 'student' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <GraduationCap size={16} /> Student
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('company')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: 'calc(var(--radius-md) - 2px)',
              border: 'none',
              background: role === 'company' ? '#ffffff' : 'transparent',
              color: role === 'company' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.88rem',
              boxShadow: role === 'company' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Building2 size={16} /> Employer
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter registered email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.8rem', padding: '0.75rem' }}
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.6rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          {role === 'student' ? (
            <Link href="/register/student" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register Student Account</Link>
          ) : (
            <Link href="/register/company" style={{ color: 'var(--text-main)', fontWeight: 600 }}>Register Employer Account</Link>
          )}
        </div>
      </div>
    </div>
  );
}
