import { NextResponse } from 'next/server';
import { query, getMockDb } from '../../../lib/db';

export async function GET(request) {
  try {
    const mockDb = getMockDb();
    
    // Fetch from MySQL (Only from Approved companies)
    const dbRes = await query(`
      SELECT jobs.* 
      FROM jobs 
      JOIN companies ON jobs.company_id = companies.id 
      WHERE companies.status = 'Approved' 
      ORDER BY jobs.id DESC
    `);
    let jobsList = [];
    
    if (!dbRes.isMock && dbRes.rows) {
      jobsList = dbRes.rows.map(j => {
        let skills = [];
        try {
          skills = Array.isArray(j.skills_required) ? j.skills_required : JSON.parse(j.skills_required || '[]');
        } catch(e) {
          skills = j.skills_required ? j.skills_required.split(',') : [];
        }
        return {
          ...j,
          skills_required: skills
        };
      });
    } else {
      jobsList = mockDb.jobs;
    }

    return NextResponse.json({
      success: true,
      jobs: jobsList
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { company_id, company_name, title, type, location, stipend, duration, cgpa_required, skills_required, deadline, description } = body;

    const mockDb = getMockDb();
    const skillsArray = Array.isArray(skills_required) ? skills_required : skills_required.split(',').map(s => s.trim());
    
    const newJob = {
      id: mockDb.jobs.length + 1,
      company_id: Number(company_id) || 1,
      company_name: company_name || 'TechCorp Global Solutions',
      title,
      type: type || 'Internship',
      location,
      stipend,
      duration,
      cgpa_required: parseFloat(cgpa_required) || 0,
      skills_required: skillsArray,
      deadline,
      description,
      status: 'Active'
    };

    // Insert in MySQL
    try {
      const skillsStr = JSON.stringify(skillsArray);
      const sql = `
        INSERT INTO jobs 
        (company_id, company_name, title, type, location, stipend, duration, cgpa_required, skills_required, deadline, description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
      `;
      const params = [
        Number(company_id) || 1,
        company_name || 'TechCorp Global Solutions',
        title,
        type || 'Internship',
        location,
        stipend,
        duration,
        parseFloat(cgpa_required) || 0,
        skillsStr,
        deadline,
        description
      ];
      await query(sql, params);
    } catch (dbErr) {
      console.error("MySQL Job insert error:", dbErr.message);
    }

    mockDb.jobs.unshift(newJob);

    return NextResponse.json({
      success: true,
      message: 'Job position posted successfully!',
      job: newJob
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
