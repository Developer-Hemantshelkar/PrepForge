import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-jakarta',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'PrepForge — Fresher Software Developer Interview Preparation',
  description:
    'Interview preparation workbench for software engineering freshers featuring interview-ready concept short answers, tech-stack filtered quizzes and test modules, AI-evaluated coding & behavioral practice, resume studio, and personal growth tracking.',
  openGraph: {
    title: 'PrepForge — Fresher Software Developer Interview Preparation',
    description:
      'Master Core Java, SQL & DBMS, DSA, Spring Boot, Frontend, Projects, and HR Behavioral interviews with AI feedback and growth analytics.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrepForge — Fresher Software Developer Interview Preparation',
    description:
      'Complete interview readiness workbench for software engineering freshers.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
