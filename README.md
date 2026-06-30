# InternEdge
InternEdge is a comprehensive internship management platform designed to connect students with internship opportunities and streamline the hiring process for companies. The platform facilitates discovering, applying for, and tracking internships, as well as managing company profiles and hiring pipelines.

## Features

### For Students
- **Dashboard**: View personalized statistics, job matches, and recent applications.
- **Job Discovery**: Browse and search for internship opportunities.
- **Application Management**: Apply for internships, view application status, and manage submissions.
- **Interview Scheduling**: View upcoming interviews and manage schedules.
- **Profile Management**: Upload and parse resumes to create a professional profile.

### For Companies
- **Dashboard**: View company statistics and manage hiring pipelines.
- **Profile Management**: Create and update company profiles with required documents.
- **Job Management**: Post internship opportunities and manage listings.
- **Application Tracking**: Review student applications and manage candidates.
- **Interview Management**: Schedule and manage interviews with applicants.
- **Communication**: Chat with students regarding applications and interviews.

### For Admins
- **System Overview**: Monitor overall platform activity.
- **User Management**: Manage student and company accounts.
- **Content Moderation**: Approve company profiles and internship postings.
- **Verification System**: Verify and approve company documents.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL Database

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd InternEdge
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USER=root
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=internedge
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Database Setup
Ensure you have a MySQL database running and update the connection details in the `.env.local` file.

## Usage
- Access the application at `http://localhost:3000`
- Use the following credentials for initial testing:
  - **Admin**: `[EMAIL_ADDRESS]` / `admin123`
  - **Student**: `[EMAIL_ADDRESS]` / `student123`
  - **Company**: `[EMAIL_ADDRESS]` / `company123`

## Project Structure
- `.next/`: Next.js build output
- `app/`: Application pages and API routes
- `components/`: Reusable React components
- `lib/`: Utility functions and helpers
- `public/`: Static assets

## License
ISC