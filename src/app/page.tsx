'use client';

import { useState } from 'react';
import { Upload, FileText, User, Mail, Phone, Briefcase, GraduationCap, Copy, Download } from 'lucide-react';

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
  }>;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setParsedResume(null);

    try {
      if (file.type === 'application/pdf') {
        // Handle PDF files by sending to server
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to parse PDF');
        }

        const data = await response.json();
        setParsedResume(data);
      } else if (file.type === 'text/plain') {
        // Handle text files
        const text = await file.text();
        
        const response = await fetch('/api/parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resumeText: text }),
        });

        if (!response.ok) {
          throw new Error('Failed to parse resume');
        }

        const data = await response.json();
        setParsedResume(data);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or text file.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!parsedResume) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(parsedResume, null, 2));
      alert('JSON copied to clipboard!');
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  const downloadJSON = () => {
    if (!parsedResume) return;
    
    const blob = new Blob([JSON.stringify(parsedResume, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parsed-resume.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Resume Parser
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload your resume and instantly extract your skills, experience, and more.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-pink-200">
          <div className="text-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading}
              />
              <div className="border-2 border-dashed border-pink-300 rounded-lg p-12 hover:border-pink-400 transition-colors bg-pink-50">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
                    <p className="text-gray-600">Processing your resume...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-pink-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Upload Resume
                    </p>
                    <p className="text-gray-500">
                      Click to upload PDF or text file
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Parsed Results */}
        {parsedResume && (
          <div className="bg-white rounded-lg shadow-lg p-8 border border-pink-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Parsed Resume Summary
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copy JSON
                </button>
                <button
                  onClick={downloadJSON}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download JSON
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-pink-500" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={parsedResume.name}
                      onChange={(e) => setParsedResume({...parsedResume, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Mail className="h-4 w-4 text-pink-500" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={parsedResume.email}
                      onChange={(e) => setParsedResume({...parsedResume, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Phone className="h-4 w-4 text-pink-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={parsedResume.phone}
                      onChange={(e) => setParsedResume({...parsedResume, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-pink-500" />
                  Skills
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma-separated)
                  </label>
                  <textarea
                    rows={8}
                    value={parsedResume.skills.join(', ')}
                    onChange={(e) => setParsedResume({...parsedResume, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-pink-500" />
                Education
              </h3>
              <div className="space-y-3">
                {parsedResume.education.map((edu, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => {
                        const newEducation = [...parsedResume.education];
                        newEducation[index].degree = e.target.value;
                        setParsedResume({...parsedResume, education: newEducation});
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="School"
                      value={edu.school}
                      onChange={(e) => {
                        const newEducation = [...parsedResume.education];
                        newEducation[index].school = e.target.value;
                        setParsedResume({...parsedResume, education: newEducation});
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => {
                        const newEducation = [...parsedResume.education];
                        newEducation[index].year = e.target.value;
                        setParsedResume({...parsedResume, education: newEducation});
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-pink-500" />
                Experience
              </h3>
              <div className="space-y-3">
                {parsedResume.experience.map((exp, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => {
                        const newExperience = [...parsedResume.experience];
                        newExperience[index].title = e.target.value;
                        setParsedResume({...parsedResume, experience: newExperience});
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const newExperience = [...parsedResume.experience];
                        newExperience[index].company = e.target.value;
                        setParsedResume({...parsedResume, experience: newExperience});
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={exp.duration}
                      onChange={(e) => {
                        const newExperience = [...parsedResume.experience];
                        newExperience[index].duration = e.target.value;
                        setParsedResume({...parsedResume, experience: newExperience});
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
