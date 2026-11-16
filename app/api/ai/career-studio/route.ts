import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getGeminiClient, GEMINI_MODEL, extractErrorMessage } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode } = body as { mode?: string };
    const ai = getGeminiClient();

    if (mode === 'resume-refine') {
      const { resumeText, targetRole, targetStacks } = body as {
        resumeText?: string;
        targetRole?: string;
        targetStacks?: string[];
      };
      if (!resumeText || resumeText.trim().length < 20) {
        return NextResponse.json(
          { error: 'Please paste your resume bullets or summary first.' },
          { status: 400 }
        );
      }

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Target Role: ${targetRole ?? 'Fresher Software Developer'}\nTarget Stacks: ${(targetStacks ?? []).join(', ') || 'Full-Stack'}\n\nCandidate Resume Text:\n${resumeText.slice(0, 8000)}`,
        config: {
          systemInstruction:
            'You are a technical recruiter and senior engineer reviewing a fresher developer resume. Identify strong signals, missing ATS keywords for the target stack, concrete bullet rewrites using Action + Tech + Outcome, and a prioritized action checklist.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summaryVerdict: { type: Type.STRING },
              strongPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              rewrittenBullets: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING },
                    improved: { type: Type.STRING },
                    whyBetter: { type: Type.STRING },
                  },
                  required: ['original', 'improved', 'whyBetter'],
                },
              },
              actionChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'summaryVerdict',
              'strongPoints',
              'missingKeywords',
              'rewrittenBullets',
              'actionChecklist',
            ],
          },
        },
      });

      return NextResponse.json(JSON.parse(response.text ?? '{}'));
    }

    if (mode === 'cover-letter') {
      const { companyName, targetRole, background, keyProjects, tone } = body as {
        companyName?: string;
        targetRole?: string;
        background?: string;
        keyProjects?: string;
        tone?: string;
      };
      if (!targetRole || !keyProjects) {
        return NextResponse.json(
          { error: 'Please provide both Target Role and at least one Key Project or Skill summary.' },
          { status: 400 }
        );
      }

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          `Company: ${companyName || 'the engineering team'}`,
          `Target Role: ${targetRole}`,
          `Tone: ${tone || 'Confident and concise'}`,
          `Candidate Background: ${background || 'Fresh computer science graduate'}`,
          `Key Projects & Stack: ${keyProjects}`,
        ].join('\n'),
        config: {
          systemInstruction:
            'Draft a crisp, zero-fluff fresher software developer cover letter (220-280 words). Highlight concrete engineering projects, tech stack alignment, and eagerness to contribute.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subjectLine: { type: Type.STRING },
              coverLetter: { type: Type.STRING },
            },
            required: ['subjectLine', 'coverLetter'],
          },
        },
      });

      return NextResponse.json(JSON.parse(response.text ?? '{}'));
    }

    if (mode === 'mock-interview') {
      const { stack, targetRole, history, candidateMessage } = body as {
        stack?: string;
        targetRole?: string;
        history?: { role: 'interviewer' | 'candidate'; text: string }[];
        candidateMessage?: string;
      };

      const transcript = (history ?? [])
        .slice(-8)
        .map((m) => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.text}`)
        .join('\n');

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          `Target Role: ${targetRole ?? 'Fresher Software Developer'}`,
          `Focus Stack: ${stack ?? 'Core Java, SQL, Spring Boot & Projects'}`,
          `Conversation So Far:\n${transcript || '(Start of interview)'}`,
          `Latest Candidate Input: ${candidateMessage || 'Ready to start the mock interview.'}`,
        ].join('\n\n'),
        config: {
          systemInstruction:
            'You are a realistic, supportive technical interviewer running a mock interview for a fresher software developer. Give brief constructive feedback on their previous answer (if this is not the first turn), then ask ONE focused technical, project-defense, or behavioral interview question at a time.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quickFeedback: {
                type: Type.STRING,
                description: 'Brief constructive critique of the candidate’s previous answer, or welcoming opener on turn 1.',
              },
              nextQuestion: {
                type: Type.STRING,
                description: 'The single next interview question for the candidate.',
              },
              hintIfStuck: {
                type: Type.STRING,
                description: 'A short 1-sentence hint the candidate can peek at if stuck.',
              },
            },
            required: ['quickFeedback', 'nextQuestion', 'hintIfStuck'],
          },
        },
      });

      return NextResponse.json(JSON.parse(response.text ?? '{}'));
    }

    return NextResponse.json({ error: 'Unsupported career studio mode.' }, { status: 400 });
  } catch (err) {
    const { message, status } = extractErrorMessage(err);
    return NextResponse.json({ error: message }, { status });
  }
}
