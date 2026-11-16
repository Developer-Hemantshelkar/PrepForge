import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getGeminiClient, GEMINI_MODEL, extractErrorMessage } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, topic, answer, targetRole } = body as {
      question?: string;
      topic?: string;
      answer?: string;
      targetRole?: string;
    };

    if (!answer || answer.trim().length < 15) {
      return NextResponse.json(
        { error: 'Please write at least a couple of sentences so the AI coach can review your answer.' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        `Target Role: ${targetRole ?? 'Software Engineer Fresher'}`,
        `Topic: ${topic ?? 'Behavioral & HR'}`,
        `Interview Question: ${question ?? ''}`,
        `Candidate Answer:\n${answer.slice(0, 6000)}`,
      ].join('\n\n'),
      config: {
        systemInstruction:
          'You are an experienced technical hiring manager coaching a fresher software developer for HR and behavioral interviews. Evaluate clarity, ownership, STAR structure, and red flags. Rewrite a concise, interview-ready 3-4 sentence polished version preserving the candidate’s real story.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clarityScore: { type: Type.INTEGER, description: 'Score from 0 to 100.' },
            starBreakdown: {
              type: Type.OBJECT,
              properties: {
                situation: { type: Type.STRING },
                task: { type: Type.STRING },
                action: { type: Type.STRING },
                result: { type: Type.STRING },
              },
              required: ['situation', 'task', 'action', 'result'],
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            redFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            polishedAnswer: {
              type: Type.STRING,
              description: 'Interview-ready polished version of the candidate response.',
            },
            followUpQuestion: {
              type: Type.STRING,
              description: 'Likely follow-up question an interviewer would ask next.',
            },
          },
          required: [
            'clarityScore',
            'starBreakdown',
            'strengths',
            'redFlags',
            'polishedAnswer',
            'followUpQuestion',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text ?? '{}');
    return NextResponse.json(parsed);
  } catch (err) {
    const { message, status } = extractErrorMessage(err);
    return NextResponse.json({ error: message }, { status });
  }
}
