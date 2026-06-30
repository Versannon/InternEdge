'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../layout';
import { useRouter } from 'next/navigation';
import { 
  Building2, PlusCircle, Users, Briefcase, CheckCircle2, 
  Clock, XCircle, FileText, ExternalLink, Filter, MessageSquare, X
} from 'lucide-react';

export default function CompanyDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants' | 'jobs'
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
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

  useEffect(() => {
    fetchCompanyData();
  }, [profile]);

  const fetchCompanyData = async () => {
    try {
      const res = await fetch(`/api/applications?company_id=${profile?.id || 1}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
            {applications.filter(a => a.status === 'Shortlisted').length}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Shortlisted</div>
        </div>
        <div className="card-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>
            {applications.filter(a => a.status === 'Accepted').length}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Accepted Offers</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
        <button
          onClick={() => setActiveTab('applicants')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'applicants' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '1rem',
            padding: '0.4rem 0.8rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'applicants' ? '2px solid var(--primary)' : 'none'
          }}
        >
          Candidate Reviewer ({filteredApplications.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'jobs' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '1rem',
            padding: '0.4rem 0.8rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'jobs' ? '2px solid var(--primary)' : 'none'
          }}
        >
          Active Openings ({jobs.length})
        </button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
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
                <button onClick={() => handleUpdateStatus('Interview Scheduled')} className="btn btn-outline">📅 Schedule Interview</button>
                <button onClick={() => handleUpdateStatus('Accepted')} className="btn btn-success">🎉 Accept & Offer</button>
                <button onClick={() => handleUpdateStatus('Rejected')} className="btn btn-danger" style={{ gridColumn: 'span 2' }}>Reject Submission</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
