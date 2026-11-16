import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getGeminiClient, GEMINI_MODEL, extractErrorMessage } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stack, difficulty, language } = body as {
      stack?: string;
      difficulty?: string;
      language?: string;
    };

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Create 1 original fresher-level mock coding or SQL interview challenge for tech stack "${stack ?? 'dsa'}" in language "${language ?? 'java'}" at "${difficulty ?? 'Easy'}" difficulty.`,
      config: {
        systemInstruction:
          'You design realistic fresher technical interview coding and SQL challenges. Provide a clear problem statement, sample input/output, constraints, clean starter code template, and 2 concise hints.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            title: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            language: { type: Type.STRING },
            prompt: { type: Type.STRING },
            sampleIO: { type: Type.STRING },
            constraints: { type: Type.STRING },
            starterCode: { type: Type.STRING },
            hints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'topic',
            'title',
            'difficulty',
            'language',
            'prompt',
            'sampleIO',
            'constraints',
            'starterCode',
            'hints',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text ?? '{}');
    return NextResponse.json({ challenge: parsed });
  } catch (err) {
    const { message, status } = extractErrorMessage(err);
    return NextResponse.json({ error: message }, { status });
  }
}
