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
      const dbRes = await query('SELECT * FROM applications WHERE student_id = ? ORDER BY id DESC', [studentId]);
      let enrichedApps = [];

      if (!dbRes.isMock && dbRes.rows) {
        for (const app of dbRes.rows) {
          const jobRes = await query('SELECT * FROM jobs WHERE id = ?', [app.job_id]);
          const job = jobRes.rows && jobRes.rows.length > 0 ? jobRes.rows[0] : {};
          if (job.skills_required) {
            try {
              job.skills_required = JSON.parse(job.skills_required);
            } catch(e) {}
          }
          enrichedApps.push({ ...app, job });
        }
      } else {
        const studentApps = mockDb.applications.filter(a => a.student_id === Number(studentId));
        enrichedApps = studentApps.map(app => {
          const job = mockDb.jobs.find(j => j.id === app.job_id) || {};
          return { ...app, job };
        });
      }

      return NextResponse.json({ success: true, applications: enrichedApps });
    }

    if (companyId) {
      let enrichedApps = [];
      let companyJobs = [];

      const dbJobs = await query('SELECT * FROM jobs WHERE company_id = ? ORDER BY id DESC', [companyId]);
      
      if (!dbJobs.isMock && dbJobs.rows) {
        companyJobs = dbJobs.rows.map(j => {
          try {
            j.skills_required = JSON.parse(j.skills_required);
          } catch(e) {}
          return j;
        });
        const jobIds = companyJobs.map(j => j.id);

        if (jobIds.length > 0) {
          const placeholders = jobIds.map(() => '?').join(',');
          const appRes = await query(`SELECT * FROM applications WHERE job_id IN (${placeholders}) ORDER BY id DESC`, jobIds);
          
          if (appRes.rows) {
            for (const app of appRes.rows) {
              const job = companyJobs.find(j => j.id === app.job_id) || {};
              
              const studentRes = await query('SELECT * FROM students WHERE id = ?', [app.student_id]);
              let student = studentRes.rows && studentRes.rows.length > 0 ? studentRes.rows[0] : {};
              if (student.skills) {
                try {
                  student.skills = JSON.parse(student.skills);
                } catch(e) {}
              }
              enrichedApps.push({ ...app, job, student });
            }
          }
        }
      } else {
        companyJobs = mockDb.jobs.filter(j => j.company_id === Number(companyId));
        const jobIds = companyJobs.map(j => j.id);
        const companyApps = mockDb.applications.filter(a => jobIds.includes(a.job_id));

        enrichedApps = companyApps.map(app => {
          const job = mockDb.jobs.find(j => j.id === app.job_id) || {};
          const student = mockDb.students.find(s => s.id === app.student_id) || {};
          return { ...app, job, student };
        });
      }

      return NextResponse.json({ success: true, applications: enrichedApps, jobs: companyJobs });
    }

    return NextResponse.json({ success: true, applications: mockDb.applications });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { job_id, student_id } = body;

    const mockDb = getMockDb();
    
    try {
      const checkRes = await query('SELECT * FROM applications WHERE job_id = ? AND student_id = ?', [job_id, student_id]);
      if (!checkRes.isMock && checkRes.rows && checkRes.rows.length > 0) {
        return NextResponse.json({ success: false, message: 'You have already applied for this position!' }, { status: 400 });
      }
    } catch (e) {}

    try {
      await query(
        'INSERT INTO applications (job_id, student_id, status, recruiter_notes) VALUES (?, ?, "Applied", "Application submitted successfully.")',
        [job_id, student_id]
      );
    } catch (dbErr) {
      console.error("MySQL Application insert error:", dbErr.message);
    }

    const existing = mockDb.applications.find(a => a.job_id === Number(job_id) && a.student_id === Number(student_id));
    if (existing) {
      return NextResponse.json({ success: false, message: 'You have already applied for this position!' }, { status: 400 });
    }

    const newApp = {
      id: mockDb.applications.length + 1,
      job_id: Number(job_id),
      student_id: Number(student_id),
      status: 'Applied',
      applied_at: new Date().toISOString(),
      recruiter_notes: 'Application submitted successfully.'
    };

    mockDb.applications.unshift(newApp);

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully!',
      application: newApp
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { application_id, status, notes } = body;

    const mockDb = getMockDb();
    const appIndex = mockDb.applications.findIndex(a => a.id === Number(application_id));

    // Update in MySQL
    try {
      await query(
        'UPDATE applications SET status = ?, recruiter_notes = ? WHERE id = ?',
        [status, notes || null, application_id]
      );
    } catch (dbErr) {
      console.error("MySQL Application patch error:", dbErr.message);
    }

    if (appIndex !== -1) {
      if (status) mockDb.applications[appIndex].status = status;
      if (notes !== undefined) mockDb.applications[appIndex].recruiter_notes = notes;
    }

    // Fetch details to send email notification
    let appRecord = null;
    let student = null;
    let job = null;

    try {
      const appQuery = await query('SELECT * FROM applications WHERE id = ?', [application_id]);
      if (appQuery.rows && appQuery.rows.length > 0) {
        appRecord = appQuery.rows[0];
        const studQuery = await query('SELECT * FROM students WHERE id = ?', [appRecord.student_id]);
        if (studQuery.rows && studQuery.rows.length > 0) student = studQuery.rows[0];
        const jobQuery = await query('SELECT * FROM jobs WHERE id = ?', [appRecord.job_id]);
        if (jobQuery.rows && jobQuery.rows.length > 0) job = jobQuery.rows[0];
      }
    } catch (e) {}

    // Fallback if MySQL offline/mock
    if (!student && appIndex !== -1) {
      const mockApp = mockDb.applications[appIndex];
      student = mockDb.students.find(s => s.id === mockApp.student_id) || { fullname: 'Candidate', email: 'demo.student@internedge.edu' };
      job = mockDb.jobs.find(j => j.id === mockApp.job_id) || { title: 'Software Intern', company_name: 'Corporate Partner' };
    }

    if (student && job && status) {
      try {
        const statusColors = {
          'Shortlisted': '#b45309',
          'Accepted': '#059669',
          'Rejected': '#dc2626',
          'Under Review': '#2563eb'
        };
        const activeColor = statusColors[status] || '#475569';

        const mailHtml = `
          <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; border-radius: 12px; max-width: 550px; border: 1px solid #e2e8f0;">
            <span style="background: ${activeColor}; color: white; font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: 700; text-transform: uppercase;">Application Pipeline Update</span>
            <h2 style="color: #0f172a; margin-top: 8px;">Status Changed to: ${status}</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.5;">Hi ${student.fullname || student.name || 'Candidate'},</p>
            <p style="color: #475569; font-size: 15px; line-height: 1.5;">Your job application progress for <strong>${job.title}</strong> at <strong>${job.company_name}</strong> has been updated to **${status}**.</p>
            ${notes ? `<div style="background: #ffffff; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; margin: 15px 0; color: #475569; font-size: 14px;"><strong>Recruiter Notes & Feedback:</strong> ${notes}</div>` : ''}
            <a href="http://localhost:3000/login" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; display: inline-block; margin-top: 15px;">View Student Dashboard</a>
          </div>
        `;

        await transporter.sendMail({
          from: `"${job.company_name} Recruiter" <kakadiyasuprince@gmail.com>`,
          to: student.email,
          subject: `InternEdge Status Update: ${job.title}`,
          html: mailHtml
        });
      } catch (mailErr) {
        console.error("Status update email failed:", mailErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Candidate status updated successfully!'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
