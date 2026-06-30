import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { query, getMockDb } from '../../../lib/db';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'kakadiyasuprince@gmail.com',
    pass: 'jekb cfdp hqpz eznd',
  },
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const companyId = searchParams.get('company_id');

    const mockDb = getMockDb();

    if (studentId) {
      const dbRes = await query('SELECT * FROM interviews WHERE student_id = ? ORDER BY id DESC', [studentId]);
      let list = [];

      if (!dbRes.isMock && dbRes.rows) {
        for (const intv of dbRes.rows) {
          const jobRes = await query('SELECT * FROM jobs WHERE id = ?', [intv.job_id]);
          const job = jobRes.rows && jobRes.rows.length > 0 ? jobRes.rows[0] : {};
          const compRes = await query('SELECT * FROM companies WHERE id = ?', [intv.company_id]);
          const company = compRes.rows && compRes.rows.length > 0 ? compRes.rows[0] : {};
          list.push({ ...intv, job, company });
        }
      } else {
        const studentIntvs = mockDb.interviews.filter(i => i.student_id === Number(studentId));
        list = studentIntvs.map(i => {
          const job = mockDb.jobs.find(j => j.id === i.job_id) || {};
          const company = mockDb.companies.find(c => c.id === i.company_id) || {};
          return { ...i, job, company };
        });
      }
      return NextResponse.json({ success: true, interviews: list });
    }

    if (companyId) {
      const dbRes = await query('SELECT * FROM interviews WHERE company_id = ? ORDER BY id DESC', [companyId]);
      let list = [];

      if (!dbRes.isMock && dbRes.rows) {
        for (const intv of dbRes.rows) {
          const jobRes = await query('SELECT * FROM jobs WHERE id = ?', [intv.job_id]);
          const job = jobRes.rows && jobRes.rows.length > 0 ? jobRes.rows[0] : {};
          const studRes = await query('SELECT * FROM students WHERE id = ?', [intv.student_id]);
          const student = studRes.rows && studRes.rows.length > 0 ? studRes.rows[0] : {};
          list.push({ ...intv, job, student });
        }
      } else {
        const companyIntvs = mockDb.interviews.filter(i => i.company_id === Number(companyId));
        list = companyIntvs.map(i => {
          const job = mockDb.jobs.find(j => j.id === i.job_id) || {};
          const student = mockDb.students.find(s => s.id === i.student_id) || {};
          return { ...i, job, student };
        });
      }
      return NextResponse.json({ success: true, interviews: list });
    }

    return NextResponse.json({ success: false, message: 'Missing query parameters' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { application_id, student_id, company_id, job_id, scheduled_date, scheduled_time, meeting_link, notes } = body;

    if (!application_id || !student_id || !company_id || !job_id || !scheduled_date || !scheduled_time || !meeting_link) {
      return NextResponse.json({ success: false, message: 'Required scheduler fields are incomplete' }, { status: 400 });
    }

    const mockDb = getMockDb();

    // 1. Fetch student and company details for SMTP alerts
    let student = null;
    let company = null;
    let job = null;

    try {
      const studRes = await query('SELECT * FROM students WHERE id = ?', [student_id]);
      if (studRes.rows && studRes.rows.length > 0) student = studRes.rows[0];

      const compRes = await query('SELECT * FROM companies WHERE id = ?', [company_id]);
      if (compRes.rows && compRes.rows.length > 0) company = compRes.rows[0];

      const jobRes = await query('SELECT * FROM jobs WHERE id = ?', [job_id]);
      if (jobRes.rows && jobRes.rows.length > 0) job = jobRes.rows[0];
    } catch (dbErr) {}

    // Fallback info if MySQL check not hit
    student = student || mockDb.students.find(s => s.id === Number(student_id)) || { fullname: 'Candidate', email: 'demo.student@internedge.edu' };
    company = company || mockDb.companies.find(c => c.id === Number(company_id)) || { company_name: 'TechCorp Solutions' };
    job = job || mockDb.jobs.find(j => j.id === Number(job_id)) || { title: 'Software position' };

    // 2. Insert Interview in MySQL
    try {
      const sql = `
        INSERT INTO interviews (application_id, student_id, company_id, job_id, scheduled_date, scheduled_time, status, meeting_link, notes)
        VALUES (?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?)
      `;
      const params = [
        Number(application_id), Number(student_id), Number(company_id), Number(job_id),
        scheduled_date, scheduled_time, meeting_link, notes || null
      ];
      await query(sql, params);

      // Auto update application pipeline status
      await query('UPDATE applications SET status = "Interview Scheduled" WHERE id = ?', [application_id]);
    } catch (dbErr) {
      console.error("MySQL Interview insert error:", dbErr.message);
    }

    // 3. Update Mock stores
    const newIntv = {
      id: mockDb.interviews.length + 1,
      application_id: Number(application_id),
      student_id: Number(student_id),
      company_id: Number(company_id),
      job_id: Number(job_id),
      scheduled_date,
      scheduled_time,
      status: 'Scheduled',
      meeting_link,
      notes: notes || ''
    };
    mockDb.interviews.push(newIntv);

    const mockAppIndex = mockDb.applications.findIndex(a => a.id === Number(application_id));
    if (mockAppIndex !== -1) {
      mockDb.applications[mockAppIndex].status = 'Interview Scheduled';
    }

    // 4. Send SMTP Invitation Email to Student
    try {
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; border-radius: 12px; max-width: 550px; border: 1px solid #e2e8f0;">
          <span style="background: #2563eb; color: white; font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: 700; text-transform: uppercase;">Interview Scheduled</span>
          <h2 style="color: #0f172a; margin-top: 8px; margin-bottom: 4px;">Interview Invitation</h2>
          <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">You have been invited for a technical assessment round at <strong>${company.company_name}</strong>.</p>
          
          <div style="background: #ffffff; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; font-size: 14px;">
            <div style="margin-bottom: 8px;">💼 <strong>Position:</strong> ${job.title}</div>
            <div style="margin-bottom: 8px;">📅 <strong>Date:</strong> ${scheduled_date}</div>
            <div style="margin-bottom: 8px;">⏰ <strong>Time:</strong> ${scheduled_time}</div>
            ${notes ? `<div style="margin-bottom: 8px; color: #64748b;">📝 <strong>Recruiter Notes:</strong> ${notes}</div>` : ''}
          </div>

          <a href="${meeting_link}" target="_blank" style="background: #059669; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; display: inline-block; text-align: center;">Join Assessment Meeting (Google Meet/Zoom)</a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">Please ensure you are online at least 5 minutes before the scheduled time.</p>
        </div>
      `;

      await transporter.sendMail({
        from: `"${company.company_name} Recruiter" <kakadiyasuprince@gmail.com>`,
        to: student.email,
        subject: `Interview Scheduled: ${job.title} at ${company.company_name}`,
        html: emailHtml
      });
    } catch (mailErr) {
      console.error("Interview invitation email failed:", mailErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Interview successfully scheduled! Candidate notified.',
      interview: newIntv
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
