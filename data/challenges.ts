import { StackId } from './stacks';

export interface CodingChallenge {
  id: string;
  stack: StackId;
  topic: string;
  title: string;
  difficulty: 'Easy' | 'Medium';
  language: 'java' | 'sql' | 'javascript';
  prompt: string;
  sampleIO: string;
  constraints: string;
  starterCode: string;
  hints: string[];
}

export interface BehavioralPrompt {
  id: string;
  topic: string;
  question: string;
  focusAreas: string[];
  starTip: string;
  sampleShortAnswer: string;
}

export interface InterviewRoundGuide {
  round: string;
  title: string;
  focus: string;
  whatInterviewersCheck: string[];
  checklist: string[];
}

export const CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: 'code-two-sum',
    stack: 'dsa',
    topic: 'Arrays & Hashing',
    title: 'Two Sum Indices in O(n)',
    difficulty: 'Easy',
    language: 'java',
    prompt:
      'Given an integer array nums and an integer target, return the 0-based indices of the two numbers such that they add up to target. Assume exactly one valid pair exists and you cannot use the same element twice.',
    sampleIO: 'Input: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]',
    constraints: '2 <= nums.length <= 10^4. Aim for O(n) time and O(n) space.',
    starterCode: `import java.util.*;

public class Solution {
  public static int[] twoSum(int[] nums, int target) {
    // Write your O(n) solution using a HashMap
    return new int[]{};
  }
}`,
    hints: [
      'For each element x, compute complement = target - x.',
      'Check if complement is already in your HashMap BEFORE inserting the current element.',
    ],
  },
  {
    id: 'code-valid-parentheses',
    stack: 'dsa',
    topic: 'Stack',
    title: 'Balanced Brackets Validator',
    difficulty: 'Easy',
    language: 'java',
    prompt:
      'Given a string s containing only "(", ")", "{", "}", "[", "]", determine if the input string has valid, properly nested brackets.',
    sampleIO: 'Input: s = "({[]})"\nOutput: true\n\nInput: s = "([)]"\nOutput: false',
    constraints: '1 <= s.length <= 10^4. Use O(n) time.',
    starterCode: `import java.util.*;

public class Solution {
  public static boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    // Complete the stack validation
    return false;
  }
}`,
    hints: [
      'Push the expected closing bracket onto the stack when you see an opening bracket.',
      'Remember to check stack.isEmpty() both before popping and at the very end.',
    ],
  },
  {
    id: 'code-reverse-linkedlist',
    stack: 'dsa',
    topic: 'LinkedList',
    title: 'Reverse a Singly Linked List In-Place',
    difficulty: 'Easy',
    language: 'java',
    prompt:
      'Given the head of a singly linked list, reverse the list in-place and return the new head without allocating new nodes.',
    sampleIO: 'Input: 1 -> 2 -> 3 -> 4 -> null\nOutput: 4 -> 3 -> 2 -> 1 -> null',
    constraints: 'O(n) time and O(1) extra space.',
    starterCode: `class ListNode {
  int val;
  ListNode next;
  ListNode(int val) { this.val = val; }
}

public class Solution {
  public static ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    // Flip pointers iteratively
    return prev;
  }
}`,
    hints: [
      'Save curr.next in a temporary variable before reassigning curr.next = prev.',
      'Advance prev = curr and curr = nextTemp.',
    ],
  },
  {
    id: 'code-java-streams',
    stack: 'core-java',
    topic: 'Java 8+ Streams',
    title: 'Group Employees by Department & Highest Salary',
    difficulty: 'Medium',
    language: 'java',
    prompt:
      'Given a List<Employee> (with fields name, department, salary), write a Java 8+ Stream pipeline that returns a Map<String, Optional<Employee>> mapping each department to its highest-paid employee.',
    sampleIO: 'Input: [(Alice, Eng, 90k), (Bob, Eng, 110k), (Sara, HR, 75k)]\nOutput: {Eng -> Bob, HR -> Sara}',
    constraints: 'Handle empty lists gracefully using Collectors.groupingBy and Collectors.maxBy.',
    starterCode: `import java.util.*;
import java.util.stream.*;

record Employee(String name, String department, double salary) {}

public class Solution {
  public static Map<String, Optional<Employee>> topEarnerByDept(List<Employee> employees) {
    // Use Collectors.groupingBy + Collectors.maxBy
    return Map.of();
  }
}`,
    hints: [
      'Use Collectors.groupingBy(Employee::department, Collectors.maxBy(Comparator.comparingDouble(Employee::salary))).',
    ],
  },
  {
    id: 'code-sql-top2-dept',
    stack: 'sql-dbms',
    topic: 'Window Functions & Joins',
    title: 'Top 2 Highest-Paid Employees per Department',
    difficulty: 'Medium',
    language: 'sql',
    prompt:
      'Given tables employees(id, name, department_id, salary) and departments(id, dept_name), write an SQL query returning dept_name, employee name, and salary for the top 2 highest-paid salaries in each department (include ties properly).',
    sampleIO: 'Output columns: dept_name | name | salary\nOrdered by dept_name ASC, salary DESC',
    constraints: 'Use a CTE and DENSE_RANK() OVER (PARTITION BY ...).',
    starterCode: `-- Write your SQL query below
WITH ranked_salaries AS (
  -- Compute DENSE_RANK per department
)
SELECT dept_name, name, salary
FROM ranked_salaries
WHERE rnk <= 2;`,
    hints: [
      'JOIN employees e with departments d ON e.department_id = d.id.',
      'Use DENSE_RANK() OVER (PARTITION BY d.id ORDER BY e.salary DESC) so ties do not skip rank 2.',
    ],
  },
  {
    id: 'code-spring-rest-endpoint',
    stack: 'spring-boot',
    topic: 'REST APIs & Validation',
    title: 'Create Validated REST Endpoint for Task Creation',
    difficulty: 'Easy',
    language: 'java',
    prompt:
      'Write a Spring Boot @RestController method POST /api/tasks that accepts a validated CreateTaskRequest DTO (@NotBlank title, @NotNull priority), delegates to taskService.create(req, principal.getName()), and returns HTTP 201 Created with Location header or DTO response.',
    sampleIO: 'POST /api/tasks { "title": "Review SQL joins", "priority": "HIGH" } -> 201 Created',
    constraints: 'Use @Valid, ResponseEntity, and constructor injection.',
    starterCode: `@RestController
@RequestMapping("/api/tasks")
public class TaskController {
  private final TaskService taskService;

  public TaskController(TaskService taskService) {
    this.taskService = taskService;
  }

  // Implement @PostMapping createTask(...)
}`,
    hints: [
      'Annotate the request body parameter with @Valid @RequestBody CreateTaskRequest req.',
      'Return ResponseEntity.status(HttpStatus.CREATED).body(createdDto).',
    ],
  },
  {
    id: 'code-js-debounce',
    stack: 'frontend',
    topic: 'JavaScript & React',
    title: 'Implement a Debounce Utility & Explain React Cleanup',
    difficulty: 'Medium',
    language: 'javascript',
    prompt:
      'Implement a debounce(fn, delayMs) function in JavaScript that delays invoking fn until delayMs milliseconds have elapsed since the last call, preserving arguments and this context. Also include a cancel() method or explain cleanup in React.',
    sampleIO: 'const search = debounce((q) => fetchResults(q), 300);\nsearch("j"); search("ja"); search("java"); // fires once for "java"',
    constraints: 'Use closures and clearTimeout properly.',
    starterCode: `function debounce(fn, delayMs) {
  let timerId = null;
  // Return debounced function preserving args and this
}`,
    hints: [
      'Call clearTimeout(timerId) whenever the wrapper function is invoked.',
      'Use fn.apply(this, args) inside setTimeout.',
    ],
  },
];

