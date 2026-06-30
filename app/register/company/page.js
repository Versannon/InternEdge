'use client';

import React, { useState } from 'react';
import { useAuth } from '../../layout';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Phone, Lock, Globe, UserCheck, ArrowRight, AlertCircle, KeyRound, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';

export default function CompanyRegistrationPage() {
  const { loginUser } = useAuth();
  const router = useRouter();

  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Software & Cloud Services');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [hrName, setHrName] = useState('');
  const [password, setPassword] = useState('');
  const [companySize, setCompanySize] = useState('10-50');
  const [foundedYear, setFoundedYear] = useState('2020');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [description, setDescription] = useState('');
  
  // OTP State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [inputOtp, setInputOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please provide a valid official email address first.');
      return;
    }
    setError('');
    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email })
      });
      const data = await res.json();
      if (data.success) {
        setShowOtpModal(true);
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Connection error while sending OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!inputOtp || inputOtp.length < 4) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email, otp: inputOtp })
      });
      const data = await res.json();
      if (data.success) {
        setIsEmailVerified(true);
        setShowOtpModal(false);
        setInputOtp('');
      } else {
        setOtpError(data.message || 'Verification failed.');
      }
    } catch (err) {
      setOtpError('Error verifying OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailVerified) {
      setError('Please verify your work email address via OTP before registering.');
      handleSendOtp();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_company',
          companyName,
          industry,
          email,
          phone,
          website,
          hrName,
          password,
          companySize,
          foundedYear,
          country,
          state,
          city,
          fullAddress,
          pinCode,
          description
        })
      });
      const data = await res.json();

      if (data.success) {
        loginUser(data.user, data.profile);
        router.push('/dashboard/company');
      } else {
        setError(data.message || 'Employer registration failed.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '620px' }}>
      <div className="card-panel" style={{ padding: '2.2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{ width: '48px', height: '48px', background: '#f8fafc', border: '1px solid var(--border-strong)', color: 'var(--text-main)', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}>
            <Building2 size={24} />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Employer Registration</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Corporate recruitment portal for hiring verified university candidates</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', color: '#b91c1c', fontSize: '0.88rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Company / Organization Name</label>
              <input 
                type="text" 
                required 
                className="form-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corporation"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Industry Domain</label>
              <select 
                className="form-select"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="Software & Cloud Services">Software & Cloud Services</option>
                <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                <option value="Finance & Fintech">Finance & Fintech</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                <option value="Healthcare Tech">Healthcare Tech</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Official Work Email</label>
                {isEmailVerified ? (
                  <span className="badge badge-green">✓ Verified Work Email</span>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600 }}>⚠️ OTP Required</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <input 
                  type="email" 
                  required 
                  className="form-input"
                  style={{ flex: 1 }}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setIsEmailVerified(false); }}
                  placeholder="recruiter@company.com"
                />
                {!isEmailVerified ? (
                  <button type="button" onClick={handleSendOtp} disabled={otpLoading} className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
                    <KeyRound size={14} /> {otpLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                ) : (
                  <button type="button" disabled className="btn btn-success" style={{ whiteSpace: 'nowrap', opacity: 0.9 }}>
                    Verified ✓
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input 
                type="text" 
                required 
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Website URL</label>
              <input 
                type="url" 
                className="form-input"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">HR / Recruiter Name & Title</label>
              <input 
                type="text" 
                required 
                className="form-input"
                value={hrName}
                onChange={(e) => setHrName(e.target.value)}
                placeholder="e.g. Jane Smith (Talent Lead)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Size</label>
              <select 
                className="form-select"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
              >
                <option value="1-10">1-10 Employees</option>
                <option value="10-50">10-50 Employees</option>
                <option value="50-200">50-200 Employees</option>
                <option value="200+">200+ Employees</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Founded Year</label>
              <input 
                type="number" 
                required 
                className="form-input"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                placeholder="e.g. 2015"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input 
                type="text" 
                required 
                className="form-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. India"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input 
                type="text" 
                required 
                className="form-input"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Karnataka"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input 
                type="text" 
                required 
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pin Code / Postal Code</label>
              <input 
                type="text" 
                className="form-input"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="e.g. 560034"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Full Office Address</label>
              <input 
                type="text" 
                required 
                className="form-input"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="e.g. 4th Block, Koramangala, Bengaluru"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Company Description</label>
              <textarea 
                rows={3} 
                required 
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your organization and hiring domains..."
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Create Password</label>
              <input 
                type="password" 
                required 
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.2rem', padding: '0.8rem' }}
          >
            {loading ? 'Registering...' : 'Register Employer Account'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.4rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already registered? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>

      {/* EMAIL OTP VERIFICATION MODAL BOX */}
      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem' }}>Employer Email Verification</h3>
              <button onClick={() => setShowOtpModal(false)} className="close-btn"><X size={18} /></button>
            </div>

            <div style={{ marginBottom: '1.3rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.8rem' }}>
                Enter the 6-digit verification code sent to <strong>{email}</strong>
              </p>


              {otpError && (
                <div style={{ padding: '0.5rem', background: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '0.8rem' }}>
                  ⚠️ {otpError}
                </div>
              )}

              <input 
                type="text" 
                maxLength={6}
                className="form-input" 
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '6px', fontWeight: 700, padding: '0.6rem' }}
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                placeholder="******"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
              <button type="button" onClick={handleSendOtp} disabled={otpLoading} className="btn btn-secondary">
                <RefreshCw size={14} /> Resend
              </button>
              <button type="button" onClick={handleVerifyOtp} disabled={otpLoading} className="btn btn-primary">
                Verify & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
