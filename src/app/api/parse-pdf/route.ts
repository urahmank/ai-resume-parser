import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to base64 for Gemini
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type;

    // Call Gemini API with the PDF file
    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const prompt = `Extract structured JSON data from this PDF resume. 

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

    let response, data, aiResponse;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: 'You are a helpful assistant that extracts structured data from resumes. Always respond with valid JSON only.' },
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
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
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
      data = await response.json();
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (e) {
      console.error('Error calling Gemini API:', e);
      return NextResponse.json({ error: 'Failed to call Gemini API', details: String(e) }, { status: 500 });
    }

    if (!aiResponse) {
      return NextResponse.json({ error: 'No response from Gemini' }, { status: 500 });
    }

    // Try to parse the JSON response
    let parsedData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      return NextResponse.json({ error: 'Failed to parse AI response', details: aiResponse }, { status: 500 });
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
    console.error('Error parsing PDF resume:', error);
    return NextResponse.json({ error: 'Failed to parse PDF resume', details: String(error) }, { status: 500 });
  }
} 