export const BEHAVIORAL_PROMPTS: BehavioralPrompt[] = [
  {
    id: 'beh-strengths',
    topic: 'Strengths',
    question: 'What are your greatest strengths as a fresher software developer, and how have you demonstrated them?',
    focusAreas: ['One technical habit + one collaboration trait', 'Concrete project example', 'Impact on team or code quality'],
    starTip: 'Avoid listing empty adjectives. Pair each strength with a 1-sentence example from a real project.',
    sampleShortAnswer:
      'My strongest traits are systematic debugging and quick technical adaptability. During my final-year project, our dashboard load time spiked to 3 seconds; I profiled the Hibernate queries, identified an N+1 issue, added a JOIN FETCH query with proper indexing, and reduced load time under 150ms while documenting the pattern for my teammates.',
  },
  {
    id: 'beh-weakness',
    topic: 'Weaknesses',
    question: 'What is your biggest weakness, and what concrete steps are you taking to improve it?',
    focusAreas: ['Genuine non-fatal weakness', 'No humblebrags', 'Actionable mitigation habit'],
    starTip: 'Spend 30% naming the weakness and 70% explaining the system or habit you built to overcome it.',
    sampleShortAnswer:
      'Early in college projects, I sometimes spent too much time polishing backend logic before testing integration with the frontend. To fix this, I started writing small API contract examples and Postman/curl checks right after building each endpoint, which helped our team catch payload mismatches days earlier.',
  },
  {
    id: 'beh-education-gap',
    topic: 'Education Gap',
    question: 'I noticed a gap on your resume after graduation. How did you spend that time and why are you ready now?',
    focusAreas: ['Calm transparency', 'Self-directed upskilling', 'Recent hands-on output'],
    starTip: 'Own the timeline in 2 clear sentences, then shift focus immediately to the code, projects, and fundamentals you built.',
    sampleShortAnswer:
      'After graduating, I took six months to focus on family responsibilities and prepare thoroughly for software engineering fundamentals. Over the past four months, I followed a structured daily schedule mastering Core Java, SQL, and Spring Boot, and built and deployed two full-stack projects on GitHub to prove my readiness for production work.',
  },
  {
    id: 'beh-career-goals',
    topic: 'Career Goals',
    question: 'Where do you see yourself in the next 3 to 5 years, and why this role?',
    focusAreas: ['First-year learning focus', '3-year ownership growth', 'Alignment with company stack'],
    starTip: 'Show hunger to learn production standards first, then grow into mentoring and architecture.',
    sampleShortAnswer:
      'In my first year, my priority is mastering your codebase, writing well-tested backend and frontend features, and learning from senior code reviews. Over three to five years, I aim to grow into a reliable full-stack engineer who owns end-to-end features, improves system reliability, and mentors incoming freshers.',
  },
  {
    id: 'beh-teamwork',
    topic: 'Teamwork & Conflict',
    question: 'Tell me about a time you disagreed with a teammate on a technical decision. How did you resolve it?',
    focusAreas: ['Objective trade-offs', 'Listening & respect', 'Shared team outcome'],
    starTip: 'Never blame the teammate. Highlight how criteria and data guided the compromise.',
    sampleShortAnswer:
      'During our capstone project, a teammate preferred NoSQL while I felt PostgreSQL fit better because we had strict relational orders and reporting joins. Instead of debating opinions, I wrote down the three core queries we needed and benchmarked schema consistency. We agreed on PostgreSQL for transactional data and kept flexible preferences in a JSON column, shipping cleanly on deadline.',
  },
  {
    id: 'beh-situation-deadline',
    topic: 'Situations & Ownership',
    question: 'Describe a stressful deadline or unexpected bug right before a demo. How did you handle it?',
    focusAreas: ['Situation & Task (25%)', 'Your specific Action (55%)', 'Measurable Result (20%)'],
    starTip: 'Emphasize calm triage, early communication, and verifying the fix.',
    sampleShortAnswer:
      'Two days before our project evaluation, user login broke in production due to a CORS and JWT header mismatch (Situation). I needed to restore authentication without delaying final testing (Task). I reproduced the issue in Chrome DevTools Network tab, saw the OPTIONS preflight lacked the Authorization header allowance, updated the Spring Security CORS config, and added an end-to-end smoke test (Action). Authentication worked reliably during the demo and our team scored full marks on implementation (Result).',
  },
];

