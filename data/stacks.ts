export type StackId =
  | 'core-java'
  | 'sql-dbms'
  | 'dsa'
  | 'spring-boot'
  | 'frontend'
  | 'projects'
  | 'hr-behavioral';

export interface StackDefinition {
  id: StackId;
  label: string;
  shortLabel: string;
  description: string;
  subtopics: string[];
}

export interface StackPreset {
  id: string;
  label: string;
  targetRole: string;
  stacks: StackId[];
}

export const STACKS: StackDefinition[] = [
  {
    id: 'core-java',
    label: 'Core Java',
    shortLabel: 'Core Java',
    description: 'Object-oriented principles, internal collections, JVM memory, concurrency, and modern Java 8+ idioms.',
    subtopics: ['OOP', 'Collections', 'Strings', 'Exceptions', 'Multithreading', 'Java 8+', 'JVM'],
  },
  {
    id: 'sql-dbms',
    label: 'SQL & DBMS',
    shortLabel: 'SQL & DBMS',
    description: 'Query execution, relational joins, subqueries, normalization forms, keys, indexing, and ACID transactions.',
    subtopics: ['Queries', 'Joins', 'Subqueries', 'Normalization', 'Keys', 'Indexes', 'Transactions'],
  },
  {
    id: 'dsa',
    label: 'Data Structures & Algorithms',
    shortLabel: 'DSA',
    description: 'Problem-solving patterns for arrays, strings, linked lists, stacks, queues, sorting, and binary search.',
    subtopics: ['Arrays', 'Strings', 'LinkedList', 'Stack', 'Queue', 'Sorting', 'Searching'],
  },
  {
    id: 'spring-boot',
    label: 'Spring Boot & Backend',
    shortLabel: 'Spring Boot',
    description: 'Dependency injection, Spring Core beans, REST API design, Hibernate/JPA persistence, and Spring Security.',
    subtopics: ['Spring Core', 'Dependency Injection', 'REST APIs', 'Hibernate & JPA', 'Security'],
  },
  {
    id: 'frontend',
    label: 'Frontend Development',
    shortLabel: 'Frontend',
    description: 'Semantic HTML, CSS layout systems, JavaScript runtime internals, React hooks, and API integration.',
    subtopics: ['HTML', 'CSS', 'JavaScript', 'React', 'Components', 'Hooks', 'API Integration'],
  },
  {
    id: 'projects',
    label: 'Projects & Practical Knowledge',
    shortLabel: 'Projects',
    description: 'Defending system architecture, database schema choices, API contracts, debugging, and deployment workflows.',
    subtopics: ['Architecture', 'Database Design', 'APIs', 'Challenges', 'Debugging', 'Deployment'],
  },
  {
    id: 'hr-behavioral',
    label: 'HR & Behavioral Questions',
    shortLabel: 'HR & Behavioral',
    description: 'Structured responses for strengths, weaknesses, career goals, education gaps, teamwork, and situational rounds.',
    subtopics: ['Strengths', 'Weaknesses', 'Career Goals', 'Education Gap', 'Teamwork', 'Situations'],
  },
];

export const STACK_PRESETS: StackPreset[] = [
  {
    id: 'all',
    label: 'All Stacks',
    targetRole: 'Full-Stack Software Engineer (Fresher)',
    stacks: [],
  },
  {
    id: 'java-fullstack',
    label: 'Java Full-Stack',
    targetRole: 'Java Full-Stack Developer (Fresher)',
    stacks: ['core-java', 'sql-dbms', 'spring-boot', 'frontend', 'projects'],
  },
  {
    id: 'java-backend',
    label: 'Backend (Java/Spring)',
    targetRole: 'Java Backend Engineer (Fresher)',
    stacks: ['core-java', 'sql-dbms', 'dsa', 'spring-boot', 'projects'],
  },
  {
    id: 'frontend-react',
    label: 'Frontend (React/JS)',
    targetRole: 'Frontend Developer (Fresher)',
    stacks: ['frontend', 'dsa', 'projects', 'hr-behavioral'],
  },
  {
    id: 'sde-core',
    label: 'SDE Core & Rounds',
    targetRole: 'Software Development Engineer I (Fresher)',
    stacks: ['core-java', 'dsa', 'sql-dbms', 'hr-behavioral'],
  },
];

export function getStackLabel(id: StackId): string {
  return STACKS.find((s) => s.id === id)?.label ?? id;
}

export function getStackShortLabel(id: StackId): string {
  return STACKS.find((s) => s.id === id)?.shortLabel ?? id;
}
