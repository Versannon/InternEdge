import mysql from 'mysql2/promise';

// In-memory fallback mock database in case XAMPP is not running yet
const mockDb = {
  users: [
    { id: 1, email: 'demo.student@internedge.edu', password_hash: 'password123', role: 'student' },
    { id: 2, email: 'hr@techcorp.com', password_hash: 'password123', role: 'company' },
    { id: 3, email: 'recruitment@innovate.io', password_hash: 'password123', role: 'company' }
  ],
  students: [
    {
      id: 1,
      user_id: 1,
      name: 'Aarav Sharma',
      phone: '+91 9876543210',
      gender: 'Male',
      college: 'Indian Institute of Technology, Delhi',
      course: 'B.Tech',
      sem_year: 'Semester 6 (Year 3)',
      branch: 'Computer Science & Engineering',
      grad_year: 2025,
      cgpa: 8.85,
      skills: ['React', 'Node.js', 'JavaScript', 'Python', 'SQL'],
      experience: 'Intermediate',
      portfolio_url: 'https://aaravsharma.dev',
      linkedin_url: 'https://linkedin.com/in/aaravsharma',
      github_url: 'https://github.com/aaravsharma',
      profile_pic: null,
      resume_path: 'resume_aarav.pdf'
    }
  ],
  companies: [
    {
      id: 1,
      user_id: 2,
      company_name: 'TechCorp Global Solutions',
      industry: 'Software & IT Services',
      phone: '+91 9988776655',
      website: 'https://techcorpglobal.com',
      hr_name: 'Sarah Jenkins',
      logo: null
    },
    {
      id: 2,
      user_id: 3,
      company_name: 'Innovate AI Labs',
      industry: 'Artificial Intelligence & Data Analytics',
      phone: '+91 9123456789',
      website: 'https://innovate.io',
      hr_name: 'Rajesh Verma',
      logo: null
    }
  ],
  jobs: [
    {
      id: 1,
      company_id: 1,
      company_name: 'TechCorp Global Solutions',
      title: 'Frontend Developer Intern (React/Next.js)',
      type: 'Internship',
      location: 'Remote',
      stipend: '₹25,000 / month',
      duration: '6 Months',
      cgpa_required: 7.5,
      skills_required: ['React', 'Next.js', 'CSS3', 'JavaScript', 'Git'],
      deadline: '2026-07-30',
      description: 'We are seeking an enthusiastic Frontend Developer Intern with strong command over React and modern UI dynamics. You will work directly on customer-facing dashboards and design systems.',
      status: 'Active'
    },
    {
      id: 2,
      company_id: 1,
      company_name: 'TechCorp Global Solutions',
      title: 'Full Stack Software Engineer',
      type: 'Full-Time',
      location: 'Bengaluru, India (Hybrid)',
      stipend: '₹12,000,000 / year',
      duration: 'Permanent',
      cgpa_required: 8.0,
      skills_required: ['Node.js', 'Express', 'React', 'MySQL', 'Docker'],
      deadline: '2026-08-15',
      description: 'Full-stack position for graduating seniors. Architect scalable web services and cloud-native applications with high availability.',
      status: 'Active'
    },
    {
      id: 3,
      company_id: 2,
      company_name: 'Innovate AI Labs',
      title: 'AI / ML Engineering Intern',
      type: 'Internship',
      location: 'Hyderabad, India',
      stipend: '₹35,000 / month',
      duration: '3 Months',
      cgpa_required: 8.5,
      skills_required: ['Python', 'PyTorch', 'Data Science', 'SQL', 'Machine Learning'],
      deadline: '2026-07-25',
      description: 'Opportunity to work on state-of-the-art Generative AI and Machine Learning models. Experience with Python LLM fine-tuning is a major bonus.',
      status: 'Active'
    }
  ],
  applications: [
    {
      id: 1,
      job_id: 1,
      student_id: 1,
      status: 'Shortlisted',
      applied_at: new Date().toISOString(),
      recruiter_notes: 'Impressive portfolio projects. Technical screening scheduled.'
    }
  ]
};

let pool = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'internedge_db',
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 2000 // Fast failover to mock if XAMPP isn't running
    });
  }
  return pool;
}

export async function query(sql, params) {
  try {
    const p = getPool();
    const [rows] = await p.execute(sql, params);
    return { rows, isMock: false };
  } catch (error) {
    console.warn("⚠️ XAMPP MySQL database not reachable or configured. Operating in live mock memory mode.", error.message);
    return { rows: null, isMock: true };
  }
}

export function getMockDb() {
  return mockDb;
}
