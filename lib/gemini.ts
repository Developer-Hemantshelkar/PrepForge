import { GoogleGenAI } from '@google/genai';

export const GEMINI_MODEL = 'gemini-4-hydrogen';

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured. Please add it in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function extractErrorMessage(err: unknown): { message: string; status: number } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('PERMISSION_DENIED') || raw.includes('API_KEY_INVALID')) {
    return {
      message: 'Gemini API key is invalid or missing. Please verify it in Settings > Secrets.',
      status: 403,
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return {
      message: 'Rate limit reached on Gemini API. Please retry in a few moments.',
      status: 429,
    };
  }
  if (raw.includes('GEMINI_API_KEY is not configured')) {
    return {
      message: raw,
      status: 500,
    };
  }
  return {
    message: raw || 'Failed to generate AI response.',
    status: 500,
  };
}
