import { StackId } from './stacks';

export interface QuizQuestion {
  id: string;
  stack: StackId;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TestModule {
  id: string;
  stack: StackId;
  title: string;
  description: string;
  durationMinutes: number;
  questionIds: string[];
}

export const QUESTION_BANK: QuizQuestion[] = [
  // Core Java
  {
    id: 'q-java-1',
    stack: 'core-java',
    topic: 'Collections',
    question: 'In Java 8+, what happens inside a HashMap bucket when collisions exceed TREEIFY_THRESHOLD (8) and table capacity is at least 64?',
    options: [
      'HashMap throws a ConcurrentModificationException',
      'The bucket converts from a linked list to a balanced Red-Black tree',
      'The oldest entry in the bucket is evicted automatically',
      'HashMap switches to linear probing across adjacent buckets',
    ],
    correctIndex: 1,
    explanation:
      'Java 8 converts a crowded bucket (8+ nodes when capacity >= 64) into a balanced Red-Black tree, reducing worst-case lookup from O(n) to O(log n).',
  },
  {
    id: 'q-java-2',
    stack: 'core-java',
    topic: 'Strings',
    question: 'What is printed by: String a = "java"; String b = new String("java"); System.out.println((a == b) + " " + a.equals(b));',
    options: ['true true', 'false true', 'true false', 'false false'],
    correctIndex: 1,
    explanation:
      'new String("java") allocates a distinct heap object outside the String Pool literal reference, so == is false while .equals() compares characters and returns true.',
  },
  {
    id: 'q-java-3',
    stack: 'core-java',
    topic: 'Multithreading',
    question: 'Which statement accurately describes the volatile keyword in Java?',
    options: [
      'It makes compound operations like count++ atomic across threads',
      'It guarantees memory visibility of reads/writes across threads via happens-before',
      'It acquires an intrinsic object monitor lock just like synchronized',
      'It forces a thread to run on a dedicated CPU core',
    ],
    correctIndex: 1,
    explanation:
      'volatile guarantees visibility and ordering across threads without locking, but does not make read-modify-write operations like count++ atomic.',
  },
  {
    id: 'q-java-4',
    stack: 'core-java',
    topic: 'Java 8+',
    question: 'Which Stream operation is terminal and triggers execution of lazy intermediate operations?',
    options: ['.filter()', '.map()', '.sorted()', '.collect()'],
    correctIndex: 3,
    explanation:
      'Intermediate operations (filter, map, sorted) are lazy; only a terminal operation such as collect(), count(), or forEach() triggers pipeline execution.',
  },
  {
    id: 'q-java-5',
    stack: 'core-java',
    topic: 'Exceptions',
    question: 'Which requirement must a class satisfy to be declared in a Java try-with-resources header?',
    options: [
      'It must extend RuntimeException',
      'It must implement AutoCloseable (or Closeable)',
      'It must be marked final and Serializable',
      'It must override finalize()',
    ],
    correctIndex: 1,
    explanation:
      'try-with-resources automatically invokes close() in reverse declaration order on any resource implementing java.lang.AutoCloseable.',
  },
  {
    id: 'q-java-6',
    stack: 'core-java',
    topic: 'JVM',
    question: 'Where are local primitive variables and method call frames stored at runtime in the JVM?',
    options: [
      'Shared Heap',
      'Metaspace',
      'Thread-private JVM Stack',
      'String Constant Pool',
    ],
    correctIndex: 2,
    explanation:
      'Each thread has its own JVM Stack storing call frames, local primitives, and object references, while actual object instances reside on the shared Heap.',
  },

  // SQL & DBMS
  {
    id: 'q-sql-1',
    stack: 'sql-dbms',
    topic: 'Queries',
    question: 'In standard SQL logical query processing, which clause executes immediately before SELECT?',
    options: ['WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'],
    correctIndex: 2,
    explanation:
      'The logical order is FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT.',
  },
  {
    id: 'q-sql-2',
    stack: 'sql-dbms',
    topic: 'Joins',
    question: 'You LEFT JOIN customers c to orders o, then write WHERE o.status = "PAID". What happens to customers with zero orders?',
    options: [
      'They remain in the result with NULL order columns',
      'They are filtered out because NULL = "PAID" is not true',
      'The database throws an integrity error',
      'They appear twice in the output',
    ],
    correctIndex: 1,
    explanation:
      'Filtering right-table columns in WHERE converts a LEFT JOIN into an effective INNER JOIN. Place that condition in the ON clause to preserve unmatched left rows.',
  },
  {
    id: 'q-sql-3',
    stack: 'sql-dbms',
    topic: 'Subqueries',
    question: 'Given salaries [100, 100, 90] in descending order, what rank does 90 receive from DENSE_RANK()?',
    options: ['1', '2', '3', 'NULL'],
    correctIndex: 1,
    explanation:
      'RANK() assigns 1, 1, 3 (leaving a gap after ties), whereas DENSE_RANK() assigns 1, 1, 2 with no gaps.',
  },
  {
    id: 'q-sql-4',
    stack: 'sql-dbms',
    topic: 'Normalization',
    question: 'Third Normal Form (3NF) specifically eliminates which type of dependency?',
    options: [
      'Repeating multi-valued attributes',
      'Partial dependency on part of a composite primary key',
      'Transitive dependency between non-key attributes',
      'Foreign key references across tables',
    ],
    correctIndex: 2,
    explanation:
      '1NF enforces atomic values, 2NF removes partial key dependencies, and 3NF removes transitive dependencies where a non-key column determines another non-key column.',
  },
  {
    id: 'q-sql-5',
    stack: 'sql-dbms',
    topic: 'Indexes',
    question: 'If a composite B-Tree index exists on (department_id, hire_date, salary), which query CANNOT efficiently use its leading prefix?',
    options: [
      'WHERE department_id = 10',
      'WHERE department_id = 10 AND hire_date >= "2024-01-01"',
      'WHERE hire_date = "2024-05-01"',
      'WHERE department_id = 10 AND hire_date = "2024-05-01" AND salary > 50000',
    ],
    correctIndex: 2,
    explanation:
      'B-Tree composite indexes follow the leftmost prefix rule; filtering on hire_date without department_id skips the leading index key.',
  },
  {
    id: 'q-sql-6',
    stack: 'sql-dbms',
    topic: 'Transactions',
    question: 'Which ACID property guarantees that a transaction either completes every step or leaves the database unchanged on failure?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    correctIndex: 0,
    explanation:
      'Atomicity ensures all-or-nothing execution via rollback on failure.',
  },

  // DSA
  {
    id: 'q-dsa-1',
    stack: 'dsa',
    topic: 'Arrays',
    question: 'When finding a contiguous subarray whose sum equals K in an array containing negative integers, which technique works in O(n) time?',
    options: [
      'Standard shrinking Sliding Window',
      'Prefix Sum + HashMap storing frequency of prior prefix sums',
      'Binary Search on the unsorted array',
      'Two Pointers from both ends without sorting',
    ],
    correctIndex: 1,
    explanation:
      'Negative numbers break monotonicity required by sliding window; storing prefix sum frequencies in a HashMap solves it in O(n) time and space.',
  },
  {
    id: 'q-dsa-2',
    stack: 'dsa',
    topic: 'LinkedList',
    question: 'What is the time and auxiliary space complexity of Floyd’s fast/slow pointer cycle detection in a LinkedList?',
    options: [
      'O(n) time, O(n) space',
      'O(n log n) time, O(1) space',
      'O(n) time, O(1) space',
      'O(n^2) time, O(1) space',
    ],
    correctIndex: 2,
    explanation:
      'Fast and slow pointers detect a cycle using only two pointer variables, achieving O(n) time and O(1) auxiliary space.',
  },
  {
    id: 'q-dsa-3',
    stack: 'dsa',
    topic: 'Stack',
    question: 'Which data structure pattern solves "Next Greater Element" for every index in O(n) time?',
    options: [
      'Circular Queue',
      'Monotonic Decreasing Stack',
      'Min-Heap with O(n^2) rebuild',
      'Doubly Linked List',
    ],
    correctIndex: 1,
    explanation:
      'A monotonic stack pushes and pops each index at most once, giving O(n) total time.',
  },
  {
    id: 'q-dsa-4',
    stack: 'dsa',
    topic: 'Sorting',
    question: 'Which statement comparing Merge Sort and standard in-place Quick Sort is true?',
    options: [
      'Merge Sort is stable and O(n log n) worst-case; Quick Sort is unstable and O(n^2) worst-case',
      'Quick Sort is stable and uses O(n) extra array space',
      'Merge Sort runs in O(1) auxiliary space on arrays',
      'Both algorithms are O(n) on already-sorted arrays',
    ],
    correctIndex: 0,
    explanation:
      'Merge Sort guarantees O(n log n) and preserves relative order (stable) using O(n) space, while standard Quick Sort is in-place O(log n) stack space but unstable with O(n^2) worst-case.',
  },
  {
    id: 'q-dsa-5',
    stack: 'dsa',
    topic: 'Searching',
    question: 'Why do we write mid = left + (right - left) / 2 instead of (left + right) / 2 in Binary Search?',
    options: [
      'It runs faster on modern CPUs',
      'It prevents 32-bit signed integer overflow when left + right exceeds Integer.MAX_VALUE',
      'It handles unsorted arrays automatically',
      'It avoids division by zero when left is 0',
    ],
    correctIndex: 1,
    explanation:
      'If left and right are large positive integers, left + right can overflow 32-bit int; subtracting first stays safely within range.',
  },
  {
    id: 'q-dsa-6',
    stack: 'dsa',
    topic: 'Queue',
    question: 'In Breadth-First Search (BFS) on a graph, when should a neighbor node be marked as visited?',
    options: [
      'Only after the entire level finishes',
      'Right when enqueuing the neighbor into the queue',
      'Never, if using an adjacency list',
      'Only when the destination node is reached',
    ],
    correctIndex: 1,
    explanation:
      'Marking nodes visited upon enqueue prevents multiple neighbors from pushing the same node into the queue repeatedly.',
  },

  // Spring Boot & Backend
  {
    id: 'q-spring-1',
    stack: 'spring-boot',
    topic: 'Dependency Injection',
    question: 'Why does the Spring team recommend Constructor Injection over Field Injection (@Autowired on fields)?',
    options: [
      'Constructor injection allows prototype beans to become singletons',
      'It enables immutable final fields, explicit required dependencies, and container-free unit testing',
      'Field injection is completely removed in Spring Boot 3',
      'Constructor injection bypasses the ApplicationContext',
    ],
    correctIndex: 1,
    explanation:
      'Constructor injection guarantees non-null dependencies via final fields, surfaces circular dependencies at startup, and lets unit tests pass mocks directly.',
  },
  {
    id: 'q-spring-2',
    stack: 'spring-boot',
    topic: 'REST APIs',
    question: 'Which combination properly centralizes exception handling across all @RestController classes in Spring Boot?',
    options: [
      '@Component + @TryCatch',
      '@RestControllerAdvice + @ExceptionHandler',
      '@Repository + @Transactional',
      '@EnableWebSecurity + @Bean',
    ],
    correctIndex: 1,
    explanation:
      '@RestControllerAdvice acts as a global interceptor for controller exceptions, routing them to typed @ExceptionHandler methods returning ResponseEntity.',
  },
  {
    id: 'q-spring-3',
    stack: 'spring-boot',
    topic: 'Hibernate & JPA',
    question: 'How do you fix the Hibernate N+1 query problem when loading parent Order entities along with their lazy child OrderItems?',
    options: [
      'Mark every association FetchType.EAGER globally',
      'Use JOIN FETCH in JPQL or @EntityGraph on the repository method',
      'Remove the @Transactional annotation',
      'Disable primary keys on child tables',
    ],
    correctIndex: 1,
    explanation:
      'JOIN FETCH or @EntityGraph fetches the parent and needed association in a single SQL join query only for the use case that requires it.',
  },
  {
    id: 'q-spring-4',
    stack: 'spring-boot',
    topic: 'Security',
    question: 'In a stateless JWT-authenticated Spring Boot API, how should user passwords be stored in the database?',
    options: [
      'Encrypted with AES so admins can recover them',
      'Hashed with a salted adaptive hash like BCryptPasswordEncoder',
      'Encoded with Base64',
      'Hashed with plain unsalted MD5',
    ],
    correctIndex: 1,
    explanation:
      'Passwords must use a slow, salted one-way hash such as BCrypt or Argon2 so rainbow tables and brute-force attacks fail.',
  },
  {
    id: 'q-spring-5',
    stack: 'spring-boot',
    topic: 'Spring Core',
    question: 'What is the default scope of a Spring Bean in an ApplicationContext?',
    options: ['Prototype', 'Request', 'Singleton', 'Session'],
    correctIndex: 2,
    explanation:
      'Spring creates one shared singleton instance per bean definition per IoC container by default.',
  },

  // Frontend
  {
    id: 'q-fe-1',
    stack: 'frontend',
    topic: 'JavaScript',
    question: 'What is the console output order for: console.log("A"); setTimeout(() => console.log("B"), 0); Promise.resolve().then(() => console.log("C")); console.log("D");',
    options: ['A, B, C, D', 'A, D, B, C', 'A, D, C, B', 'C, A, D, B'],
    correctIndex: 2,
    explanation:
      'Synchronous logs A and D run first; then the Event Loop drains all Microtasks (Promise C) before picking the next Macrotask (setTimeout B).',
  },
  {
    id: 'q-fe-2',
    stack: 'frontend',
    topic: 'React',
    question: 'Why should you avoid using array index as the key prop on a list where items can be inserted or reordered?',
    options: [
      'React throws a fatal syntax error on numeric keys',
      'React matches components by key, causing stale state or input values to stick to the wrong item after reorder',
      'Index keys disable CSS Flexbox inside the list',
      'Keys are sent as HTTP headers on every render',
    ],
    correctIndex: 1,
    explanation:
      'When an item is prepended or deleted, index keys shift for remaining elements, tricking React into reusing DOM/state for the wrong record.',
  },
  {
    id: 'q-fe-3',
    stack: 'frontend',
    topic: 'Hooks',
    question: 'When does the cleanup function returned from useEffect(() => { ...; return cleanup; }, [id]) execute?',
    options: [
      'Only when the user refreshes the browser tab',
      'Before the effect re-runs when id changes, and when the component unmounts',
      'Immediately before the first render',
      'Only if an error is thrown inside the component',
    ],
    correctIndex: 1,
    explanation:
      'React invokes the previous effect’s cleanup right before running the next effect for updated dependencies and on final unmount.',
  },
  {
    id: 'q-fe-4',
    stack: 'frontend',
    topic: 'API Integration',
    question: 'Which behavior of the browser fetch() API catches many beginners off guard?',
    options: [
      'fetch() automatically retries 500 errors three times',
      'fetch() resolves normally on HTTP 404 or 500 responses—you must check response.ok manually',
      'fetch() cannot send JSON payloads',
      'fetch() blocks the main thread synchronously',
    ],
    correctIndex: 1,
    explanation:
      'fetch() only rejects on network failures or aborted requests; HTTP error statuses set response.ok = false.',
  },
  {
    id: 'q-fe-5',
    stack: 'frontend',
    topic: 'CSS',
    question: 'What does box-sizing: border-box change in the CSS Box Model?',
    options: [
      'It removes all margins from child elements',
      'Width and height include content, padding, and border instead of only content',
      'It converts an inline element into CSS Grid',
      'It centers the element horizontally',
    ],
    correctIndex: 1,
    explanation:
      'With border-box, adding padding or borders shrinks the inner content box rather than expanding the element’s outer dimensions.',
  },

  // Projects & Practical
  {
    id: 'q-proj-1',
    stack: 'projects',
    topic: 'APIs',
    question: 'In a secure REST endpoint like DELETE /api/orders/{id}, where should the backend obtain the current user’s ID for ownership checks?',
    options: [
      'From a userId field inside the JSON request body',
      'From the verified JWT/session security context on the server',
      'From a client-supplied query parameter ?uid=...',
      'From document.cookie on the server',
    ],
    correctIndex: 1,
    explanation:
      'Never trust client-supplied user IDs in bodies or query params for authorization; always read the identity from the verified server auth context.',
  },
  {
    id: 'q-proj-2',
    stack: 'projects',
    topic: 'Database Design',
    question: 'Why should an OrderItems table store unit_price_at_purchase in addition to referencing product_id?',
    options: [
      'To avoid using primary keys',
      'So future catalog price updates do not retroactively alter historical order totals',
      'Because SQL joins cannot read numeric columns',
      'To violate First Normal Form intentionally',
    ],
    correctIndex: 1,
    explanation:
      'Point-in-time transactional snapshots preserve financial accuracy even when product prices change later.',
  },
  {
    id: 'q-proj-3',
    stack: 'projects',
    topic: 'Deployment',
    question: 'How should database passwords and API keys be supplied to a deployed backend application?',
    options: [
      'Committed in application.properties on GitHub for team visibility',
      'Hardcoded as static final constants in Java classes',
      'Injected at runtime via environment variables / secret managers, excluded via .gitignore',
      'Sent from the frontend React bundle on startup',
    ],
    correctIndex: 2,
    explanation:
      'Secrets belong in runtime environment variables or secret managers and must never be committed to source control or bundled in client JS.',
  },
  {
    id: 'q-proj-4',
    stack: 'projects',
    topic: 'Challenges & Debugging',
    question: 'A frontend call fails in the browser with a CORS error on POST with Authorization header, even though Postman works. What is the first place to check?',
    options: [
      'Reinstall Node.js on the laptop',
      'Check the browser DevTools Network tab for the OPTIONS preflight response and server CORS allowed origins/headers/methods',
      'Switch from JSON to XML',
      'Disable HTTPS in the browser',
    ],
    correctIndex: 1,
    explanation:
      'Postman does not enforce browser Same-Origin Policy; browsers send an OPTIONS preflight that the backend CORS config must allow.',
  },

  // HR & Behavioral
  {
    id: 'q-hr-1',
    stack: 'hr-behavioral',
    topic: 'Weaknesses',
    question: 'What makes an answer to "What is your biggest weakness?" strong in a fresher interview?',
    options: [
      'Saying "I have no weaknesses because I work very hard"',
      'Picking a disguised humblebrag like "I am a perfectionist"',
      'Sharing a genuine, non-critical improvement area paired with concrete steps you take to mitigate it',
      'Listing a core requirement of the job as something you dislike',
    ],
    correctIndex: 2,
    explanation:
      'Self-awareness plus a repeatable mitigation habit shows maturity and coachability without raising red flags.',
  },
  {
    id: 'q-hr-2',
    stack: 'hr-behavioral',
    topic: 'Education Gap',
    question: 'What is the most effective way to address a 6-month education or post-graduation gap in an interview?',
    options: [
      'Avoid mentioning it and hope the interviewer skips the dates',
      'Give a brief, honest explanation and pivot directly to the projects, skills, and consistency built since then',
      'Spend 10 minutes explaining personal circumstances in deep detail',
      'Blame college administration or external factors',
    ],
    correctIndex: 1,
    explanation:
      'Calm transparency followed by verifiable coding momentum reassures interviewers of your readiness.',
  },
  {
    id: 'q-hr-3',
    stack: 'hr-behavioral',
    topic: 'Situations',
    question: 'In the STAR framework for behavioral interviews, which section should take the largest share (~55%) of your answer?',
    options: [
      'Situation — lengthy background context',
      'Task — repeating the prompt',
      'Action — the specific technical and collaborative steps YOU took',
      'Repeating team members’ bios',
    ],
    correctIndex: 2,
    explanation:
      'Interviewers evaluate your personal ownership, reasoning, and execution, which live in the Action section.',
  },
  {
    id: 'q-hr-4',
    stack: 'hr-behavioral',
    topic: 'Teamwork',
    question: 'When describing a technical disagreement with a teammate, what signals high engineering maturity?',
    options: [
      'Explaining how you proved the teammate wrong publicly',
      'Focusing on objective criteria (requirements, trade-offs, benchmarks) and collaborating on the final decision',
      'Saying you never disagree with anyone to avoid conflict',
      'Doing the feature secretly in your own branch',
    ],
    correctIndex: 1,
    explanation:
      'Data-driven discussion, respect for teammates, and alignment on the team decision show strong collaboration.',
  },
];

export const TEST_MODULES: TestModule[] = [
  {
    id: 'test-core-java',
    stack: 'core-java',
    title: 'Core Java Growth Assessment',
    description: 'Evaluate mastery of Collections, String Pool, Multithreading, Exceptions, Java 8+ Streams, and JVM memory.',
    durationMinutes: 10,
    questionIds: ['q-java-1', 'q-java-2', 'q-java-3', 'q-java-4', 'q-java-5', 'q-java-6'],
  },
  {
    id: 'test-sql-dbms',
    stack: 'sql-dbms',
    title: 'SQL & DBMS Growth Assessment',
    description: 'Verify query execution order, join edge cases, window functions, 3NF normalization, B-Tree indexes, and ACID.',
    durationMinutes: 10,
    questionIds: ['q-sql-1', 'q-sql-2', 'q-sql-3', 'q-sql-4', 'q-sql-5', 'q-sql-6'],
  },
  {
    id: 'test-dsa',
    stack: 'dsa',
    title: 'DSA & Problem-Solving Assessment',
    description: 'Test complexity reasoning across arrays, prefix sums, linked lists, monotonic stacks, BFS queues, sorting, and binary search.',
    durationMinutes: 10,
    questionIds: ['q-dsa-1', 'q-dsa-2', 'q-dsa-3', 'q-dsa-4', 'q-dsa-5', 'q-dsa-6'],
  },
  {
    id: 'test-spring-boot',
    stack: 'spring-boot',
    title: 'Spring Boot & Backend Assessment',
    description: 'Check IoC scopes, constructor injection, REST validation/advice, Hibernate N+1 fixes, and JWT/BCrypt security.',
    durationMinutes: 8,
    questionIds: ['q-spring-1', 'q-spring-2', 'q-spring-3', 'q-spring-4', 'q-spring-5'],
  },
  {
    id: 'test-frontend',
    stack: 'frontend',
    title: 'Frontend & React Assessment',
    description: 'Assess CSS box model, JS Event Loop microtasks, React keys, useEffect cleanup, and fetch error handling.',
    durationMinutes: 8,
    questionIds: ['q-fe-1', 'q-fe-2', 'q-fe-3', 'q-fe-4', 'q-fe-5'],
  },
  {
    id: 'test-projects-hr',
    stack: 'projects',
    title: 'Projects & HR Readiness Check',
    description: 'Test practical API security, DB schema snapshots, CORS debugging, deployment hygiene, and STAR behavioral framing.',
    durationMinutes: 10,
    questionIds: ['q-proj-1', 'q-proj-2', 'q-proj-3', 'q-proj-4', 'q-hr-1', 'q-hr-2', 'q-hr-3', 'q-hr-4'],
  },
];
