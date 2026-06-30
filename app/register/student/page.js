'use client';

import React, { useState } from 'react';
import { useAuth } from '../../layout';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Lock, Upload, FileText, CheckCircle, 
  ShieldCheck, HelpCircle, X, ExternalLink, ArrowRight, ArrowLeft, KeyRound, AlertCircle, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

const AVAILABLE_SKILLS = [
  'React', 'Next.js', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'Java', 
  'C++', 'SQL', 'MongoDB', 'PostgreSQL', 'Data Science', 'Machine Learning', 
  'UI/UX Design', 'Figma', 'Docker', 'AWS', 'Git', 'Flutter'
];

export default function StudentRegistrationPage() {
  const { loginUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);

  // Form Fields
  const [personal, setPersonal] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    gender: 'Male',
    dob: ''
  });

  // OTP Verification State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [inputOtp, setInputOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');

  // Academic
  const [academic, setAcademic] = useState({
    college: '',
    course: 'B.Tech',
    semYear: 'Semester 6 (Year 3)',
    branch: 'Computer Science & Engineering',
    gradYear: '2026',
    cgpa: ''
  });

  // Skills & Profiles
  const [skills, setSkills] = useState({
    selectedSkills: [],
    customSkill: '',
    experience: 'Fresher',
    portfolio: '',
    linkedin: '',
    github: ''
  });

  // Security
  const [security, setSecurity] = useState({
    password: '',
    confirmPassword: ''
  });

  // Documents
  const [documents, setDocuments] = useState({
    profilePicName: '',
    resumeName: ''
  });

  // Terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Submission State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!personal.email || !personal.email.includes('@')) {
      setError('Please provide a valid email address first.');
      return;
    }
    setError('');
    setOtpLoading(true);
    setOtpMessage('');
    setOtpError('');

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email: personal.email })
      });
      const data = await res.json();
      if (data.success) {
        setDemoOtp(data.demoOtp);
        setOtpMessage(`Code sent! (Demo OTP Code: ${data.demoOtp})`);
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
    setOtpMessage('');

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email: personal.email, otp: inputOtp })
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

  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', color: '#64748b' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1: return { score: 25, label: 'Weak', color: '#dc2626' };
      case 2: return { score: 50, label: 'Fair', color: '#b45309' };
      case 3: return { score: 75, label: 'Good', color: '#2563eb' };
      case 4: return { score: 100, label: 'Strong & Secure', color: '#059669' };
      default: return { score: 10, label: 'Very Weak', color: '#dc2626' };
    }
  };

  const strength = calculatePasswordStrength(security.password);

  const toggleSkill = (skillName) => {
    if (skills.selectedSkills.includes(skillName)) {
      setSkills({ ...skills, selectedSkills: skills.selectedSkills.filter(s => s !== skillName) });
    } else {
      setSkills({ ...skills, selectedSkills: [...skills.selectedSkills, skillName] });
    }
  };

  const handleAddCustomSkill = (e) => {
    if (e.key === 'Enter' && skills.customSkill.trim()) {
      e.preventDefault();
      const newS = skills.customSkill.trim();
      if (!skills.selectedSkills.includes(newS)) {
        setSkills({ ...skills, selectedSkills: [...skills.selectedSkills, newS], customSkill: '' });
      }
    }
  };

  const handleFileUpload = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'pic') {
        setDocuments({ ...documents, profilePicName: file.name });
      } else {
        setDocuments({ ...documents, resumeName: file.name });
      }
    }
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!personal.name || !personal.email || !personal.phone) {
        setError('Please complete all personal details.');
        return;
      }
      if (!isEmailVerified) {
        setError('Please verify your email address via OTP before proceeding.');
        handleSendOtp();
        return;
      }
    }
    if (step === 2 && (!academic.college || !academic.cgpa)) {
      setError('Please complete academic information.');
      return;
    }
    if (step === 3 && skills.selectedSkills.length === 0) {
      setError('Please select at least one skill bubble.');
      return;
    }
    if (step === 4) {
      if (!security.password || security.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (security.password !== security.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    setStep(s => Math.min(s + 1, 6));
  };

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to complete registration.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_student',
          personal,
          academic,
          skills,
          security,
          documents
        })
      });
      const data = await res.json();

      if (data.success) {
        loginUser(data.user, data.profile);
        router.push('/dashboard/student');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Registration error. Please check backend network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Student Account Registration</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Complete your verified candidate placement profile</p>
      </div>

      {/* Wizard Progress Stepper */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.2rem', position: 'relative' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>
            <div 
              onClick={() => i < step && setStep(i)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: step >= i ? 'var(--primary)' : '#e2e8f0',
                color: step >= i ? 'white' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: step === i ? '2px solid var(--primary-hover)' : '1px solid #cbd5e1',
                cursor: i < step ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
              }}
            >
              {step > i ? <CheckCircle size={18} /> : i}
            </div>
            <span style={{ fontSize: '0.75rem', marginTop: '0.4rem', color: step >= i ? 'var(--text-main)' : 'var(--text-subtle)', fontWeight: step === i ? 700 : 500 }}>
              {['Personal', 'Academic', 'Skills', 'Security', 'Documents', 'Terms'][i-1]}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', color: '#b91c1c', fontSize: '0.88rem', marginBottom: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Form Card Container */}
      <div className="card-panel" style={{ padding: '2.2rem' }}>
        
        {/* STEP 1: PERSONAL INFO */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.2rem', color: 'var(--primary)' }}>1. Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={personal.name}
                  onChange={(e) => setPersonal({...personal, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Email Address</label>
                  {isEmailVerified ? (
                    <span className="badge badge-green">✓ Verified via OTP</span>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600 }}>⚠️ OTP Required</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <input 
                    type="email" 
                    className="form-input" 
                    style={{ flex: 1 }}
                    value={personal.email}
                    onChange={(e) => { setPersonal({...personal, email: e.target.value}); setIsEmailVerified(false); }}
                    placeholder="student@university.edu"
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
                <label className="form-label">Gender</label>
                <select 
                  className="form-select"
                  value={personal.gender}
                  onChange={(e) => setPersonal({...personal, gender: e.target.value})}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input 
                  type="date"
                  required
                  className="form-input"
                  value={personal.dob}
                  onChange={(e) => setPersonal({...personal, dob: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <select 
                    className="form-select" 
                    style={{ width: '100px' }}
                    value={personal.countryCode}
                    onChange={(e) => setPersonal({...personal, countryCode: e.target.value})}
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                  </select>
                  <input 
                    type="tel" 
                    className="form-input" 
                    style={{ flex: 1 }}
                    value={personal.phone}
                    onChange={(e) => setPersonal({...personal, phone: e.target.value})}
                    placeholder="Phone number"
                  />
                </div>
              </div>
            </div>
          </div>
        ) }

        {/* STEP 2: ACADEMIC INFO */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.2rem', color: 'var(--primary)' }}>2. Academic Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">College / University Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={academic.college}
                  onChange={(e) => setAcademic({...academic, college: e.target.value})}
                  placeholder="Enter university name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Degree Course</label>
                <select 
                  className="form-select"
                  value={academic.course}
                  onChange={(e) => setAcademic({...academic, course: e.target.value})}
                >
                  <option value="B.Tech">B.Tech / B.E.</option>
                  <option value="B.Sc">B.Sc Computer Science / IT</option>
                  <option value="BCA">BCA</option>
                  <option value="M.Tech">M.Tech / M.E.</option>
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA / PGDM</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Semester / Current Year</label>
                <select 
                  className="form-select"
                  value={academic.semYear}
                  onChange={(e) => setAcademic({...academic, semYear: e.target.value})}
                >
                  <option value="Semester 1 (Year 1)">Semester 1 (Year 1)</option>
                  <option value="Semester 2 (Year 1)">Semester 2 (Year 1)</option>
                  <option value="Semester 3 (Year 2)">Semester 3 (Year 2)</option>
                  <option value="Semester 4 (Year 2)">Semester 4 (Year 2)</option>
                  <option value="Semester 5 (Year 3)">Semester 5 (Year 3)</option>
                  <option value="Semester 6 (Year 3)">Semester 6 (Year 3)</option>
                  <option value="Semester 7 (Year 4)">Semester 7 (Year 4)</option>
                  <option value="Semester 8 (Year 4)">Semester 8 (Year 4)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Branch Specialization</label>
                <select 
                  className="form-select"
                  value={academic.branch}
                  onChange={(e) => setAcademic({...academic, branch: e.target.value})}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engg</option>
                  <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <select 
                  className="form-select"
                  value={academic.gradYear}
                  onChange={(e) => setAcademic({...academic, gradYear: e.target.value})}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">CGPA / GPA Score (Out of 10.0)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="10"
                  className="form-input" 
                  value={academic.cgpa}
                  onChange={(e) => setAcademic({...academic, cgpa: e.target.value})}
                  placeholder="e.g. 8.50"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SKILLS & PROFILES */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.2rem', color: 'var(--primary)' }}>3. Skills & Profiles</h3>
            
            <div className="form-group" style={{ marginBottom: '1.3rem' }}>
              <label className="form-label">Technical Skills (Select applicable skills)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '0.6rem 0' }}>
                {AVAILABLE_SKILLS.map((s) => {
                  const isSel = skills.selectedSkills.includes(s);
                  return (
                    <span
                      key={s}
                      onClick={() => toggleSkill(s)}
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: isSel ? 'var(--primary)' : '#f1f5f9',
                        color: isSel ? 'white' : 'var(--text-muted)',
                        border: isSel ? '1px solid var(--primary)' : '1px solid #e2e8f0',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSel ? '✓ ' : '+ '}{s}
                    </span>
                  );
                })}

                {/* Render Custom Added Skills */}
                {skills.selectedSkills
                  .filter(s => !AVAILABLE_SKILLS.includes(s))
                  .map((s) => (
                    <span
                      key={s}
                      onClick={() => toggleSkill(s)}
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: 'var(--primary)',
                        color: 'white',
                        border: '1px solid var(--primary)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      ✓ {s}
                    </span>
                  ))
                }
              </div>

              <input 
                type="text" 
                className="form-input"
                placeholder="Type custom skill and press Enter..."
                value={skills.customSkill}
                onChange={(e) => setSkills({...skills, customSkill: e.target.value})}
                onKeyDown={handleAddCustomSkill}
                style={{ marginTop: '0.4rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.3rem' }}>
              <label className="form-label">Overall Experience Level</label>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                {['Fresher', 'Intermediate', 'Expert'].map((exp) => (
                  <label key={exp} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: skills.experience === exp ? 'var(--primary-light)' : '#f8fafc', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', border: skills.experience === exp ? '1px solid var(--primary)' : '1px solid var(--border-strong)', flex: 1 }}>
                    <input 
                      type="radio" 
                      name="experience"
                      checked={skills.experience === exp}
                      onChange={() => setSkills({...skills, experience: exp})}
                    />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{exp}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.9rem' }}>
              <div className="form-group">
                <label className="form-label">Portfolio URL (Optional)</label>
                <input 
                  type="url" 
                  className="form-input"
                  value={skills.portfolio}
                  onChange={(e) => setSkills({...skills, portfolio: e.target.value})}
                  placeholder="https://portfolio.dev"
                />
              </div>

              <div className="form-group">
                <label className="form-label">LinkedIn (Optional)</label>
                <input 
                  type="url" 
                  className="form-input"
                  value={skills.linkedin}
                  onChange={(e) => setSkills({...skills, linkedin: e.target.value})}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub (Optional)</label>
                <input 
                  type="url" 
                  className="form-input"
                  value={skills.github}
                  onChange={(e) => setSkills({...skills, github: e.target.value})}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SECURITY & PASSWORD */}
        {step === 4 && (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.2rem', color: 'var(--primary)' }}>4. Account Security</h3>
            
            <div className="form-group">
              <label className="form-label">Create Password</label>
              <input 
                type="password" 
                className="form-input"
                value={security.password}
                onChange={(e) => setSecurity({...security, password: e.target.value})}
                placeholder="At least 6 characters"
              />
            </div>

            {/* Password Strength Indicator */}
            <div style={{ marginBottom: '1.3rem', background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Security Indicator:</span>
                <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${strength.score}%`, height: '100%', background: strength.color, transition: 'all 0.2s ease' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" 
                className="form-input"
                value={security.confirmPassword}
                onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                placeholder="Re-enter password"
              />
            </div>
          </div>
        )}

        {/* STEP 5: DOCUMENTS UPLOAD */}
        {step === 5 && (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.2rem', color: 'var(--primary)' }}>5. Profile Documents</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              {/* Profile Picture Uploader */}
              <div style={{ border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '1.8rem 1rem', textAlign: 'center', background: '#f8fafc' }}>
                <Upload size={32} color="var(--primary)" style={{ marginBottom: '0.6rem' }} />
                <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>Profile Picture</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '0.8rem' }}>JPG or PNG format</p>
                <input 
                  type="file" 
                  accept="image/*"
                  id="profile-pic-input" 
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload('pic', e)}
                />
                <label htmlFor="profile-pic-input" className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>
                  Upload Photo
                </label>
                {documents.profilePicName && (
                  <div className="badge badge-green" style={{ marginTop: '0.8rem', display: 'inline-block' }}>
                    ✓ {documents.profilePicName}
                  </div>
                )}
              </div>

              {/* Resume Uploader */}
              <div style={{ border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '1.8rem 1rem', textAlign: 'center', background: '#f8fafc' }}>
                <FileText size={32} color="var(--text-main)" style={{ marginBottom: '0.6rem' }} />
                <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>Latest Resume (PDF)</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '0.8rem' }}>PDF or DOCX format</p>
                <input 
                  type="file" 
                  accept=".pdf,.docx"
                  id="resume-input" 
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload('resume', e)}
                />
                <label htmlFor="resume-input" className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>
                  Upload Resume
                </label>
                {documents.resumeName && (
                  <div className="badge badge-blue" style={{ marginTop: '0.8rem', display: 'inline-block' }}>
                    📄 {documents.resumeName}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: TERMS AND CONDITIONS */}
        {step === 6 && (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.2rem', color: 'var(--primary)' }}>6. Terms & Conditions</h3>
            
            <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', marginBottom: '1.3rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                Please review and accept our platform placement policy before submitting your student profile.
              </p>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.88rem' }}>
                <input 
                  type="checkbox" 
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                I agree to the InternEdge Student Placement Policy & Terms.
              </label>

              <button 
                type="button"
                onClick={() => setShowTermsModal(true)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.82rem', cursor: 'pointer', marginTop: '0.6rem', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <HelpCircle size={13} /> View Policy Modal
              </button>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border)' }}>
          {step > 1 ? (
            <button type="button" onClick={() => setStep(s => s - 1)} className="btn btn-secondary">
              <ArrowLeft size={16} /> Previous
            </button>
          ) : <div />}

          {step < 6 ? (
            <button type="button" onClick={handleNext} className="btn btn-primary">
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              type="button" 
              disabled={loading}
              onClick={handleSubmit} 
              className="btn btn-success"
              style={{ padding: '0.75rem 2rem' }}
            >
              {loading ? 'Submitting Profile...' : 'Submit Registration'}
            </button>
          )}
        </div>

      </div>

      {/* EMAIL OTP VERIFICATION MODAL BOX */}
      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem' }}>Email Verification</h3>
              <button onClick={() => setShowOtpModal(false)} className="close-btn"><X size={18} /></button>
            </div>

            <div style={{ marginBottom: '1.3rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.8rem' }}>
                Enter the 6-digit verification code sent to <strong>{personal.email}</strong>
              </p>

              {demoOtp && (
                <div style={{ padding: '0.6rem', background: 'var(--primary-light)', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem' }}>
                  🔑 Demo Code: <span style={{ letterSpacing: '2px', fontWeight: 800 }}>{demoOtp}</span>
                </div>
              )}

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
                placeholder="123456"
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

      {/* TERMS & CONDITIONS MODAL BOX */}
      {showTermsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem' }}>Placement Policy Terms</h3>
              <button onClick={() => setShowTermsModal(false)} className="close-btn"><X size={18} /></button>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <p><strong>1. Academic Integrity:</strong> All registered candidate statistics (CGPA, degree, skills) must be authentic.</p>
              <p><strong>2. Recruitment Code:</strong> Students accepting employment or internship offers through InternEdge commit to professional engagement.</p>
              <p><strong>3. Privacy:</strong> Data is shared exclusively with verified hiring corporate partners.</p>
            </div>
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button 
                onClick={() => { setAcceptedTerms(true); setShowTermsModal(false); }}
                className="btn btn-primary"
              >
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
