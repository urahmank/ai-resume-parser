# AI-Powered Resume Parser

A Next.js application that uses Google's Gemini AI to parse resumes and extract structured information including personal details, skills, education, and work experience.

Live link here: https://ai-resume-parser-pi.vercel.app/

## Features

- 📄 Upload PDF or text resumes
- 🤖 AI-powered parsing using Google Gemini
- ✏️ Editable parsed results
- 📋 Copy parsed data as JSON
- 💾 Download parsed data as JSON file
- 🎨 Modern, responsive UI

## Getting Started

### Prerequisites

1. Node.js (version 18 or higher)
2. A Google Gemini API key

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd resume-parser
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Gemini API key:
```bash
NEXT_PUBLIC_GEMINI_KEY=your_gemini_api_key_here
```

To get a Gemini API key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and paste it in your `.env.local` file

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How to Use

1. **Upload Resume**: Click the upload area and select a PDF or text file containing your resume
2. **Wait for Processing**: The app will extract text from your resume and send it to Gemini AI for parsing
3. **Review Results**: View the parsed information in editable form fields
4. **Edit if Needed**: Make any corrections to the parsed data
5. **Export Data**: Use the "Copy JSON" or "Download JSON" buttons to save your parsed resume data

## Supported File Types

- PDF files (.pdf)
- Text files (.txt)

## Extracted Information

The AI parser extracts the following information from resumes:

- **Personal Information**: Full name, email address, phone number
- **Skills**: List of technical and soft skills
- **Education**: Degree, school/university, graduation year
- **Experience**: Job title, company name, duration

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Google Gemini AI** - Resume parsing
- **PDF.js** - PDF text extraction
- **Lucide React** - Icons

## API Endpoints

- `POST /api/parse` - Parses resume text using Gemini AI

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Remember to add your Gemini API key as an environment variable in your Vercel deployment settings.
