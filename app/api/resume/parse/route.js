import { NextResponse } from 'next/server';
const pdfModule = require('pdf-parse');

const AVAILABLE_SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'PHP', 'MySQL',
  'TypeScript', 'Next.js', 'Express', 'MongoDB', 'PostgreSQL', 'Tailwind CSS',
  'UI/UX Design', 'Figma', 'Docker', 'AWS', 'Git', 'Flutter'
];

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: 'No resume file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let parsedText = '';
    try {
      if (pdfModule && pdfModule.PDFParse) {
        // v2 interface support
        const parser = new pdfModule.PDFParse({ data: buffer });
        const result = await parser.getText();
        parsedText = result.text || '';
      } else {
        // v1 interface support
        const pdfParser = (typeof pdfModule === 'function') ? pdfModule : (pdfModule.default || pdfModule);
        const data = await pdfParser(buffer);
        parsedText = data.text || '';
      }
    } catch (parseErr) {
      console.error('pdf-parse error:', parseErr.message);
      return NextResponse.json({ success: false, message: 'Failed to read PDF resume content' }, { status: 500 });
    }

    // Match skills against AVAILABLE_SKILLS (case insensitive and smart boundary check)
    const matchedSkills = AVAILABLE_SKILLS.filter(skill => {
      // Escape special characters (e.g. C++, .NET)
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // For skill names containing special characters like C++, avoid strict word boundary \b at the end
      const pattern = skill.includes('+') || skill.includes('.') 
        ? `\\b${escaped}` 
        : `\\b${escaped}\\b`;
      const regex = new RegExp(pattern, 'i');
      return regex.test(parsedText);
    });

    // Check for email, phone, college patterns (basic Regex extraction)
    const emailMatch = parsedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = parsedText.match(/(\+?\d{1,3}[- ]?)?\d{10}/);

    return NextResponse.json({
      success: true,
      skills: matchedSkills,
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
