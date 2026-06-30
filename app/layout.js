'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import './globals.css';
import Link from 'next/link';
import { Briefcase, User, Building2, LogOut, GraduationCap } from 'lucide-react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('internedge_user');
    const savedProfile = localStorage.getItem('internedge_profile');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  const loginUser = (userData, profileData) => {
    setUser(userData);
    setProfile(profileData);
    localStorage.setItem('internedge_user', JSON.stringify(userData));
    localStorage.setItem('internedge_profile', JSON.stringify(profileData));
  };

  const logoutUser = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('internedge_user');
    localStorage.removeItem('internedge_profile');
  };

  return (
    <html lang="en">
      <head>
        <title>InternEdge | Enterprise Placement & Recruiting Portal</title>
        <meta name="description" content="Official career portal connecting university students with verified corporate recruiters." />
      </head>
      <body>
        <AuthContext.Provider value={{ user, profile, loginUser, logoutUser }}>
          <nav className="navbar">
            <div className="container nav-container">
              <Link href="/" className="logo-brand">
                <div className="logo-icon">
                  <Briefcase size={20} />
                </div>
                <span>InternEdge</span>
              </Link>

              <ul className="nav-links">
                <li><Link href="/" className="nav-link">Home</Link></li>
                {user?.role === 'student' && (
                  <li><Link href="/dashboard/student" className="nav-link">Student Portal</Link></li>
                )}
                {user?.role === 'company' && (
                  <li><Link href="/dashboard/company" className="nav-link">Employer Portal</Link></li>
                )}

                {user ? (
                  <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {user.role === 'student' ? 'Student Account' : 'Employer Account'} ({user.email})
                    </span>
                    <button onClick={logoutUser} className="btn btn-secondary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem' }}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </li>
                ) : (
                  <li style={{ display: 'flex', gap: '0.6rem' }}>
                    <Link href="/login" className="btn btn-secondary">Sign In</Link>
                    <Link href="/register/student" className="btn btn-primary">
                      <GraduationCap size={16} /> Student Sign Up
                    </Link>
                    <Link href="/register/company" className="btn btn-outline">
                      <Building2 size={16} /> Employer Portal
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </nav>

          <main>{children}</main>

          <footer style={{ marginTop: '5rem', borderTop: '1px solid var(--border)', padding: '2.5rem 0', background: '#ffffff', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div className="logo-brand" style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                  <div className="logo-icon" style={{ width: '26px', height: '26px' }}>
                    <Briefcase size={14} />
                  </div>
                  <span>InternEdge</span>
                </div>
                <p style={{ color: 'var(--text-subtle)' }}>Verified University Recruitment Platform.</p>
              </div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <Link href="/XAMPP_DATABASE_SETUP.md" target="_blank" style={{ color: 'var(--primary)', fontWeight: 600 }}>System Setup Docs</Link>
                <span>© 2026 InternEdge Portal. All rights reserved.</span>
              </div>
            </div>
          </footer>
        </AuthContext.Provider>
      </body>
    </html>
  );
}
