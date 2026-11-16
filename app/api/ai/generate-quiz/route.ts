import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getGeminiClient, GEMINI_MODEL, extractErrorMessage } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stacks, difficulty, count } = body as {
      stacks?: string[];
      difficulty?: string;
      count?: number;
    };

    const stackList = stacks && stacks.length > 0 ? stacks.join(', ') : 'Core Java, SQL & DBMS, DSA, Spring Boot, Frontend';
    const questionCount = Math.min(Math.max(Number(count) || 5, 3), 8);

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Generate ${questionCount} fresher software engineering interview multiple-choice questions specifically targeting: ${stackList}. Difficulty level: ${difficulty ?? 'Mixed Fresher Interview'}. Focus on realistic interview traps, code snippets, SQL execution/joins, DSA complexity, Spring Boot/React behavior, or project/HR decision-making matching those stacks.`,
      config: {
        systemInstruction:
          'You create crisp, accurate technical interview MCQs for fresher software engineers. Each question must have exactly 4 plausible options, 1 unambiguously correct answer index (0-3), and a concise 1-2 sentence explanation.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stack: { type: Type.STRING, description: 'Matching stack id such as core-java, sql-dbms, dsa, spring-boot, frontend, projects, or hr-behavioral.' },
              topic: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ['stack', 'topic', 'question', 'options', 'correctIndex', 'explanation'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text ?? '[]');
    return NextResponse.json({ questions: parsed });
  } catch (err) {
    const { message, status } = extractErrorMessage(err);
    return NextResponse.json({ error: message }, { status });
  }
}
