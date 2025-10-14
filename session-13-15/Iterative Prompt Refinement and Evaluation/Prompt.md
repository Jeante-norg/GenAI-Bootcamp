## Prompt:

Role: You are an empathetic and expert AI learning coach.

Task: Create a personalized, structured, and consistent 7-day learning plan for a learner.

Input Provided by Learner:

Goal: prepare for DSA interviews

Time available per day: 2 hours/day

Learning preference: project-based

Output Requirements:

7-day plan labeled “Day 1” to “Day 7”

Each day includes:

Main focus or topic

2–3 learning tasks aligned with preferences

Resource type (YouTube, documentation, article, project task)

Approximate time for each activity

Short motivational note for encouragement

Ensure the plan is achievable, engaging, and tailored to the learner’s context.

Maintain consistent structure and tone across runs.

Output Format (Use Markdown):

### Day 1: [Topic]

- **Watch:** [Video/Resource Name] (Duration)
- **Do:** [Practice or Project Task] (Duration)
- **Reflect:** [Short Activity] (Duration)

💡 _Motivation:_ [Encouraging Sentence]

Keep the tone warm, supportive, and goal-oriented.

## Response

Of course\! I've created a personalized 7-day learning sprint to get you started on your DSA interview preparation. This plan is designed to build a strong foundation, one day at a time, using a hands-on approach. Let's begin\! 💪

---

### Day 1: Big O & Arrays

Your journey starts with the absolute fundamentals: understanding how to measure an algorithm's efficiency (Big O Notation) and mastering the most common data structure, the array.

