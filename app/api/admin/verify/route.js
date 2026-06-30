import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { query } from '../../../../lib/db';

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
    // Fetch stats and lists
    const studentCount = await query('SELECT COUNT(*) as cnt FROM students');
    const jobCount = await query('SELECT COUNT(*) as cnt FROM jobs');
    const appCount = await query('SELECT COUNT(*) as cnt FROM applications');
    const companyList = await query('SELECT * FROM companies ORDER BY id DESC');

    return NextResponse.json({
      success: true,
      stats: {
        students: studentCount.rows ? studentCount.rows[0].cnt : 0,
        jobs: jobCount.rows ? jobCount.rows[0].cnt : 0,
        applications: appCount.rows ? appCount.rows[0].cnt : 0
      },
      companies: companyList.rows || []
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { company_id, status } = body;

    if (!company_id || !status) {
      return NextResponse.json({ success: false, message: 'Company ID and status are required' }, { status: 400 });
    }

    // 1. Fetch Company details
    const compRes = await query('SELECT * FROM companies WHERE id = ?', [company_id]);
    if (compRes.rows && compRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });
    }
    const company = compRes.rows[0];

    // 2. Update company status
    await query('UPDATE companies SET status = ? WHERE id = ?', [status, company_id]);

    // 3. Send email update
    try {
      const subject = status === 'Approved' ? 'InternEdge Account Approved 🎉' : 'InternEdge Verification Update';
      const bodyHtml = status === 'Approved' 
        ? `
          <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; border-radius: 12px; max-width: 550px; border: 1px solid #e2e8f0;">
            <h2 style="color: #2563eb; margin-bottom: 8px;">Congratulations, ${company.company_name}!</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.5;">Your corporate employer account has been **Approved** by the campus placement admins.</p>
            <p style="color: #475569; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">You can now log in to post job opportunities and review student candidate submissions.</p>
            <a href="http://localhost:3000/login" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; display: inline-block;">Log In to Recruiter Dashboard</a>
          </div>
        `
        : `
          <div style="font-family: sans-serif; padding: 24px; background: #fdf2f2; border-radius: 12px; max-width: 550px; border: 1px solid #fecaca;">
            <h2 style="color: #b91c1c; margin-bottom: 8px;">Registration Verification Update</h2>
            <p style="color: #7f1d1d; font-size: 15px; line-height: 1.5;">Your corporate account registration for **${company.company_name}** could not be verified by the admin team.</p>
            <p style="color: #7f1d1d; font-size: 15px; line-height: 1.5;">Please contact the placement support cell at admin@internedge.edu if you believe this is a mistake.</p>
          </div>
        `;

      await transporter.sendMail({
        from: '"InternEdge Admins" <kakadiyasuprince@gmail.com>',
        to: company.email,
        subject: subject,
        html: bodyHtml
      });
    } catch (mailErr) {
      console.error("Moderator alert email failed:", mailErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Employer status successfully updated to ${status}`
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
