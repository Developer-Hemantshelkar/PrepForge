import { StackId } from './stacks';

export interface ConceptItem {
  id: string;
  stack: StackId;
  topic: string;
  title: string;
  difficulty: 'Essential' | 'Intermediate' | 'Deep Dive';
  interviewReadyAnswer: string;
  keyPoints: string[];
  codeExample?: {
    language: string;
    snippet: string;
  };
  commonMistake: string;
}

export const CONCEPTS: ConceptItem[] = [
  // ======================== CORE JAVA ========================
  {
    id: 'java-oop-pillars',
    stack: 'core-java',
    topic: 'OOP',
    title: 'Four Pillars of OOP & Real-World Mapping',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'OOP rests on Encapsulation, Abstraction, Inheritance, and Polymorphism. Encapsulation binds data with methods and hides internal state using private fields; Abstraction exposes only essential behavior through interfaces or abstract classes; Inheritance reuses shared logic across an is-a hierarchy; and Polymorphism lets one reference invoke specialized behavior at compile time (overloading) or runtime (overriding).',
    keyPoints: [
      'Encapsulation = data hiding + controlled access via getters/setters or domain methods.',
      'Runtime polymorphism uses dynamic method dispatch based on the actual heap object type.',
      'Prefer composition (has-a) over deep inheritance (is-a) to avoid fragile base classes.',
    ],
    codeExample: {
      language: 'java',
      snippet: `interface PaymentMethod {
  void pay(double amount);
}
class UpiPayment implements PaymentMethod {
  public void pay(double amount) { System.out.println("Paid via UPI: " + amount); }
}
// Polymorphic call: PaymentMethod method = new UpiPayment(); method.pay(500);`,
    },
    commonMistake:
      'Confusing abstraction with encapsulation: encapsulation hides implementation details (private fields), while abstraction hides complexity by exposing a clean contract.',
  },
  {
    id: 'java-abstract-vs-interface',
    stack: 'core-java',
    topic: 'OOP',
    title: 'Abstract Class vs Interface (Java 8+)',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'An abstract class models a partial is-a relationship and can hold instance state, constructors, and both abstract and concrete methods. An interface defines a capability contract (can-do), supports multiple implementation, has public static final constants, and since Java 8 can include default and static methods (plus private helpers in Java 9). Use an interface for decoupled contracts and an abstract class when subclasses share common state.',
    keyPoints: [
      'A class can extend only one abstract class, but implement multiple interfaces.',
      'Interfaces cannot have instance fields or constructors.',
      'Default methods in interfaces enable backward-compatible API evolution (e.g., Collection.stream()).',
    ],
    commonMistake:
      'Saying interfaces cannot have method bodies—since Java 8, default and static methods can have implementations.',
  },
  {
    id: 'java-hashmap-internals',
    stack: 'core-java',
    topic: 'Collections',
    title: 'HashMap Internal Working & Collision Handling',
    difficulty: 'Intermediate',
    interviewReadyAnswer:
      'HashMap stores key-value entries in an array of buckets (default capacity 16, load factor 0.75). On put(), it computes the key’s hashCode(), applies a bit-spread hash function, and maps it to a bucket index via (n - 1) & hash. Collisions inside a bucket form a linked list, which converts into a balanced Red-Black tree (Java 8+) once bucket size reaches 8 and total capacity is at least 64, improving worst-case lookup from O(n) to O(log n).',
    keyPoints: [
      'Always override both equals() and hashCode() when using custom objects as HashMap keys.',
      'Resizing doubles the bucket array when size exceeds capacity * loadFactor (16 * 0.75 = 12).',
      'HashMap allows one null key (stored in bucket 0) and is not thread-safe; use ConcurrentHashMap for concurrency.',
    ],
    codeExample: {
      language: 'java',
      snippet: `// Contract: If a.equals(b) is true, a.hashCode() == b.hashCode() MUST be true.
@Override
public boolean equals(Object o) { /* compare business fields */ return true; }
@Override
public int hashCode() { return Objects.hash(id, email); }`,
    },
    commonMistake:
      'Overriding equals() without hashCode(), causing identical logical keys to land in different buckets.',
  },
  {
    id: 'java-arraylist-vs-linkedlist',
    stack: 'core-java',
    topic: 'Collections',
    title: 'ArrayList vs LinkedList & Fail-Fast Iterators',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'ArrayList is backed by a dynamically resizing array, giving O(1) random access by index and better CPU cache locality, with amortized O(1) append and O(n) middle insert/delete. LinkedList uses a doubly linked node structure with O(n) index lookup and O(1) insertion/deletion once at the node, plus higher per-element memory overhead. Standard ArrayList iterators are fail-fast, throwing ConcurrentModificationException if structurally modified outside the iterator.',
    keyPoints: [
      'Use ArrayList by default; use ArrayDeque instead of LinkedList for stack/queue operations.',
      'Fail-fast iterators track modCount; fail-safe collections like CopyOnWriteArrayList iterate over a snapshot.',
    ],
    commonMistake:
      'Claiming LinkedList is always faster for insertions—finding an arbitrary index still takes O(n) traversal.',
  },
  {
    id: 'java-string-immutability',
    stack: 'core-java',
    topic: 'Strings',
    title: 'String Immutability, String Pool & StringBuilder',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Strings in Java are immutable because literals are shared in the String Constant Pool inside the heap, preventing unintended side effects across references, securing sensitive parameters like DB URLs, and enabling hashCode caching for HashMaps. StringBuilder is mutable and fast for single-threaded concatenation, whereas StringBuffer is synchronized and thread-safe.',
    keyPoints: [
      'String s = "abc" reuses the String Pool; new String("abc") allocates an extra heap object.',
      'Use .equals() for content comparison and == only for reference identity.',
      'Avoid + concatenation inside loops; use StringBuilder to keep complexity O(n) instead of O(n^2).',
    ],
    codeExample: {
      language: 'java',
      snippet: `String a = "prep";
String b = "prep";
String c = new String("prep");
System.out.println(a == b);      // true (same pool reference)
System.out.println(a == c);      // false (new heap object)
System.out.println(a.equals(c)); // true (same characters)`,
    },
    commonMistake:
      'Comparing user input Strings with == instead of .equals(), which fails when references differ.',
  },
  {
    id: 'java-exceptions',
    stack: 'core-java',
    topic: 'Exceptions',
    title: 'Checked vs Unchecked Exceptions & try-with-resources',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Checked exceptions (like IOException and SQLException) extend Exception and are verified at compile time, forcing the caller to handle or declare them for recoverable external failures. Unchecked exceptions (like NullPointerException and IllegalArgumentException) extend RuntimeException and signal programming or validation bugs. try-with-resources automatically closes any AutoCloseable resource in reverse order, preventing leaks even when exceptions occur.',
    keyPoints: [
      'final is a modifier (constant/non-overridable), finally is a cleanup block, finalize() is deprecated GC cleanup.',
      'Never swallow exceptions silently in empty catch blocks; log context or wrap in a domain exception.',
    ],
    codeExample: {
      language: 'java',
      snippet: `try (BufferedReader br = new BufferedReader(new FileReader("data.txt"))) {
  return br.readLine();
} catch (IOException ex) {
  throw new IllegalStateException("Unable to read data file", ex);
}`,
    },
    commonMistake:
      'Returning inside a finally block—this silently overrides exceptions or return values from the try block.',
  },
  {
    id: 'java-multithreading',
    stack: 'core-java',
    topic: 'Multithreading',
    title: 'Thread Lifecycle, synchronized, volatile & ExecutorService',
    difficulty: 'Intermediate',
    interviewReadyAnswer:
      'A Java thread moves through NEW, RUNNABLE, BLOCKED/WAITING/TIMED_WAITING, and TERMINATED states. synchronized guarantees both mutual exclusion and happens-before memory visibility using an intrinsic monitor lock, while volatile guarantees visibility across threads without locking (ideal for boolean stop flags, not atomic increments). In production, prefer ExecutorService thread pools over raw new Thread() to bound OS thread overhead.',
    keyPoints: [
      'Implement Runnable (no return value) or Callable<T> (returns Future<T>, can throw checked exceptions).',
      'Always call thread.start() to spawn a new call stack; calling run() executes synchronously on the current thread.',
      'Use AtomicInteger for lock-free thread-safe counters via CAS (Compare-And-Swap).',
    ],
    commonMistake:
      'Thinking volatile makes count++ thread-safe—incrementing is read-modify-write and still requires synchronized or AtomicInteger.',
  },
  {
    id: 'java-8-streams-optional',
    stack: 'core-java',
    topic: 'Java 8+',
    title: 'Functional Interfaces, Streams API & Optional',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Java 8 introduced lambdas backed by functional interfaces (single abstract method like Predicate, Function, Consumer, Supplier) and the Streams API for declarative data pipelines. Streams are lazy: intermediate operations like filter() and map() only execute when a terminal operation like collect() or count() runs. Optional<T> explicitly models a possibly absent return value to eliminate unexpected NullPointerExceptions.',
    keyPoints: [
      'Avoid calling Optional.get() directly without checking; prefer orElse(), orElseGet(), or orElseThrow().',
      'orElse() eagerly evaluates its fallback argument even when present; orElseGet() evaluates lazily via a Supplier.',
    ],
    codeExample: {
      language: 'java',
      snippet: `List<String> topEmails = users.stream()
  .filter(User::isActive)
  .map(User::getEmail)
  .sorted()
  .toList();`,
    },
    commonMistake:
      'Using Optional for class fields or method parameters—it is designed specifically for method return types.',
  },
  {
    id: 'java-jvm-memory',
    stack: 'core-java',
    topic: 'JVM',
    title: 'JDK vs JRE vs JVM, Heap vs Stack & Garbage Collection',
    difficulty: 'Intermediate',
    interviewReadyAnswer:
      'JVM executes compiled bytecode; JRE bundles the JVM plus standard class libraries; and JDK adds developer tools like javac and jdb. At runtime, each thread gets its own Stack storing method frames, local primitives, and object references, while all threads share the Heap where actual objects live and are reclaimed by Garbage Collection (Young Gen Eden/Survivor + Old Gen) when unreachable from GC Roots.',
    keyPoints: [
      'StackOverflowError happens on unbounded recursion; OutOfMemoryError happens when Heap or Metaspace fills up.',
      'Metaspace (native memory since Java 8) holds class metadata, replacing PermGen.',
    ],
    commonMistake:
      'Assuming System.gc() forces immediate collection—it is only a hint to the JVM.',
  },

  // ======================== SQL & DBMS ========================
  {
    id: 'sql-execution-order',
    stack: 'sql-dbms',
    topic: 'Queries',
    title: 'SQL Logical Execution Order & WHERE vs HAVING',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Although we write SELECT first, SQL logically executes FROM and JOINs first, then WHERE (filtering individual rows), GROUP BY, HAVING (filtering aggregated groups), SELECT, DISTINCT, ORDER BY, and finally LIMIT. Because WHERE runs before grouping, it cannot filter aggregate functions like COUNT(*) or SUM(); HAVING filters those groups afterward.',
    keyPoints: [
      'Execution sequence: FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT.',
      'Filter rows early with WHERE whenever possible so GROUP BY processes fewer rows.',
    ],
    codeExample: {
      language: 'sql',
      snippet: `SELECT department_id, AVG(salary) AS avg_sal
FROM employees
WHERE status = 'ACTIVE'
GROUP BY department_id
HAVING AVG(salary) > 60000
ORDER BY avg_sal DESC;`,
    },
    commonMistake:
      'Using a column alias defined in SELECT inside the WHERE clause—WHERE runs before SELECT so the alias does not exist yet.',
  },
  {
    id: 'sql-joins',
    stack: 'sql-dbms',
    topic: 'Joins',
    title: 'INNER, LEFT, RIGHT, FULL & SELF Joins',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'INNER JOIN returns only rows with matching keys in both tables. LEFT JOIN returns all rows from the left table and matching rows from the right (filling unmatched right columns with NULL), while RIGHT JOIN does the mirror opposite. FULL OUTER JOIN combines both, and a SELF JOIN joins a table to itself—commonly used for employee-manager hierarchies.',
    keyPoints: [
      'Putting a right-table filter in WHERE after a LEFT JOIN turns it into an INNER JOIN unless you check IS NULL or place it in ON.',
      'CROSS JOIN produces a Cartesian product (M x N rows).',
    ],
    codeExample: {
      language: 'sql',
      snippet: `SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;`,
    },
    commonMistake:
      'Filtering a LEFT JOINed table in the WHERE clause (e.g., WHERE orders.status = "PAID"), which accidentally drops customers with no orders.',
  },
  {
    id: 'sql-subqueries-window',
    stack: 'sql-dbms',
    topic: 'Subqueries',
    title: 'Correlated Subqueries, EXISTS vs IN & Window Functions',
    difficulty: 'Intermediate',
    interviewReadyAnswer:
      'A non-correlated subquery runs once independently, whereas a correlated subquery references the outer row and executes per outer row. EXISTS short-circuits on the first match and handles NULLs safely, making it faster than IN on large subquery results. Window functions like ROW_NUMBER(), RANK(), and DENSE_RANK() compute rankings across partitions without collapsing rows like GROUP BY does.',
    keyPoints: [
      'RANK() leaves gaps on ties (1, 1, 3); DENSE_RANK() does not (1, 1, 2); ROW_NUMBER() assigns unique sequential integers.',
      'CTEs (WITH cte AS (...)) make multi-step queries readable and modular.',
    ],
    codeExample: {
      language: 'sql',
      snippet: `WITH ranked AS (
  SELECT name, department_id, salary,
         DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk
  FROM employees
)
SELECT name, department_id, salary FROM ranked WHERE rnk <= 2;`,
    },
    commonMistake:
      'Using NOT IN when the subquery can return a NULL value—NOT IN evaluates to UNKNOWN and returns zero rows.',
  },
  {
    id: 'dbms-normalization',
    stack: 'sql-dbms',
    topic: 'Normalization',
    title: 'Normalization (1NF, 2NF, 3NF, BCNF) & Anomalies',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Normalization structures tables to eliminate insert, update, and delete anomalies. 1NF requires atomic column values with no repeating groups; 2NF removes partial dependencies on a composite primary key; 3NF removes transitive dependencies where non-key columns depend on other non-key columns; and BCNF ensures every determinant is a candidate key. In read-heavy analytics, selective denormalization trades storage for fewer joins.',
    keyPoints: [
      'Mnemonic for 3NF: Every non-key attribute depends on the key, the whole key (2NF), and nothing but the key (3NF).',
      'Always mention practical tradeoffs: over-normalization adds expensive multi-table joins.',
    ],
    commonMistake:
      'Forgetting that 2NF only applies when a table has a composite primary key; a 1NF table with a single-column PK is automatically in 2NF.',
  },
  {
    id: 'dbms-keys',
    stack: 'sql-dbms',
    topic: 'Keys',
    title: 'Primary, Candidate, Super, Composite & Foreign Keys',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'A Super Key is any column set that uniquely identifies a row; a Candidate Key is a minimal Super Key with no redundant columns; and the Primary Key is the chosen Candidate Key (non-null and unique). A Composite Key combines two or more columns to ensure uniqueness (common in many-to-many junction tables), while a Foreign Key enforces referential integrity by linking to a Primary or Unique key in another table.',
    keyPoints: [
      'A table can have only one Primary Key, but multiple UNIQUE keys (which may allow NULLs depending on the RDBMS).',
      'ON DELETE CASCADE vs ON DELETE RESTRICT controls child row behavior when a parent record is deleted.',
    ],
    commonMistake:
      'Thinking a Primary Key must always be an auto-increment integer—natural keys or UUIDs can be primary keys too, though surrogate integer/UUID keys avoid business-value changes.',
  },
  {
    id: 'dbms-indexes',
    stack: 'sql-dbms',
    topic: 'Indexes',
    title: 'B-Tree Indexes, Clustered vs Non-Clustered & Tradeoffs',
    difficulty: 'Intermediate',
    interviewReadyAnswer:
      'An index is typically a balanced B-Tree structure that speeds up SELECT, WHERE, JOIN, and ORDER BY lookups from O(n) table scans to O(log n) tree traversals. A Clustered Index defines the physical sort order of the table’s rows (so only one can exist per table, usually on the Primary Key), while a Non-Clustered Index stores sorted key pointers to the actual rows. Indexes speed up reads but slow down INSERT/UPDATE/DELETE and consume disk space.',
    keyPoints: [
      'Composite indexes follow the leftmost prefix rule: an index on (a, b, c) accelerates queries on (a), (a, b), and (a, b, c), but not (b) alone.',
      'Avoid indexing low-cardinality columns like boolean flags.',
    ],
    commonMistake:
      'Adding indexes to every column—write-heavy tables suffer severe insert/update overhead maintaining dozens of B-Trees.',
  },
  {
    id: 'dbms-acid-transactions',
    stack: 'sql-dbms',
    topic: 'Transactions',
    title: 'ACID Properties & Isolation Levels',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'ACID ensures reliable transactions: Atomicity means all operations succeed or roll back together; Consistency guarantees valid state transitions adhering to constraints; Isolation keeps concurrent transactions from corrupting each other; and Durability persists committed data via write-ahead logs even after crashes. SQL defines four isolation levels—Read Uncommitted, Read Committed, Repeatable Read, and Serializable—trading concurrency for protection against dirty, non-repeatable, and phantom reads.',
    keyPoints: [
      'PostgreSQL & Oracle default to Read Committed; MySQL InnoDB defaults to Repeatable Read.',
      'Serializable is the safest level but increases lock contention or serialization retries.',
    ],
    commonMistake:
      'Confusing Consistency in ACID (schema constraints & invariants) with Consistency in the CAP theorem (all replicas see the latest write).',
  },

  // ======================== DSA ========================
  {
    id: 'dsa-arrays-two-pointers',
    stack: 'dsa',
    topic: 'Arrays',
    title: 'Two Pointers, Sliding Window & Prefix Sums',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Two Pointers reduces nested O(n^2) pair scans on sorted arrays or palindromes down to O(n) time and O(1) space by moving left and right indices toward each other. Sliding Window tracks a contiguous subarray/substring by expanding the right pointer and shrinking the left pointer when a constraint breaks, also in O(n). Prefix Sums precompute cumulative totals in O(n) so any range sum query answers in O(1).',
    keyPoints: [
      'Prefix Sum + HashMap solves "Subarray Sum Equals K" even with negative numbers (where sliding window fails).',
      'Always state both Time and Space complexity clearly before coding.',
    ],
    codeExample: {
      language: 'java',
      snippet: `// Sliding Window: Longest substring without repeating characters - O(n)
int left = 0, best = 0;
Map<Character, Integer> lastSeen = new HashMap<>();
for (int right = 0; right < s.length(); right++) {
  char c = s.charAt(right);
  if (lastSeen.containsKey(c)) left = Math.max(left, lastSeen.get(c) + 1);
  lastSeen.put(c, right);
  best = Math.max(best, right - left + 1);
}`,
    },
    commonMistake:
      'Using a shrinking Sliding Window for subarray sum with negative numbers—expanding or shrinking no longer monotonically changes the sum.',
  },
  {
    id: 'dsa-strings-hashing',
    stack: 'dsa',
    topic: 'Strings',
    title: 'Frequency Arrays, Anagrams & Palindrome Patterns',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'For lowercase ASCII string problems like anagrams or first unique character, a fixed int[26] frequency array gives O(n) time and O(1) space without HashMap boxing overhead. Palindrome checks use two pointers inward or expand-around-center in O(n^2) time and O(1) space for longest palindromic substring. Because Java/JS strings are immutable, accumulate character edits in a StringBuilder or char[].',
    keyPoints: [
      'Sorting two strings to check anagrams costs O(n log n); frequency counting costs O(n).',
      'Clarify character set with the interviewer (ASCII lowercase vs full Unicode).',
    ],
    commonMistake:
      'Concatenating strings in a loop during string construction, degrading an O(n) solution to O(n^2).',
  },
  {
    id: 'dsa-linkedlist',
    stack: 'dsa',
    topic: 'LinkedList',
    title: 'In-Place Reversal & Floyd’s Cycle Detection',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Reversing a singly linked list in-place uses three pointers—prev, curr, and next—to flip links in O(n) time and O(1) space. Finding the middle node or detecting a cycle uses fast and slow pointers (tortoise and hare): fast moves two steps while slow moves one, meeting inside any loop in O(n) time and O(1) space without a HashSet.',
    keyPoints: [
      'Use a dummy head node whenever the head itself might change (merging lists, removing Nth node from end).',
      'To find the cycle start node after slow == fast, reset one pointer to head and advance both by 1 step.',
    ],
    codeExample: {
      language: 'java',
      snippet: `ListNode prev = null, curr = head;
while (curr != null) {
  ListNode next = curr.next;
  curr.next = prev;
  prev = curr;
  curr = next;
}
return prev;`,
    },
    commonMistake:
      'Losing the reference to curr.next before overwriting curr.next = prev, or forgetting null checks on fast.next.',
  },
  {
    id: 'dsa-stack',
    stack: 'dsa',
    topic: 'Stack',
    title: 'Balanced Parentheses & Monotonic Stack Pattern',
    difficulty: 'Intermediate',
    interviewReadyAnswer:
      'A Stack enforces Last-In-First-Out (LIFO) ordering with O(1) push/pop, making it ideal for expression parsing, undo history, and bracket matching. For "Next Greater Element" or "Daily Temperatures" problems, a Monotonic Stack keeps indices in decreasing order so each element is pushed and popped at most once, solving the problem in O(n) instead of O(n^2).',
    keyPoints: [
      'In Java, prefer Deque<Integer> stack = new ArrayDeque<>() over the legacy synchronized Stack class.',
      'Always check !stack.isEmpty() before calling peek() or pop().',
    ],
    commonMistake:
      'Using java.util.Stack in modern code—it extends Vector and acquires unnecessary synchronization locks on every operation.',
  },
  {
    id: 'dsa-queue',
    stack: 'dsa',
    topic: 'Queue',
    title: 'Queue, Circular Queue, Deque & BFS Traversal',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'A Queue uses First-In-First-Out (FIFO) ordering to process tasks fairly and power Breadth-First Search (BFS) for shortest unweighted paths and level-order tree traversals. A Circular Queue reuses freed front slots in a fixed array using (index + 1) % capacity, avoiding O(n) element shifting. A Deque (double-ended queue) supports O(1) insertion/deletion at both ends, enabling Sliding Window Maximum.',
    keyPoints: [
      'Queue<T> q = new ArrayDeque<>() is faster than LinkedList for BFS queues.',
      'Capture int levelSize = q.size() at the start of each BFS outer iteration to process trees level by level.',
    ],
    commonMistake:
      'Forgetting to mark graph nodes as visited BEFORE pushing them into the BFS queue, causing duplicate visits and exponential blowup.',
  },
  {
    id: 'dsa-sorting',
    stack: 'dsa',
    topic: 'Sorting',
    title: 'Merge Sort vs Quick Sort: Complexity & Stability',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Merge Sort divides the array in half and merges sorted halves, guaranteeing O(n log n) time in all cases and stability, at the cost of O(n) auxiliary space. Quick Sort partitions around a pivot in-place with O(log n) stack space and great cache locality (O(n log n) average), though an unfortunate pivot yields O(n^2) worst case unless randomized. Java uses Dual-Pivot Quicksort for primitives and TimSort (stable) for objects.',
    keyPoints: [
      'Stability preserves the relative order of equal keys (crucial for multi-column sorting).',
      'Counting/Radix sort can beat O(n log n) to O(n) when key ranges are small integers.',
    ],
    commonMistake:
      'Calling Quick Sort stable—standard in-place partitioning swaps non-adjacent elements and breaks stability.',
  },
  {
    id: 'dsa-binary-search',
    stack: 'dsa',
    topic: 'Searching',
    title: 'Binary Search & Search on Rotated / Answer Space',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Binary Search halves a monotonic search space each step to locate targets in O(log n) time and O(1) space. Always compute mid as left + (right - left) / 2 to avoid integer overflow. Beyond sorted arrays, Binary Search applies to rotated sorted arrays (by checking which half is sorted) and "Binary Search on Answer" problems like minimum shipping capacity or Koko eating bananas.',
    keyPoints: [
      'Linear search is O(n) and works on unsorted data; Binary Search requires sorted/monotonic structure.',
      'Verify loop termination (left <= right vs left < right) carefully to avoid infinite loops on 2-element ranges.',
    ],
    codeExample: {
      language: 'java',
      snippet: `int lo = 0, hi = nums.length - 1;
while (lo <= hi) {
  int mid = lo + (hi - lo) / 2;
  if (nums[mid] == target) return mid;
  if (nums[mid] < target) lo = mid + 1;
  else hi = mid - 1;
}
return -1;`,
    },
    commonMistake:
      'Writing (lo + hi) / 2 which overflows 32-bit signed integers when lo + hi > 2^31 - 1.',
  },

  // ======================== SPRING BOOT & BACKEND ========================
  {
    id: 'spring-ioc-beans',
    stack: 'spring-boot',
    topic: 'Spring Core',
    title: 'IoC Container, Spring Beans & Scopes',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Inversion of Control (IoC) shifts object creation and wiring from application code to Spring’s ApplicationContext container. Objects managed by Spring are called Beans, typically defined via @Component, @Service, @Repository, or @Bean methods. By default, beans use Singleton scope (one shared instance per IoC container), while Prototype creates a new instance per request, and Web scopes include Request and Session.',
    keyPoints: [
      '@SpringBootApplication combines @Configuration, @EnableAutoConfiguration, and @ComponentScan.',
      'Keep singleton beans stateless so concurrent HTTP threads do not corrupt shared mutable fields.',
    ],
    commonMistake:
      'Confusing Spring Singleton scope (one instance per ApplicationContext) with the GoF Singleton pattern (one instance per JVM ClassLoader).',
  },
  {
    id: 'spring-di',
    stack: 'spring-boot',
    topic: 'Dependency Injection',
    title: 'Constructor vs Setter vs Field Injection',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Dependency Injection supplies a class’s collaborators from outside rather than calling new inside the class. Constructor Injection is strongly recommended because it allows immutable final fields, guarantees required dependencies are non-null at instantiation, makes unit testing easy without reflection, and exposes circular dependencies immediately at startup. Field injection (@Autowired on fields) hides dependencies and complicates testing.',
    keyPoints: [
      'If a bean has a single constructor, @Autowired is optional in modern Spring.',
      'Use @Qualifier("beanName") or @Primary when multiple implementations of an interface exist.',
    ],
    codeExample: {
      language: 'java',
      snippet: `@Service
public class OrderService {
  private final PaymentGateway gateway;
  public OrderService(PaymentGateway gateway) { this.gateway = gateway; }
}`,
    },
    commonMistake:
      'Storing mutable request state inside a @Service singleton or relying on field injection everywhere.',
  },
  {
    id: 'spring-rest-apis',
    stack: 'spring-boot',
    topic: 'REST APIs',
    title: 'REST Controllers, Validation & Global Exception Handling',
    difficulty: 'Essential',
    interviewReadyAnswer:
      '@RestController combines @Controller and @ResponseBody to serialize return objects directly to JSON via Jackson. Clean REST APIs map resources to nouns, use appropriate HTTP methods (GET, POST, PUT, PATCH, DELETE) and accurate status codes (200, 201, 400, 401, 404, 409), validate DTO inputs with @Valid, and centralize error formatting in a @RestControllerAdvice class using @ExceptionHandler.',
    keyPoints: [
      'Always accept and return DTOs rather than exposing JPA @Entity classes directly in API payloads.',
      '@PathVariable extracts URI segments (/users/{id}); @RequestParam extracts query strings (?page=1).',
    ],
    codeExample: {
      language: 'java',
      snippet: `@RestControllerAdvice
public class GlobalErrorHandler {
  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleNotFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
  }
}`,
    },
    commonMistake:
      'Returning 200 OK with an error string in JSON instead of proper 4xx/5xx HTTP status codes.',
  },
  {
    id: 'spring-hibernate-jpa',
    stack: 'spring-boot',
    topic: 'Hibernate & JPA',
    title: 'JPA vs Hibernate, Lazy Fetching & the N+1 Problem',
    difficulty: 'Intermediate',
    interviewReadyAnswer:
      'JPA is the standard Java ORM specification, while Hibernate is its default implementation in Spring Boot that maps Java entities to SQL tables. Collections like @OneToMany default to LAZY fetching (loaded only when accessed), whereas @ManyToOne defaults to EAGER. The N+1 problem happens when loading N parent entities triggers N extra SQL queries for their child associations—solved using JOIN FETCH or @EntityGraph.',
    keyPoints: [
      '@Transactional ensures atomic DB operations and rolls back on unchecked exceptions by default.',
      'Entity lifecycle states: Transient -> Managed (Persistent) -> Detached -> Removed.',
    ],
    codeExample: {
      language: 'java',
      snippet: `@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.user.id = :userId")
List<Order> findOrdersWithItems(@Param("userId") Long userId);`,
    },
    commonMistake:
      'Accessing a LAZY collection outside an active @Transactional session, throwing LazyInitializationException.',
  },
  {
    id: 'spring-security',
    stack: 'spring-boot',
    topic: 'Security',
    title: 'Spring Security Filter Chain, JWT & Password Hashing',
    difficulty: 'Intermediate',
    interviewReadyAnswer:
      'Spring Security intercepts incoming HTTP requests through a SecurityFilterChain before they reach DispatcherServlet. For stateless REST APIs, a custom OncePerRequestFilter validates the Bearer JWT signature, extracts claims, and populates SecurityContextHolder with the authenticated Principal and Roles, with SessionCreationPolicy.STATELESS. Passwords are never encrypted reversibly—they are hashed with a salted adaptive algorithm like BCryptPasswordEncoder.',
    keyPoints: [
      'Configure CORS explicitly so frontend origins and Authorization headers work safely.',
      'Disable CSRF only for pure stateless token APIs; keep it enabled for cookie-session apps.',
    ],
    commonMistake:
      'Storing raw or MD5/SHA-256 passwords instead of salted slow hashes like BCrypt or Argon2.',
  },

  // ======================== FRONTEND DEVELOPMENT ========================
  {
    id: 'fe-html-accessibility',
    stack: 'frontend',
    topic: 'HTML',
    title: 'Semantic HTML5, Document Structure & Accessibility',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Semantic HTML uses meaningful elements like <header>, <nav>, <main>, <article>, <section>, and <button> instead of generic <div> tags. It gives screen readers landmark navigation, enables built-in keyboard focus and Enter/Space activation on native buttons/links, and improves SEO without extra ARIA hacks.',
    keyPoints: [
      'Never attach click handlers to a <div> when a <button> or <a> belongs there.',
      'Every form input needs a paired <label htmlFor="...">, and images need descriptive alt text.',
    ],
    commonMistake:
      'Using <a> without href or <div onClick> for actions, breaking keyboard Tab navigation.',
  },
  {
    id: 'fe-css-layout',
    stack: 'frontend',
    topic: 'CSS',
    title: 'Box Model, Flexbox vs CSS Grid & Specificity',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Every CSS element is a box of content, padding, border, and margin; box-sizing: border-box makes width and height include padding and border so layouts stay predictable. Use Flexbox for 1-dimensional alignment (row or column navbars, toolbars) and CSS Grid for 2-dimensional layouts (page shells, card matrices). Selector specificity follows inline > ID > class/attribute/pseudo-class > element.',
    keyPoints: [
      'margin collapses vertically between adjacent block elements, whereas Flexbox/Grid gap does not collapse.',
      'Mobile-first responsive design builds base styles for small screens and scales up with min-width media queries.',
    ],
    commonMistake:
      'Overusing !important instead of simplifying selector specificity.',
  },
  {
    id: 'fe-js-event-loop',
    stack: 'frontend',
    topic: 'JavaScript',
    title: 'Closures, Event Loop, Microtasks & Promises',
    difficulty: 'Intermediate',
    interviewReadyAnswer:
      'JavaScript runs on a single Call Stack, delegating async I/O and timers to browser/Node Web APIs. When ready, Promise .then/await callbacks enter the Microtask Queue while setTimeout callbacks enter the Macrotask Queue; after each call stack clear, the Event Loop drains ALL microtasks before taking the next macrotask. A closure occurs when an inner function remembers variables from its outer lexical scope even after the outer function returns.',
    keyPoints: [
      'Execution order: Synchronous code -> Microtasks (Promises, queueMicrotask) -> Macrotasks (setTimeout, UI events).',
      'Use === (strict equality) to avoid JavaScript’s implicit type coercion surprises with ==.',
    ],
    codeExample: {
      language: 'javascript',
      snippet: `console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
// Output: 1, 4, 3, 2`,
    },
    commonMistake:
      'Expecting setTimeout(fn, 0) to run before an already-resolved Promise callback.',
  },
  {
    id: 'fe-react-vdom',
    stack: 'frontend',
    topic: 'React',
    title: 'Virtual DOM, Reconciliation & Why Keys Matter',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'React maintains a lightweight in-memory representation of the UI (Virtual DOM). When state or props change, React diffs the new element tree against the previous one during reconciliation and batches minimal DOM mutations. Stable, unique key props on list items let React match existing nodes across insertions or reorders instead of destroying and recreating DOM elements and component state.',
    keyPoints: [
      'Never use array index as a key for dynamic lists where items can be added, removed, or reordered.',
      'React state updates are batched and asynchronous; update based on previous state with setCount(c => c + 1).',
    ],
    commonMistake:
      'Mutating state arrays or objects directly (e.g., items.push(x); setItems(items)), which fails reference equality and skips re-rendering.',
  },
  {
    id: 'fe-react-components',
    stack: 'frontend',
    topic: 'Components',
    title: 'Props vs State & Controlled vs Uncontrolled Inputs',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Props are read-only inputs passed down from parent to child, while State is mutable data owned locally by a component. When two sibling components need shared data, lift the state up to their closest common ancestor. A Controlled Component binds an input’s value and onChange directly to React state (single source of truth), whereas an Uncontrolled Component lets the DOM hold the value via a ref.',
    keyPoints: [
      'Controlled inputs make live validation, formatting, and conditional submit disabling trivial.',
      'Avoid copying props into state unless you explicitly want an initial seed value.',
    ],
    commonMistake:
      'Prop drilling state through 5 intermediate components when Context or composition (children) is cleaner.',
  },
  {
    id: 'fe-react-hooks',
    stack: 'frontend',
    topic: 'Hooks',
    title: 'useEffect Cleanup, useMemo vs useCallback & Custom Hooks',
    difficulty: 'Intermediate',
    interviewReadyAnswer:
      'useEffect synchronizes a component with external systems (fetches, timers, subscriptions) after render, and its returned cleanup function runs before re-running the effect or unmounting to prevent memory leaks. useMemo caches a computed value across renders, while useCallback caches a function reference to prevent unnecessary child re-renders. Custom hooks extract reusable stateful logic starting with use*.',
    keyPoints: [
      'Always include every reactive value read inside useEffect in the dependency array (or use AbortController for fetches).',
      'Do not wrap everything in useMemo/useCallback prematurely—measure first or use them for referential stability.',
    ],
    codeExample: {
      language: 'tsx',
      snippet: `useEffect(() => {
  const controller = new AbortController();
  fetch('/api/items', { signal: controller.signal })
    .then(r => r.json())
    .then(setItems)
    .catch(err => { if (err.name !== 'AbortError') setError(err.message); });
  return () => controller.abort();
}, []);`,
    },
    commonMistake:
      'Omitting dependencies from useEffect, resulting in stale closures reading outdated state.',
  },
  {
    id: 'fe-api-integration',
    stack: 'frontend',
    topic: 'API Integration',
    title: 'Fetch Error Handling, Loading States & Debouncing',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Native fetch() only rejects on network failures, NOT on HTTP 4xx or 5xx responses, so always verify response.ok before parsing JSON. Production UIs track distinct loading, error, empty, and populated states to prevent broken screens. For search inputs hitting an API, debouncing waits 300ms after the user stops typing and cancels stale requests via AbortController.',
    keyPoints: [
      'Always send Content-Type: application/json for JSON POST bodies and handle non-JSON error responses gracefully.',
      'Disable submit buttons while requests are in flight to prevent duplicate form submissions.',
    ],
    commonMistake:
      'Assuming fetch() throws automatically on 404 or 500 status codes.',
  },

  // ======================== PROJECTS & PRACTICAL ========================
  {
    id: 'proj-architecture',
    stack: 'projects',
    topic: 'Architecture',
    title: 'Defending Your Project Architecture (Layered MVC vs Microservices)',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'When asked about project architecture, explain the request flow end-to-end: Client -> Controller (validation & HTTP mapping) -> Service (business rules & transactions) -> Repository (database queries). For fresher projects, a clean modular Monolith is usually superior to premature microservices because it gives ACID transactions, simpler debugging, and faster deployment without distributed network overhead.',
    keyPoints: [
      'Be ready to explain WHY you chose your stack (e.g., PostgreSQL for relational integrity vs MongoDB for flexible schemas).',
      'Draw clear boundaries: Controllers never talk directly to Repositories.',
    ],
    commonMistake:
      'Saying "We used microservices" for a 2-table college project—interviewers immediately probe distributed tracing and saga patterns.',
  },
  {
    id: 'proj-database-design',
    stack: 'projects',
    topic: 'Database Design',
    title: 'Schema Relationships, Indexing & Pagination in Projects',
    difficulty: 'Intermediate',
    interviewReadyAnswer:
      'Explain your core entities, primary/foreign keys, and cardinality (e.g., User 1:N Orders, Orders M:N Products via an OrderItems junction table storing snapshot price). Highlight how you indexed foreign keys and search columns, used server-side pagination (LIMIT/OFFSET or cursor-based) instead of loading entire tables into memory, and enforced unique constraints at the DB level.',
    keyPoints: [
      'Storing unitPrice in OrderItems prevents historical invoices from changing if a product’s catalog price updates.',
      'Add composite unique indexes to prevent duplicate enrollments, likes, or bookings.',
    ],
    commonMistake:
      'Returning List<Entity> with findAll() without pagination on endpoints that grow unboundedly.',
  },
  {
    id: 'proj-apis',
    stack: 'projects',
    topic: 'APIs',
    title: 'API Contract Design, Auth Flow & Idempotency',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Walk interviewers through a concrete endpoint contract: request DTO validation, JWT/session authentication check, ownership authorization (verifying userId matches the resource owner), HTTP status codes, and consistent JSON error shape. Explain idempotency for critical operations like payments or retries so duplicate network requests do not create double records.',
    keyPoints: [
      'Always separate authentication (who you are) from authorization (what you are allowed to touch).',
      'Version public APIs or keep backward-compatible additive JSON fields.',
    ],
    commonMistake:
      'Trusting a userId sent inside the request body instead of reading the authenticated user ID from the verified token/session.',
  },
  {
    id: 'proj-challenges-debugging',
    stack: 'projects',
    topic: 'Challenges & Debugging',
    title: 'Describing a Real Technical Challenge & Systematic Debugging',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Frame project challenges using Situation -> Root Cause -> Fix -> Verification. For example: "Users saw slow dashboard loads (2.5s). Using Hibernate SQL logs I spotted an N+1 query fetching child items in a loop, replaced it with a JOIN FETCH query plus a composite index, and verified latency dropped to 90ms." Mention real debugging tools: stack traces, Chrome DevTools Network tab, SQL EXPLAIN, and structured server logs.',
    keyPoints: [
      'Pick one concrete bug (CORS failure, N+1 query, race condition, stale React state) and own how you isolated it.',
      'Explain how you reproduced the bug locally before changing code.',
    ],
    commonMistake:
      'Saying "I had no challenges, everything worked smoothly"—it signals shallow involvement or copy-pasted code.',
  },
  {
    id: 'proj-deployment',
    stack: 'projects',
    topic: 'Deployment',
    title: 'Environment Config, Docker Basics & Production Checklist',
    difficulty: 'Intermediate',
    interviewReadyAnswer:
      'Production deployment separates secrets and environment-specific URLs into environment variables rather than hardcoding credentials in Git. Containerizing with a multi-stage Dockerfile ensures identical runtime behavior across laptop and cloud, while a pre-deploy checklist verifies build/lint passes, database migrations run safely, CORS origins are locked down, and health check endpoints respond with 200 OK.',
    keyPoints: [
      'Never commit .env files or API keys to GitHub; maintain a .env.example template.',
      'Understand the basics of CI pipelines: install -> lint -> test -> build -> deploy.',
    ],
    commonMistake:
      'Leaving localhost URLs or permissive CORS (*) and debug stack traces enabled in production.',
  },

  // ======================== HR & BEHAVIORAL ========================
  {
    id: 'hr-strengths',
    stack: 'hr-behavioral',
    topic: 'Strengths',
    title: 'Answering "What Are Your Greatest Strengths?"',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Pick two job-relevant strengths—one technical execution habit and one collaboration trait—and back each with a brief concrete example. For instance: "My core strength is structured debugging and fast self-learning. During my capstone project, when our API latency spiked, I profiled the SQL queries, learned indexing strategies, and cut response time by 70%, while documenting the fix for my teammates."',
    keyPoints: [
      'Avoid generic adjectives like "hardworking" without proof.',
      'Tie your strength directly to how it helps an engineering team ship reliable software.',
    ],
    commonMistake:
      'Listing 5 buzzwords with zero real-world story to substantiate them.',
  },
  {
    id: 'hr-weaknesses',
    stack: 'hr-behavioral',
    topic: 'Weaknesses',
    title: 'Answering "What Is Your Biggest Weakness?"',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Share a real, non-fatal skill or habit you noticed early on, and focus 70% of your answer on the concrete system you built to improve it. Example: "Early on, I spent too long perfecting a single feature before testing edge cases end-to-end. I fixed this by writing a small test checklist and integrating early API checks into my workflow, which helped our team catch integration bugs days earlier."',
    keyPoints: [
      'Never use disguised humblebrags like "I work too hard" or "I am a perfectionist."',
      'Never pick a dealbreaker weakness for the role (e.g., "I hate writing code or working in teams").',
    ],
    commonMistake:
      'Naming a flaw without explaining what active steps you are taking today to fix it.',
  },
  {
    id: 'hr-career-goals',
    stack: 'hr-behavioral',
    topic: 'Career Goals',
    title: 'Short-Term & Long-Term Career Goals (Where in 3–5 Years?)',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Anchor your short-term goal in mastering the team’s codebase, engineering standards, and production ownership within your first year. Connect your 3–5 year goal to growing into a dependable full-stack or backend engineer who mentors newcomers and designs scalable features—showing ambition aligned with growing inside the company.',
    keyPoints: [
      'Show curiosity about engineering craft, code quality, and business impact.',
      'Align your target tech stack with the company’s actual engineering stack.',
    ],
    commonMistake:
      'Saying "I want to leave in a year to do an MBA or start my own company" during a fresher hiring interview.',
  },
  {
    id: 'hr-education-gap',
    stack: 'hr-behavioral',
    topic: 'Education Gap',
    title: 'Explaining an Education Gap or Career Break Confidently',
    difficulty: 'Intermediate',
    interviewReadyAnswer:
      'Address an education or post-graduation gap directly in 2–3 calm sentences without defensiveness: state the reason honestly, highlight what technical skills or projects you built during or after that period, and pivot to your readiness today. Example: "After graduating, I took 6 months to prepare for competitive exams / manage a family responsibility, after which I dedicated myself full-time to Java, Spring Boot, and building two deployed full-stack projects."',
    keyPoints: [
      'Honesty + productive upskilling proof beats vague excuses every time.',
      'Keep GitHub commits, live demos, and consistent recent practice ready to prove momentum.',
    ],
    commonMistake:
      'Sounding apologetic, over-explaining personal details, or hiding dates.',
  },
  {
    id: 'hr-teamwork',
    stack: 'hr-behavioral',
    topic: 'Teamwork',
    title: 'Teamwork & Handling Technical Disagreements (STAR)',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Describe a disagreement objectively without blaming teammates, focusing on shared goals and data. Example: "In our team project, a teammate wanted MongoDB while I favored PostgreSQL (Situation/Task). I listed our relational reporting queries and transaction needs, built a quick schema comparison, and we agreed on PostgreSQL while adopting their JSONB idea for flexible metadata (Action). Both features shipped cleanly on schedule (Result)."',
    keyPoints: [
      'Use "we" for team successes and "I" for your specific actions.',
      'Demonstrate empathy, active listening, and willingness to commit once decided.',
    ],
    commonMistake:
      'Badmouthing former groupmates or claiming you solved the entire project alone.',
  },
  {
    id: 'hr-situations',
    stack: 'hr-behavioral',
    topic: 'Situations',
    title: 'Handling Tight Deadlines, Mistakes & Ambiguity (STAR Method)',
    difficulty: 'Essential',
    interviewReadyAnswer:
      'Structure every situational answer with STAR: Situation (15%), Task (10%), Action (55% — your specific decisions, trade-offs, and communication), and Result (20% — measurable outcome and lesson learned). When handling a mistake or tight deadline, emphasize early communication, prioritizing core scope over nice-to-haves, and preventing recurrence.',
    keyPoints: [
      'Prepare 3 versatile stories from college projects, internships, or hackathons that map to multiple HR prompts.',
      'Quantify results whenever possible (e.g., "submitted 1 day early", "cut bug count by half").',
    ],
    commonMistake:
      'Spending 80% of the time on background context and rushing through what YOU actually did.',
  },
];