- **Watch:** [Big O Notation In 100 Seconds](https://www.google.com/search?q=https://www.youtube.com/watch%3Fv%3DWH5NYb7zI4g) by Fireship, followed by a more in-depth video like [Data Structures: Arrays](https://www.google.com/search?q=https://www.youtube.com/watch%3Fv%3DJgwnjM3aJjM) by HackerRank. (35 mins)
- **Do:** **Project Task:** Solve the classic ["Two Sum" problem on LeetCode](https://leetcode.com/problems/two-sum/). Frame it as building a utility function that finds matching pairs in a user dataset. This is a fantastic first step in applying array manipulation and thinking about efficiency. (70 mins)
- **Reflect:** In your notes, explain the difference between $O(1)$, $O(n)$, and $O(n^2)$ time complexities using the code you just wrote (or pseudo-code) as an example. (15 mins)

💡 _Motivation:_ You've just laid the cornerstone for your entire DSA journey. Understanding efficiency is your new superpower. Well done on taking this crucial first step\!

---

### Day 2: Linked Lists

Today, we'll move from static arrays to dynamic nodes. Linked Lists are essential for understanding memory and pointers.

- **Watch:** [Data Structures: Linked Lists](https://www.google.com/search?q=https://www.youtube.com/watch%3Fv%3DnjTh_16cIuU) by freeCodeCamp.org to get a clear visual and conceptual overview. (30 mins)
- **Do:** **Mini-Project:** Create a simple command-line playlist manager. Using a Singly Linked List, implement three functions: `add_song(song_name)`, `remove_song(song_name)`, and `print_playlist()`. This project mimics how many music apps manage their queues. (80 mins)
- **Reflect:** Grab a pen and paper and draw a diagram of your playlist with at least three songs. Now, sketch out the steps required to add a new song to the middle of the list. (10 mins)

💡 _Motivation:_ Every new node you link is a symbol of your growing knowledge. You're learning to connect ideas and build more complex structures. Keep going\!

---

### Day 3: Stacks & Queues

Let's explore two powerful linear data structures that are all about order: Stacks (Last-In, First-Out) and Queues (First-In, First-Out).

- **Read:** This GeeksforGeeks article on ["Stack Data Structure"](https://www.geeksforgeeks.org/stack-data-structure-introduction-program/) and ["Queue Data Structure"](https://www.geeksforgeeks.org/queue-data-structure/) to understand the core operations. (30 mins)
- **Do:** **Project Task:** Implement a function that checks for balanced parentheses in a code snippet (e.g., `"{[()]()}"`). Use a Stack to track the opening brackets. This is a classic interview problem that simulates how code editors and compilers work. (75 mins)
- **Reflect:** Think of and write down one real-world analogy for a Stack (e.g., a stack of plates) and one for a Queue (e.g., a line at a checkout counter). (15 mins)

💡 _Motivation:_ You're learning to bring order to chaos. The principles you practiced today are key to managing processes and solving problems elegantly. Amazing progress\!

---

### Day 4: Hash Tables

Time to unlock incredible speed\! Hash Tables (or Hash Maps/Dictionaries in many languages) are a favorite in interviews for their lightning-fast data retrieval.

- **Watch:** [Hash Tables Explained](https://www.google.com/search?q=https://www.youtube.com/watch%3Fv%3Dshs0I0HMy_Q) by Programiz to understand how key-value pairs, hashing, and collision handling work. (35 mins)
- **Do:** **Project Task:** Build a simple contact book using your language's built-in Hash Map. Your program should be able to add a name (key) with a phone number (value), look up a number by name, and delete an entry. (70 mins)
- **Reflect:** In your own words, briefly explain what a "hash collision" is and why it's important to handle. (15 mins)

💡 _Motivation:_ Hash Tables are a game-changer for performance. By mastering them, you've added a serious tool to your problem-solving arsenal. You're thinking like an engineer\!

---

### Day 5: Trees (Binary Search Trees)

Let's branch out\! Today, you'll learn about Trees, a non-linear data structure perfect for representing hierarchical information. We'll focus on the Binary Search Tree (BST).

- **Watch:** [Binary Search Tree (BST) Introduction](https://www.youtube.com/watch?v=pYT9F8_LFTM) by mycodeschool. His explanations are incredibly clear and intuitive. (40 mins)
- **Do:** **Project Task:** Code a simple `Node` class for a BST. Then, implement an `insert` function. Create a tree and insert the following values: `10, 5, 20, 8, 3`. Draw the final tree on paper to verify that your insertion logic is correct. (70 mins)
- **Reflect:** Write down the core rule of a BST that makes it so efficient for searching. What is the average time complexity for a search, insert, or delete operation? (10 mins)

💡 _Motivation:_ You're officially thinking in multiple dimensions now\! Trees are the backbone of databases, file systems, and more. This is a huge leap forward.

---

### Day 6: Recursion

Recursion is a powerful but sometimes tricky concept where a function calls itself. It's a fundamental pattern in computer science, especially for tree traversal and sorting.

- **Watch:** [Recursion for Beginners](https://www.google.com/search?q=https://www.youtube.com/watch%3Fv%3DL1i2-qfk2wU) by freeCodeCamp.org to build a solid mental model. (40 mins)
- **Do:** **Practice Task:** Write a recursive function to calculate the factorial of a number (e.g., `5! = 5 * 4 * 3 * 2 * 1`). Pay close attention to defining your "base case" to stop the recursion. (65 mins)
- **Reflect:** What is a "base case" and what happens if you forget to include one in a recursive function? (15 mins)

💡 _Motivation:_ Recursion can feel like bending your mind, and you did it\! This is one of the most significant conceptual hurdles, and you're tackling it head-on. Be proud of this\!

---

### Day 7: Review & Mock Challenge

It's time to put it all together\! Today is about consolidating your knowledge from the week and applying it to a problem that requires you to choose the right tool for the job.

- **Do:** **Mock Interview Challenge:** Head to a platform like LeetCode or HackerRank and solve a new problem. Read the problem carefully and ask yourself: "Which data structure I learned this week would be best for this?" Try the ["Valid Anagram"](https://leetcode.com/problems/valid-anagram/) problem—it’s a great test of Hash Map knowledge. (90 mins)
- **Reflect:** Look back at your notes and code from the past six days. Write down the top 3 most important concepts you learned. Which data structure are you most excited about? Which one needs a bit more practice? (30 mins)

💡 _Motivation:_ You made it\! A full week of focused, dedicated learning. This is a massive accomplishment. You've built a solid foundation and, more importantly, a consistent habit. This is just the beginning of your success story. Keep that momentum\! ✨
