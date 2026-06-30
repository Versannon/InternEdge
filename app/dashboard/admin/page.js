'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../layout';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, CheckCircle2, XCircle, Users, Briefcase, 
  FileText, Building2, Search, ArrowRight, LogOut 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logoutUser } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({ students: 0, jobs: 0, applications: 0 });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  // Redirect if not super-admin
  useEffect(() => {
    const savedUser = localStorage.getItem('internedge_user');
    if (!savedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    if (parsedUser.role !== 'admin' && parsedUser.email !== 'admin@internedge.edu') {
      router.push('/login');
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/verify');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (compId, newStatus) => {
    setMessage('Updating status...');
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: compId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Success: Employer marked as ${newStatus}`);
        fetchAdminData();
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage(`⚠️ ${data.message}`);
      }
    } catch (err) {
      setMessage('⚠️ Update error');
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCompanies = filteredCompanies.filter(c => c.status === 'Pending');
  const processedCompanies = filteredCompanies.filter(c => c.status !== 'Pending');

  if (loading) {
    return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading Admin Panel...</div>;
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Admin Title Card */}
      <div className="card-panel" style={{ padding: '1.8rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldAlert size={12} /> Super Administrator
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem' }}>InternEdge Verification Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Verify registrations, moderate active corporate accounts, and monitor metrics
          </p>
        </div>
        <button onClick={() => { logoutUser(); router.push('/login'); }} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <LogOut size={16} /> Logout Admins
        </button>
      </div>

      {/* Global Metrics Counter */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        <div className="card-panel" style={{ padding: '1.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.8rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.students}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Students</div>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '1.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.8rem', background: '#f0fdf4', color: '#15803d', borderRadius: '8px' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.jobs}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Openings</div>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '1.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.8rem', background: '#fffbeb', color: '#b45309', borderRadius: '8px' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.applications}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Job Applications</div>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '1.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.8rem', background: '#faf5ff', color: '#6b21a8', borderRadius: '8px' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{companies.length}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Employers Registered</div>
          </div>
        </div>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--primary-light)', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          {message}
        </div>
      )}

      {/* SECTION 1: PENDING EMPLOYERS QUEUE */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>Pending Approvals</span>
          <span className="badge badge-amber">{pendingCompanies.length} pending</span>
        </h2>

        {pendingCompanies.length === 0 ? (
          <div className="card-panel" style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 0.8rem' }} />
            <p style={{ fontWeight: 600 }}>All companies are caught up! No pending verifications.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.2rem' }}>
            {pendingCompanies.map(c => (
              <div key={c.id} className="card-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #d97706' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.3rem' }}>{c.company_name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                  Size: {c.company_size} • Founded: {c.founded_year}
                </p>
                <div style={{ margin: '0.8rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '0.6rem', borderRadius: '4px' }}>
                  <strong>Description:</strong> {c.description || 'No description provided.'}
                </div>
                <div style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>
                  <div>Email: <strong>{c.email}</strong></div>
                  <div>Location: {c.city}, {c.state}, {c.country}</div>
                  <div>Address: {c.full_address}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button onClick={() => handleUpdateStatus(c.id, 'Approved')} className="btn btn-success" style={{ flex: 1, padding: '0.45rem', fontSize: '0.82rem' }}>
                    Approve Account
                  </button>
                  <button onClick={() => handleUpdateStatus(c.id, 'Rejected')} className="btn btn-danger" style={{ flex: 1, padding: '0.45rem', fontSize: '0.82rem' }}>
                    Reject Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: REGISTERED ROSTER */}
      <div className="card-panel" style={{ padding: '1.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <h2 style={{ fontSize: '1.3rem' }}>Registered Employer Roster</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-strong)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', background: '#ffffff', minWidth: '260px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search companies by name..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: '#f8fafc', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.8rem 1rem' }}>Employer Name</th>
                <th style={{ padding: '0.8rem 1rem' }}>Official Contacts</th>
                <th style={{ padding: '0.8rem 1rem' }}>Business Domain</th>
                <th style={{ padding: '0.8rem 1rem' }}>Verification State</th>
                <th style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedCompanies.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>{c.company_name}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <div>{c.email}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>{c.contact}</div>
                  </td>
                  <td style={{ padding: '0.8rem 1rem' }}>{c.industry_type}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <span className={`badge ${c.status === 'Approved' ? 'badge-green' : 'badge-red'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                    {c.status === 'Approved' ? (
                      <button onClick={() => handleUpdateStatus(c.id, 'Rejected')} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#b91c1c' }}>
                        Revoke Approval
                      </button>
                    ) : (
                      <button onClick={() => handleUpdateStatus(c.id, 'Approved')} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                        Re-Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {processedCompanies.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No verified employers in database yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