export const INTERVIEW_PLAYBOOK: InterviewRoundGuide[] = [
  {
    round: 'Round 01',
    title: 'Online Assessment (OA) & Core Screening',
    focus: '2–3 Easy/Medium DSA problems + SQL queries + Core Java/JS MCQs',
    whatInterviewersCheck: [
      'Edge-case handling (empty arrays, negative numbers, single elements, NULLs in SQL)',
      'Clean time/space complexity avoiding O(n^2) timeouts',
      'Accurate reading of Java/JS output snippets (String pool, Event loop)',
    ],
    checklist: [
      'Solve 2 array/string + 1 stack/linkedlist problem daily under 25 minutes each',
      'Practice 10 SQL JOIN + GROUP BY + DENSE_RANK queries without IDE autocomplete',
    ],
  },
  {
    round: 'Round 02',
    title: 'Technical Interview 1 — Fundamentals & Live Coding',
    focus: 'Core Java / Frontend + DSA live coding + SQL & DBMS',
    whatInterviewersCheck: [
      'Ability to explain concepts concisely in 30–45 seconds before diving into details',
      'Thinking out loud while coding: clarifying inputs, brute force -> optimal approach, dry run',
      'Understanding why HashMap, Indexes, Normalization, or React Hooks work under the hood',
    ],
    checklist: [
      'Memorize interview-ready short answers for all 7 core topics in Study Hub',
      'Always dry-run your code line by line with a small sample input before saying "done"',
    ],
  },
  {
    round: 'Round 03',
    title: 'Technical Interview 2 — Project Deep Dive & Practical Engineering',
    focus: 'Your Resume Projects, Architecture, DB Schema, APIs, Bugs & Deployment',
    whatInterviewersCheck: [
      'Genuine ownership: can you draw your request flow and explain every table and API?',
      'Trade-offs: why SQL vs NoSQL, why JWT vs Sessions, how you handled errors and security',
      'Real debugging stories: how you diagnosed and verified a hard bug',
    ],
    checklist: [
      'Prepare a crisp 2-minute walkthrough for each resume project (Problem -> Stack -> Architecture -> Hardest Bug)',
      'Be ready to write an API endpoint or SQL query from your project on a whiteboard',
    ],
  },
  {
    round: 'Round 04',
    title: 'Managerial & HR Behavioral Round',
    focus: 'Culture fit, Coachability, Teamwork, Education Gaps & Career Alignment',
    whatInterviewersCheck: [
      'Structured STAR communication without rambling',
      'Honesty + positive ownership around weaknesses or education gaps',
      'Genuine curiosity about the role, product, and engineering growth',
    ],
    checklist: [
      'Keep 3 versatile STAR stories ready covering teamwork, a tough bug/deadline, and taking initiative',
      'Prepare 2 thoughtful questions to ask the interviewer at the end (onboarding, team workflow, tech roadmap)',
    ],
  },
];
