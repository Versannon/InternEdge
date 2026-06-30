import { NextResponse } from 'next/server';
import { query, getMockDb } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const companyId = searchParams.get('company_id');

    const mockDb = getMockDb();

    // 1. Fetch Student Applications
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

    // 2. Fetch Company Applications
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
    
    // Check if already applied in MySQL
    try {
      const checkRes = await query('SELECT * FROM applications WHERE job_id = ? AND student_id = ?', [job_id, student_id]);
      if (!checkRes.isMock && checkRes.rows && checkRes.rows.length > 0) {
        return NextResponse.json({ success: false, message: 'You have already applied for this position!' }, { status: 400 });
      }
    } catch (e) {}

    // Insert in MySQL
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

    // Update in MySQL
    try {
      await query(
        'UPDATE applications SET status = ?, recruiter_notes = ? WHERE id = ?',
        [status, notes || null, application_id]
      );
    } catch (dbErr) {
      console.error("MySQL Application patch error:", dbErr.message);
    }

    const appIndex = mockDb.applications.findIndex(a => a.id === Number(application_id));
    if (appIndex !== -1) {
      if (status) mockDb.applications[appIndex].status = status;
      if (notes !== undefined) mockDb.applications[appIndex].recruiter_notes = notes;
    }

    return NextResponse.json({
      success: true,
      message: 'Candidate status updated successfully!'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
