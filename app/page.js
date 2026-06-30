'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Building2, ShieldCheck, Database, CheckCircle2, ArrowRight, Briefcase } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section style={{ padding: '4.5rem 0 3.5rem 0', textAlign: 'center', background: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <span className="badge badge-blue" style={{ marginBottom: '1.2rem', padding: '0.4rem 1rem', fontSize: '0.82rem', borderRadius: '50px' }}>
            Official Campus & Placement Portal
          </span>
          <h1 style={{ fontSize: '3rem', lineHeight: 1.2, marginBottom: '1.2rem', fontWeight: 800 }}>
            Connecting Student Talent with Leading Employers
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2.2rem', fontWeight: 400, lineHeight: 1.6 }}>
            InternEdge streamlines university recruitment. Verified student credentials, structured academic profiles, direct application tracking pipelines, and integrated database support.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/register/student" className="btn btn-primary" style={{ padding: '0.8rem 1.8rem' }}>
              <GraduationCap size={18} /> Student Registration <ArrowRight size={16} />
            </Link>
            <Link href="/register/company" className="btn btn-secondary" style={{ padding: '0.8rem 1.8rem' }}>
              <Building2 size={18} /> Employer Registration
            </Link>
          </div>
        </div>
      </section>

      {/* Portal Role Selection Cards */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem' }}>
            Select Account Portal
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.8rem' }}>
            {/* Student Card */}
            <div className="card-panel" style={{ padding: '2.2rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem' }}>
                <GraduationCap size={26} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>For Students</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.4rem', lineHeight: 1.6 }}>
                Build your verified academic resume, showcase your technical skills, apply for curated internship openings, and track recruitment milestones.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.8rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--primary)" /> Verified Academic & Skill Profiles
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--primary)" /> Email OTP Verification Security
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--primary)" /> Direct Recruiter Feedback Pipeline
                </li>
              </ul>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <Link href="/register/student" className="btn btn-primary" style={{ flex: 1 }}>Student Sign Up</Link>
                <Link href="/login" className="btn btn-secondary">Sign In</Link>
              </div>
            </div>

            {/* Company Card */}
            <div className="card-panel" style={{ padding: '2.2rem' }}>
              <div style={{ width: '48px', height: '48px', background: '#f8fafc', border: '1px solid var(--border-strong)', color: 'var(--text-main)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem' }}>
                <Building2 size={26} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>For Employers</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.4rem', lineHeight: 1.6 }}>
                Publish internship and entry-level positions, set minimum academic cutoffs, review candidate submissions, and manage interview scheduling.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.8rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--text-main)" /> Post Custom Openings & Cutoffs
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--text-main)" /> Filter Applicants by CGPA & Skill
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--text-main)" /> Manage Applicant Pipeline Statuses
                </li>
              </ul>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <Link href="/register/company" className="btn btn-secondary" style={{ flex: 1 }}>Employer Sign Up</Link>
                <Link href="/login" className="btn btn-outline">Sign In</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture summary */}
      <section style={{ padding: '2.5rem 0 4rem 0' }}>
        <div className="container">
          <div className="card-panel" style={{ padding: '2.2rem', textAlign: 'center', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>Enterprise Database & Security Infrastructure</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', fontSize: '0.92rem' }}>
              Powered by Next.js App Router, Node.js API endpoints, and XAMPP MySQL relational database management (`schema.sql` integration with OTP email verification).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
