'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../layout';
import { useRouter } from 'next/navigation';
import { 
  Building2, PlusCircle, Users, Briefcase, CheckCircle2, 
  Clock, XCircle, FileText, ExternalLink, Filter, MessageSquare, X,
  Calendar, Video, Send, RefreshCw, AlertCircle
} from 'lucide-react';

export default function CompanyDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants' | 'jobs' | 'messages' | 'interviews'
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Applicants
  const [cgpaFilter, setCgpaFilter] = useState('0');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State for Posting New Job
  const [showPostModal, setShowPostModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    type: 'Internship',
    location: '',
    stipend: '',
    duration: '',
    cgpa_required: '7.5',
    skills_required: '',
    deadline: '',
    description: ''
  });
  const [postMessage, setPostMessage] = useState('');

  // Status Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');

  // Interview Scheduler Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    link: 'https://meet.google.com/abc-defg-hij',
    notes: ''
  });
  const [scheduleMessage, setScheduleMessage] = useState('');

  // Chat State
  const [chatPartners, setChatPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null); // student profile
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('internedge_user');
    const savedProfile = localStorage.getItem('internedge_profile');
    if (!savedUser || !savedProfile) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    if (parsedUser.role !== 'company') {
      router.push('/login');
      return;
    }

    fetchCompanyData();
  }, [profile]);

  useEffect(() => {
    if (selectedPartner && profile?.id) {
      fetchMessages(selectedPartner.id);
      const interval = setInterval(() => fetchMessages(selectedPartner.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedPartner]);

  const fetchCompanyData = async () => {
    try {
      const res = await fetch(`/api/applications?company_id=${profile?.id || 1}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
        setJobs(data.jobs || []);
        
        // Load chat partners (students who applied)
        const partnersMap = new Map();
        (data.applications || []).forEach(app => {
          if (app.student?.id) {
            partnersMap.set(app.student.id, {
              id: app.student.id,
              name: app.student.name || app.student.fullname
            });
          }
        });
        setChatPartners(Array.from(partnersMap.values()));
      }
      
      // Load interviews
      const intvRes = await fetch(`/api/interviews?company_id=${profile?.id || 1}`);
      const intvData = await intvRes.json();
      if (intvData.success) {
        setInterviews(intvData.interviews || []);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      const res = await fetch(`/api/messages?sender_id=${profile?.id}&sender_role=company&receiver_id=${partnerId}&receiver_role=student`);
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
          sender_role: 'company',
          receiver_id: selectedPartner.id,
          receiver_role: 'student',
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

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPostMessage('Posting position...');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newJob,
          company_id: profile?.id || 1,
          company_name: profile?.company_name || 'Corporate Employer'
        })
      });
      const data = await res.json();
      if (data.success) {
        setPostMessage('Job opening posted successfully!');
        fetchCompanyData();
        setTimeout(() => { setShowPostModal(false); setPostMessage(''); }, 1200);
      } else {
        setPostMessage(`⚠️ ${data.message}`);
      }
    } catch (err) {
      setPostMessage('⚠️ Connection error');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedApp) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: selectedApp.id,
          status: newStatus,
          notes: statusNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchCompanyData();
        setSelectedApp(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenScheduler = () => {
    setScheduleMessage('');
    setShowScheduleModal(true);
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setScheduleMessage('Scheduling interview...');
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: selectedApp.id,
          student_id: selectedApp.student_id,
          company_id: profile?.id || 1,
          job_id: selectedApp.job_id,
          scheduled_date: scheduleData.date,
          scheduled_time: scheduleData.time,
          meeting_link: scheduleData.link,
          notes: scheduleData.notes
        })
      });
      const data = await res.json();
      if (data.success) {
        setScheduleMessage('Interview scheduled successfully!');
        fetchCompanyData();
        setTimeout(() => {
          setShowScheduleModal(false);
          setSelectedApp(null);
          setScheduleMessage('');
        }, 1200);
      } else {
        setScheduleMessage(`⚠️ ${data.message}`);
      }
    } catch (err) {
      setScheduleMessage('⚠️ Scheduling error');
    }
  };

  const filteredApplications = applications.filter(a => {
    const studentCgpa = parseFloat(a.student?.cgpa || 0);
    const matchesCgpa = studentCgpa >= parseFloat(cgpaFilter);
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesCgpa && matchesStatus;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Recruiter Header */}
      <div className="card-panel" style={{ padding: '1.8rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
        <div>
          <span className="badge badge-gray" style={{ marginBottom: '0.4rem' }}>Verified Corporate Employer</span>
          <h1 style={{ fontSize: '1.8rem' }}>{profile?.company_name || 'Employer Account'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Domain: {profile?.industry || 'Corporate'} • Talent Lead: <strong>{profile?.hr_name || 'HR Specialist'}</strong>
          </p>
        </div>

        <button onClick={() => setShowPostModal(true)} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          <PlusCircle size={18} /> Post New Opportunity
        </button>
      </div>

      {/* Stats Counter */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{jobs.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Postings</div>
        </div>
        <div className="card-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{applications.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Applicants</div>
        </div>
        <div className="card-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#b45309' }}>
            {interviews.length}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Interviews Scheduled</div>
        </div>
        <div className="card-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>
            {applications.filter(a => a.status === 'Accepted').length}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Accepted Offers</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', flexWrap: 'wrap' }}>
        {[
          { id: 'applicants', label: 'Candidate Reviewer', count: filteredApplications.length },
          { id: 'jobs', label: 'Active Openings', count: jobs.length },
          { id: 'interviews', label: 'Interview Slots', count: interviews.length },
          { id: 'messages', label: 'Chat Messages', count: chatPartners.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '0.4rem 0.8rem',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : 'none'
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* TAB 1: CANDIDATE APPLICANTS */}
      {activeTab === 'applicants' && (
        <div>
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.4rem', flexWrap: 'wrap', alignItems: 'center', background: '#ffffff', padding: '0.85rem 1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <Filter size={15} /> Filter Candidate Pool:
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>Min CGPA:</label>
              <select className="form-select" style={{ width: '120px', padding: '0.35rem 0.6rem' }} value={cgpaFilter} onChange={(e) => setCgpaFilter(e.target.value)}>
                <option value="0">All Scores</option>
                <option value="7.0">7.0+ CGPA</option>
                <option value="8.0">8.0+ CGPA</option>
                <option value="8.5">8.5+ CGPA</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>Status:</label>
              <select className="form-select" style={{ width: '160px', padding: '0.35rem 0.6rem' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Applicants Table */}
          <div className="card-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: '#f8fafc', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem 1.2rem' }}>Candidate</th>
                  <th style={{ padding: '1rem 1.2rem' }}>Applied Role</th>
                  <th style={{ padding: '1rem 1.2rem' }}>Academics & CGPA</th>
                  <th style={{ padding: '1rem 1.2rem' }}>Pipeline Status</th>
                  <th style={{ padding: '1rem 1.2rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{app.student?.name || 'Candidate Student'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>{app.student?.phone}</div>
                    </td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <div style={{ color: 'var(--primary)', fontWeight: 600 }}>{app.job?.title}</div>
                      <span className="badge badge-gray" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>{app.job?.type}</span>
                    </td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <div>{app.student?.college}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                        {app.student?.course} ({app.student?.branch}) • CGPA: <strong>{app.student?.cgpa}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <span className="badge badge-amber">{app.status}</span>
                    </td>
                    <td style={{ padding: '1rem 1.2rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => { setSelectedApp(app); setStatusNotes(app.recruiter_notes || ''); }} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Evaluate Candidate
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredApplications.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No applicants match the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE POSTINGS */}
      {activeTab === 'jobs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' }}>
          {jobs.map((j) => (
            <div key={j.id} className="card-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                <span className="badge badge-gray">{j.type}</span>
                <span className="badge badge-green">Active</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>{j.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.8rem' }}>
                Location: {j.location} • Stipend: {j.stipend}
              </p>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
                Required Cutoff: {j.cgpa_required} CGPA | Deadline: {j.deadline}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: INTERVIEW SLOTS LIST */}
      {activeTab === 'interviews' && (
        <div>
          {interviews.length === 0 ? (
            <div className="card-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Calendar size={36} color="var(--text-subtle)" style={{ margin: '0 auto 0.8rem' }} />
              <h3>No Interviews Scheduled Yet</h3>
              <p style={{ fontSize: '0.88rem', marginTop: '0.3rem' }}>
                Go to the Candidate Reviewer tab and select "Schedule Interview" to assign slot dates.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.2rem' }}>
              {interviews.map(i => (
                <div key={i.id} className="card-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <span className="badge badge-blue">Recruitment Call</span>
                    <span className="badge badge-gray">{i.status}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>Candidate: {i.student?.name || 'Student'}</h3>
                  <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.8rem' }}>Role: {i.job?.title}</div>

                  <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                    <div>📅 <strong>Date:</strong> {i.scheduled_date}</div>
                    <div>⏰ <strong>Time:</strong> {i.scheduled_time}</div>
                    {i.notes && <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>📝 <strong>Notes:</strong> {i.notes}</div>}
                  </div>

                  <a href={i.meeting_link} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.55rem', fontSize: '0.85rem' }}>
                    <Video size={16} /> Open Meeting Room
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CHAT WITH STUDENTS */}
      {activeTab === 'messages' && (
        <div className="card-panel" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '500px', padding: 0, overflow: 'hidden' }}>
          {/* Sidebar Chat Partners */}
          <div style={{ borderRight: '1px solid var(--border)', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', fontWeight: 700 }}>
              Student Candidates
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {chatPartners.length === 0 ? (
                <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-subtle)', textAlign: 'center' }}>
                  No candidate submissions yet to chat with.
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

          {/* Chat box body */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
            {selectedPartner ? (
              <>
                <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', background: '#f8fafc', fontSize: '0.9rem', fontWeight: 700 }}>
                  💬 Candidate: {selectedPartner.name}
                </div>

                <div style={{ flex: 1, padding: '1.2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ margin: 'auto', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                      Start your dialogue by typing a message below.
                    </div>
                  ) : (
                    chatMessages.map(m => {
                      const isMe = m.sender_role === 'company';
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

                <form onSubmit={handleSendMessage} style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.6rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type message to candidate..."
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
                <p style={{ fontSize: '0.9rem' }}>Select a candidate from the left panel to open chat thread.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POST NEW JOB MODAL */}
      {showPostModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.3rem' }}>Post New Job / Internship Opening</h3>
              <button onClick={() => setShowPostModal(false)} className="close-btn"><X size={18} /></button>
            </div>

            <form onSubmit={handlePostJob}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Position Title</label>
                  <input type="text" required className="form-input" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Software Developer Intern" />
                </div>

                <div className="form-group">
                  <label className="form-label">Employment Type</label>
                  <select className="form-select" value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})}>
                    <option value="Internship">Internship</option>
                    <option value="Full-Time">Full-Time</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" required className="form-input" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} placeholder="e.g. Remote / On-site" />
                </div>

                <div className="form-group">
                  <label className="form-label">Stipend / Package</label>
                  <input type="text" required className="form-input" value={newJob.stipend} onChange={e => setNewJob({...newJob, stipend: e.target.value})} placeholder="e.g. ₹25,000 / month" />
                </div>

                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input type="text" required className="form-input" value={newJob.duration} onChange={e => setNewJob({...newJob, duration: e.target.value})} placeholder="e.g. 6 Months" />
                </div>

                <div className="form-group">
                  <label className="form-label">CGPA Cutoff Requirement</label>
                  <input type="number" step="0.1" className="form-input" value={newJob.cgpa_required} onChange={e => setNewJob({...newJob, cgpa_required: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Deadline Date</label>
                  <input type="date" required className="form-input" value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Required Skills (Comma separated)</label>
                  <input type="text" required className="form-input" value={newJob.skills_required} onChange={e => setNewJob({...newJob, skills_required: e.target.value})} placeholder="e.g. React, Node.js, SQL" />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description & Responsibilities</label>
                  <textarea rows={3} required className="form-textarea" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} placeholder="Enter detailed job description..." />
                </div>
              </div>

              {postMessage && <div style={{ textAlign: 'center', marginTop: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{postMessage}</div>}

              <div style={{ marginTop: '1.4rem', textAlign: 'right' }}>
                <button type="submit" className="btn btn-primary">
                  Publish Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLICANT EVALUATION MODAL */}
      {selectedApp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem' }}>Candidate Evaluation: {selectedApp.student?.name}</h3>
              <button onClick={() => setSelectedApp(null)} className="close-btn"><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <p><strong>College:</strong> {selectedApp.student?.college}</p>
              <p><strong>Branch & Score:</strong> {selectedApp.student?.branch} | <strong>{selectedApp.student?.cgpa} CGPA</strong></p>
              <p><strong>Skills:</strong> {(selectedApp.student?.skills || []).join(', ')}</p>
              
              <div className="form-group">
                <label className="form-label">Recruiter Notes & Feedback</label>
                <textarea 
                  className="form-textarea" 
                  rows={3} 
                  value={statusNotes} 
                  onChange={e => setStatusNotes(e.target.value)}
                  placeholder="Add feedback notes for candidate..."
                />
              </div>

              <label className="form-label">Update Application Status:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <button onClick={() => handleUpdateStatus('Under Review')} className="btn btn-secondary">Set Under Review</button>
                <button onClick={() => handleUpdateStatus('Shortlisted')} className="btn btn-primary">⭐ Shortlist Candidate</button>
                <button onClick={handleOpenScheduler} className="btn btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>📅 Arrange Interview</button>
                <button onClick={() => handleUpdateStatus('Accepted')} className="btn btn-success">🎉 Accept & Offer</button>
                <button onClick={() => handleUpdateStatus('Rejected')} className="btn btn-danger" style={{ gridColumn: 'span 2' }}>Reject Submission</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERVIEW SCHEDULER SUB-MODAL */}
      {showScheduleModal && selectedApp && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>Arrange Assessment Call: {selectedApp.student?.name}</h3>
              <button onClick={() => setShowScheduleModal(false)} className="close-btn"><X size={18} /></button>
            </div>

            <form onSubmit={handleScheduleInterview}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div className="form-group">
                  <label className="form-label">Interview Date</label>
                  <input 
                    type="date" 
                    required 
                    className="form-input" 
                    value={scheduleData.date}
                    onChange={e => setScheduleData({...scheduleData, date: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Interview Time</label>
                  <input 
                    type="time" 
                    required 
                    className="form-input" 
                    value={scheduleData.time}
                    onChange={e => setScheduleData({...scheduleData, time: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Meeting Room Link (Zoom / Google Meet)</label>
                  <input 
                    type="url" 
                    required 
                    className="form-input" 
                    value={scheduleData.link}
                    onChange={e => setScheduleData({...scheduleData, link: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Special Notes (Agenda, Pre-reads, etc.)</label>
                  <textarea 
                    rows={3} 
                    className="form-textarea" 
                    value={scheduleData.notes}
                    onChange={e => setScheduleData({...scheduleData, notes: e.target.value})}
                    placeholder="Focus areas for technical assessment..."
                  />
                </div>
              </div>

              {scheduleMessage && (
                <div style={{ marginTop: '0.8rem', color: 'var(--primary)', fontWeight: 600, textAlign: 'center' }}>
                  {scheduleMessage}
                </div>
              )}

              <div style={{ marginTop: '1.2rem', textAlign: 'right' }}>
                <button type="button" onClick={() => setShowScheduleModal(false)} className="btn btn-secondary" style={{ marginRight: '0.6rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Schedule & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
