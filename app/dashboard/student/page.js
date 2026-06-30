'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../layout';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, GraduationCap, Award, Search, Filter, CheckCircle2, 
  Clock, XCircle, FileText, ExternalLink, MapPin, DollarSign, Send, Eye,
  MessageSquare, Calendar, Video, BookOpen, AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'recommendations' | 'applications' | 'interviews' | 'messages'
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Selected Job Modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');

  // Chat State
  const [chatPartners, setChatPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null); // { id, name }
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('internedge_user');
    const savedProfile = localStorage.getItem('internedge_profile');
    if (!savedUser || !savedProfile) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    if (parsedUser.role !== 'student') {
      router.push('/login');
      return;
    }

    fetchJobs();
    if (profile?.id) {
      fetchApplications();
      fetchInterviews();
      fetchChatPartners();
    }
  }, [profile]);

  // Poll for messages when a chat is open
  useEffect(() => {
    if (selectedPartner && profile?.id) {
      fetchMessages(selectedPartner.id);
      const interval = setInterval(() => fetchMessages(selectedPartner.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedPartner]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.success) {
        // Exclude pending/rejected companies if status matches, let's keep all active approved ones
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/applications?student_id=${profile?.id || 1}`);
      const data = await res.json();
      if (data.success) setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInterviews = async () => {
    try {
      const res = await fetch(`/api/interviews?student_id=${profile?.id || 1}`);
      const data = await res.json();
      if (data.success) setInterviews(data.interviews || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChatPartners = async () => {
    // Generate chat partners from companies the student has applied to
    try {
      const res = await fetch(`/api/applications?student_id=${profile?.id || 1}`);
      const data = await res.json();
      if (data.success && data.applications) {
        const partnersMap = new Map();
        data.applications.forEach(app => {
          if (app.job?.company_id) {
            partnersMap.set(app.job.company_id, {
              id: app.job.company_id,
              name: app.job.company_name
            });
          }
        });
        setChatPartners(Array.from(partnersMap.values()));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      const res = await fetch(`/api/messages?sender_id=${profile?.id}&sender_role=student&receiver_id=${partnerId}&receiver_role=company`);
      const data = await res.json();
      if (data.success) setChatMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedPartner) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: profile?.id,
          sender_role: 'student',
          receiver_id: selectedPartner.id,
          receiver_role: 'company',
          message_text: inputMessage.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, data.chatMessage]);
        setInputMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (jobId) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          student_id: profile?.id || 1
        })
      });
      const data = await res.json();
      if (data.success) {
        setApplyMessage('Application submitted successfully!');
        fetchApplications();
        fetchChatPartners(); // Refresh chat partners
        setTimeout(() => setSelectedJob(null), 1400);
      } else {
        setApplyMessage(`⚠️ ${data.message}`);
      }
    } catch (err) {
      setApplyMessage('⚠️ Submission error');
    }
  };

  // Matchmaking Scoring
  const getJobMatchScore = (job) => {
    const studSkills = Array.isArray(profile?.skills) ? profile.skills : JSON.parse(profile?.skills || '[]');
    let jobSkills = [];
    try {
      jobSkills = Array.isArray(job.skills_required) ? job.skills_required : JSON.parse(job.skills_required || '[]');
    } catch(e) {
      jobSkills = job.skills_required ? job.skills_required.split(',') : [];
    }
    
    if (jobSkills.length === 0) return 0;
    const overlap = jobSkills.filter(s => studSkills.some(ss => ss.toLowerCase() === s.trim().toLowerCase()));
    return Math.round((overlap.length / jobSkills.length) * 100);
  };

  // Recommendations sorted by match score
  const recommendedJobs = jobs
    .map(j => ({ ...j, matchScore: getJobMatchScore(j) }))
    .filter(j => j.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || j.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Applied': return <span className="badge badge-blue"><Clock size={12} /> Applied</span>;
      case 'Under Review': return <span className="badge badge-gray"><Eye size={12} /> Under Review</span>;
      case 'Shortlisted': return <span className="badge badge-amber"><Award size={12} /> Shortlisted</span>;
      case 'Interview Scheduled': return <span className="badge badge-blue"><Calendar size={12} /> Interview Scheduled</span>;
      case 'Accepted': return <span className="badge badge-green"><CheckCircle2 size={12} /> Accepted Offer</span>;
      case 'Rejected': return <span className="badge badge-red"><XCircle size={12} /> Not Selected</span>;
      default: return <span className="badge badge-blue">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Top Welcome Header */}
      <div className="card-panel" style={{ padding: '1.8rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
        <div>
          <span className="badge badge-blue" style={{ marginBottom: '0.4rem' }}>Candidate Student Account</span>
          <h1 style={{ fontSize: '1.8rem' }}>Welcome, {profile?.name || 'Student Candidate'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {profile?.college || 'University Partner'} • {profile?.course} ({profile?.branch}) • CGPA: <strong>{profile?.cgpa || '8.50'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{applications.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Applications</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669' }}>
              {interviews.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Interviews</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.8rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', flexWrap: 'wrap' }}>
        {[
          { id: 'jobs', label: 'Explore Positions', icon: <Briefcase size={16} /> },
          { id: 'recommendations', label: 'Recommended Matching', icon: <Award size={16} /> },
          { id: 'applications', label: 'Application Tracker', icon: <FileText size={16} /> },
          { id: 'interviews', label: 'Interviews', icon: <Calendar size={16} /> },
          { id: 'messages', label: 'Chat Messages', icon: <MessageSquare size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.92rem',
              padding: '0.6rem 1rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : 'none'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EXPLORE JOBS */}
      {activeTab === 'jobs' && (
        <div>
          {/* Search Bar & Filter */}
          <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.6rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search by position title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: '160px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Internship">Internships Only</option>
              <option value="Full-Time">Full-Time Only</option>
            </select>
          </div>

          {/* Job Listings Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' }}>
            {filteredJobs.map((j) => {
              const hasApplied = applications.some(a => a.job_id === j.id);
              return (
                <div key={j.id} className="card-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <span className="badge badge-gray">{j.type}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Deadline: {j.deadline}</span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{j.title}</h3>
                    <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                      {j.company_name}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {j.location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><DollarSign size={13} /> {j.stipend}</span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1.2rem' }}>
                      {(Array.isArray(j.skills_required) ? j.skills_required : JSON.parse(j.skills_required || '[]')).map((sk, idx) => (
                        <span key={idx} style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid #e2e8f0' }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => { setSelectedJob(j); setApplyMessage(''); }} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem' }}>
                      View Details
                    </button>
                    {hasApplied ? (
                      <button disabled className="btn btn-success" style={{ flex: 1, opacity: 0.9, fontSize: '0.82rem', padding: '0.5rem' }}>
                        Applied ✓
                      </button>
                    ) : (
                      <button onClick={() => { setSelectedJob(j); setApplyMessage(''); }} className="btn btn-primary" style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem' }}>
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SMART MATCH RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div>
          <div className="card-panel" style={{ padding: '1.2rem', marginBottom: '1.5rem', background: 'var(--primary-light)', border: '1px solid #bfdbfe' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={16} /> Skills-Based Matchmaking
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              These job positions match your profile skill bubbles. They are ranked by compatibility match percentages.
            </p>
          </div>

          {recommendedJobs.length === 0 ? (
            <div className="card-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <h3>No recommendation matches found</h3>
              <p style={{ marginTop: '0.4rem', fontSize: '0.9rem' }}>Add more technical skills to your candidate profile to find matches.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' }}>
              {recommendedJobs.map((j) => {
                const hasApplied = applications.some(a => a.job_id === j.id);
                return (
                  <div key={j.id} className="card-panel" style={{ padding: '1.5rem', borderTop: '4px solid #10b981', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                        <span className="badge badge-green" style={{ fontSize: '0.8rem' }}>⭐ {j.matchScore}% Match Score</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Deadline: {j.deadline}</span>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{j.title}</h3>
                      <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                        {j.company_name}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {j.location}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><DollarSign size={13} /> {j.stipend}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border)' }}>
                      <button onClick={() => { setSelectedJob(j); setApplyMessage(''); }} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem' }}>
                        View Details
                      </button>
                      {hasApplied ? (
                        <button disabled className="btn btn-success" style={{ flex: 1, opacity: 0.9, fontSize: '0.82rem', padding: '0.5rem' }}>
                          Applied ✓
                        </button>
                      ) : (
                        <button onClick={() => { setSelectedJob(j); setApplyMessage(''); }} className="btn btn-primary" style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem' }}>
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: APPLICATION TRACKER */}
      {activeTab === 'applications' && (
        <div>
          {applications.length === 0 ? (
            <div className="card-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <h3>No Submissions Found</h3>
              <p style={{ marginTop: '0.4rem', fontSize: '0.9rem' }}>Explore available positions to submit applications.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.map((app) => (
                <div key={app.id} className="card-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                      <h3 style={{ fontSize: '1.15rem' }}>{app.job?.title || 'Position'}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      {app.job?.company_name || 'Employer'}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
                      Applied on: {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.8rem 1.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', maxWidth: '380px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>RECRUITER FEEDBACK</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      "{app.recruiter_notes || 'Application under evaluation by recruitment team.'}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: INTERVIEWS SCHEDULER VIEW */}
      {activeTab === 'interviews' && (
        <div>
          {interviews.length === 0 ? (
            <div className="card-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Calendar size={36} color="var(--text-subtle)" style={{ margin: '0 auto 0.8rem' }} />
              <h3>No Interviews Scheduled</h3>
              <p style={{ fontSize: '0.88rem', marginTop: '0.3rem' }}>
                Your schedules will show up here once an employer requests an interview.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.2rem' }}>
              {interviews.map(i => (
                <div key={i.id} className="card-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <span className="badge badge-green">Scheduled Call</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Status: <strong>{i.status}</strong></span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>{i.job?.title}</h3>
                  <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.8rem' }}>{i.company?.company_name}</div>
                  
                  <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                    <div>📅 <strong>Date:</strong> {i.scheduled_date}</div>
                    <div>⏰ <strong>Time:</strong> {i.scheduled_time}</div>
                    {i.notes && <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>📝 <strong>Notes:</strong> {i.notes}</div>}
                  </div>

                  <a href={i.meeting_link} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.55rem', fontSize: '0.85rem' }}>
                    <Video size={16} /> Join Interview Room
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: IN-APP CHAT CLIENT */}
      {activeTab === 'messages' && (
        <div className="card-panel" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '500px', padding: 0, overflow: 'hidden' }}>
          {/* Sidebar Chat List */}
          <div style={{ borderRight: '1px solid var(--border)', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', fontWeight: 700 }}>
              Recruiter Chats
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {chatPartners.length === 0 ? (
                <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-subtle)', textAlign: 'center' }}>
                  No active application chat channels. Apply to positions to connect!
                </div>
              ) : (
                chatPartners.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPartner(p)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      textAlign: 'left',
                      background: selectedPartner?.id === p.id ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontWeight: selectedPartner?.id === p.id ? 700 : 500,
                      color: selectedPartner?.id === p.id ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {p.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Box */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
            {selectedPartner ? (
              <>
                {/* Chat Header */}
                <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', background: '#f8fafc', fontSize: '0.9rem', fontWeight: 700 }}>
                  💬 {selectedPartner.name} Recruiter Contact
                </div>

                {/* Message Log */}
                <div style={{ flex: 1, padding: '1.2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ margin: 'auto', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                      Start your dialogue by sending a message below.
                    </div>
                  ) : (
                    chatMessages.map(m => {
                      const isMe = m.sender_role === 'student';
                      return (
                        <div key={m.id} style={{
                          maxWidth: '75%',
                          padding: '0.65rem 0.95rem',
                          borderRadius: '8px',
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          background: isMe ? 'var(--primary)' : '#f1f5f9',
                          color: isMe ? '#ffffff' : 'var(--text-main)',
                          fontSize: '0.85rem'
                        }}>
                          {m.message_text}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat Input form */}
                <form onSubmit={handleSendMessage} style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.6rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type message..."
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    <Send size={15} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-subtle)' }}>
                <MessageSquare size={36} style={{ margin: '0 auto 0.6rem' }} />
                <p style={{ fontSize: '0.9rem' }}>Select a corporate recruitment partner from the list to start messaging.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* JOB DETAILS & APPLY MODAL */}
      {selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <span className="badge badge-blue" style={{ marginBottom: '0.3rem' }}>{selectedJob.type}</span>
                <h3 style={{ fontSize: '1.3rem' }}>{selectedJob.title}</h3>
                <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>{selectedJob.company_name}</div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="close-btn"><XCircle size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', gap: '1.2rem', background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div><strong>Location:</strong> {selectedJob.location}</div>
                <div><strong>Stipend:</strong> {selectedJob.stipend}</div>
                <div><strong>Duration:</strong> {selectedJob.duration}</div>
              </div>

              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.3rem' }}>Job Description:</h4>
                <p>{selectedJob.description}</p>
              </div>

              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.3rem' }}>CGPA Requirement:</h4>
                <div className="badge badge-amber">{selectedJob.cgpa_required} CGPA Cutoff</div>
              </div>

              {applyMessage && (
                <div style={{ padding: '0.75rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', textAlign: 'center', fontWeight: 600 }}>
                  {applyMessage}
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedJob(null)} className="btn btn-secondary">Close</button>
              <button onClick={() => handleApply(selectedJob.id)} className="btn btn-primary">
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
