import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getGeminiClient, GEMINI_MODEL, extractErrorMessage } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, prompt, language, stack, code } = body as {
      title?: string;
      prompt?: string;
      language?: string;
      stack?: string;
      code?: string;
    };

    if (!code || code.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please write a solution before requesting AI evaluation.' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        `Challenge Title: ${title ?? 'Coding Challenge'}`,
        `Tech Stack: ${stack ?? 'Software Engineering'}`,
        `Language: ${language ?? 'java'}`,
        `Problem Prompt:\n${prompt ?? ''}`,
        `Candidate Submission:\n\`\`\`${language ?? ''}\n${code.slice(0, 8000)}\n\`\`\``,
      ].join('\n\n'),
      config: {
        systemInstruction:
          'You are a senior software engineering interviewer evaluating a fresher candidate submission. Grade strictly but constructively. Check correctness, edge cases, time/space complexity, idiomatic Java/SQL/Spring/React practices, and provide a clean improved solution.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: 'Score from 0 to 100.' },
            verdict: {
              type: Type.STRING,
              description: 'Short verdict: Strong Solution, Needs Minor Fixes, or Needs Rework.',
            },
            timeComplexity: { type: Type.STRING, description: 'Estimated time complexity e.g. O(n).' },
            spaceComplexity: { type: Type.STRING, description: 'Estimated space complexity e.g. O(n).' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-3 specific strengths in the candidate code.',
            },
            edgeCasesMissed: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Edge cases, syntax bugs, or SQL/API pitfalls missed.',
            },
            codeQualityNotes: {
              type: Type.STRING,
              description: 'Concise feedback on readability, naming, and interview readiness.',
            },
            improvedSolution: {
              type: Type.STRING,
              description: 'Clean, idiomatic reference solution without markdown backticks.',
            },
            nextStep: {
              type: Type.STRING,
              description: 'One concrete recommendation for what to practice next.',
            },
          },
          required: [
            'score',
            'verdict',
            'timeComplexity',
            'spaceComplexity',
            'strengths',
            'edgeCasesMissed',
            'codeQualityNotes',
            'improvedSolution',
            'nextStep',
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
