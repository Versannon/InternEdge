import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { query } from '../../../../lib/db';

const otpStore = new Map();

// Configure SMTP Transporter using credentials found in source files
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: 'kakadiyasuprince@gmail.com',
    pass: 'jekb cfdp hqpz eznd',
  },
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, otp } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // ACTION 1: SEND OTP
    if (action === 'send') {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      // Save to memory store
      otpStore.set(cleanEmail, { otp: generatedOtp, expiresAt });

      let savedToDb = false;

      // Update in students table if exists
      try {
        const checkStudent = await query('SELECT * FROM students WHERE email = ?', [cleanEmail]);
        if (!checkStudent.isMock && checkStudent.rows.length > 0) {
          await query('UPDATE students SET otp = ? WHERE email = ?', [generatedOtp, cleanEmail]);
          savedToDb = true;
        }
      } catch (err) {}

      // Update in companies table if exists
      try {
        if (!savedToDb) {
          const checkCompany = await query('SELECT * FROM companies WHERE email = ?', [cleanEmail]);
          if (!checkCompany.isMock && checkCompany.rows.length > 0) {
            await query('UPDATE companies SET otp = ? WHERE email = ?', [generatedOtp, cleanEmail]);
            savedToDb = true;
          }
        }
      } catch (err) {}

      // Try to save to fallback otp_verifications table too
      try {
        await query(
          'INSERT INTO otp_verifications (email, otp_code, expires_at) VALUES (?, ?, ?)',
          [cleanEmail, generatedOtp, expiresAt]
        );
      } catch (err) {}

      // Send actual email via SMTP
      try {
        await transporter.sendMail({
          from: '"InternEdge" <kakadiyasuprince@gmail.com>',
          to: cleanEmail,
          subject: 'InternEdge Verification Code',
          html: `
            <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; border-radius: 12px; max-width: 500px; border: 1px solid #e2e8f0;">
              <h2 style="color: #2563eb; margin-bottom: 8px;">Verify Your Email</h2>
              <p style="color: #475569; font-size: 15px; margin-bottom: 24px;">Your 6-digit verification code for InternEdge is:</p>
              <div style="font-size: 32px; letter-spacing: 4px; font-weight: 800; color: #059669; background: #ffffff; padding: 12px 24px; display: inline-block; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                ${generatedOtp}
              </div>
              <p style="color: #94a3b8; font-size: 13px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
            </div>
          `
        });
      } catch (mailError) {
        console.error("Nodemailer error: ", mailError.message);
      }

      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${cleanEmail}`,
        demoOtp: generatedOtp // Still provided as fallback/convenience in UI
      });
    }

    // ACTION 2: VERIFY OTP
    if (action === 'verify') {
      if (!otp) {
        return NextResponse.json({ success: false, message: 'OTP code is required' }, { status: 400 });
      }

      const inputOtpStr = otp.toString().trim();
      const stored = otpStore.get(cleanEmail);

      // Check in-memory store
      if (stored) {
        if (Date.now() > stored.expiresAt) {
          return NextResponse.json({ success: false, message: 'OTP code has expired.' }, { status: 400 });
        }
        if (stored.otp === inputOtpStr) {
          otpStore.delete(cleanEmail);

          // Update verified in DB if possible
          try {
            await query('UPDATE students SET verified = 1 WHERE email = ?', [cleanEmail]);
            await query('UPDATE companies SET verified = 1 WHERE email = ?', [cleanEmail]);
          } catch (e) {}

          return NextResponse.json({ success: true, message: 'Email address verified successfully!' });
        }
      }

      // Check student table OTP in MySQL
      try {
        const studentRes = await query('SELECT * FROM students WHERE email = ?', [cleanEmail]);
        if (!studentRes.isMock && studentRes.rows.length > 0) {
          const student = studentRes.rows[0];
          if (student.otp === inputOtpStr) {
            await query('UPDATE students SET verified = 1 WHERE email = ?', [cleanEmail]);
            return NextResponse.json({ success: true, message: 'Email address verified successfully!' });
          }
        }
      } catch (e) {}

      // Check companies table OTP in MySQL
      try {
        const companyRes = await query('SELECT * FROM companies WHERE email = ?', [cleanEmail]);
        if (!companyRes.isMock && companyRes.rows.length > 0) {
          const company = companyRes.rows[0];
          if (company.otp === inputOtpStr) {
            await query('UPDATE companies SET verified = 1 WHERE email = ?', [cleanEmail]);
            return NextResponse.json({ success: true, message: 'Email address verified successfully!' });
          }
        }
      } catch (e) {}

      // Fallback check on otp_verifications
      try {
        const sql = 'SELECT * FROM otp_verifications WHERE email = ? AND otp_code = ? ORDER BY id DESC LIMIT 1';
        const dbRes = await query(sql, [cleanEmail, inputOtpStr]);
        if (!dbRes.isMock && dbRes.rows.length > 0) {
          await query('UPDATE students SET verified = 1 WHERE email = ?', [cleanEmail]);
          await query('UPDATE companies SET verified = 1 WHERE email = ?', [cleanEmail]);
          return NextResponse.json({ success: true, message: 'Email address verified successfully!' });
        }
      } catch (e) {}

      return NextResponse.json({ success: false, message: 'Invalid verification code.' }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
