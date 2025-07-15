import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `Extract structured JSON data from this resume: ${resumeText}

Please return a JSON object with the following structure:
{
  "name": "Full Name",
  "email": "email@example.com", 
  "phone": "phone number",
  "skills": ["skill1", "skill2", "skill3"],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name", 
      "year": "Graduation Year"
    }
  ],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Duration (e.g., 2 years, 2020-2022)"
    }
  ]
}

Extract the most relevant information. If any field is not found, use an empty string for strings or empty array for arrays. Return only valid JSON without any additional text.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'You are a helpful assistant that extracts structured data from resumes. Always respond with valid JSON only.'
              },
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('No response from Gemini');
    }

    // Try to parse the JSON response
    let parsedData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Failed to parse AI response');
    }

    // Ensure all required fields exist
    const result = {
      name: parsedData.name || '',
      email: parsedData.email || '',
      phone: parsedData.phone || '',
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      education: Array.isArray(parsedData.education) ? parsedData.education : [],
      experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error parsing resume:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume' },
      { status: 500 }
    );
  }
} 