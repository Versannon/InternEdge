'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../layout';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, GraduationCap, Award, Search, Filter, CheckCircle2, 
  Clock, XCircle, FileText, ExternalLink, MapPin, DollarSign, Send, Eye
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'applications'
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Selected Job Modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    fetchJobs();
    if (profile?.id) {
      fetchApplications();
    }
  }, [profile]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.success) setJobs(data.jobs);
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
      if (data.success) setApplications(data.applications);
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
        setTimeout(() => setSelectedJob(null), 1400);
      } else {
        setApplyMessage(`⚠️ ${data.message}`);
      }
    } catch (err) {
      setApplyMessage('⚠️ Submission error');
    }
  };

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
      case 'Interview Scheduled': return <span className="badge badge-blue"><Clock size={12} /> Interview Scheduled</span>;
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
              {applications.filter(a => ['Shortlisted', 'Interview Scheduled', 'Accepted'].includes(a.status)).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Shortlists</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
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
          Explore Positions ({filteredJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'applications' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '1rem',
            padding: '0.4rem 0.8rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'applications' ? '2px solid var(--primary)' : 'none'
          }}
        >
          Application Tracker ({applications.length})
        </button>
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

      {/* TAB 2: APPLICATION TRACKER */}
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
