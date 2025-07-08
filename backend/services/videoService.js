export const extractTranscript = async (videoUrl) => {
  // This is a dummy implementation for testing
  // In production, this would use a real video transcription service
  
  // Generate different transcripts based on video URL to simulate variety
  const transcripts = [
    "Welcome to this module on React fundamentals. Today we'll cover functional components, hooks, and state management. Let's start with functional components. Functional components are the modern way to write React components using JavaScript functions. They're simpler and more performant than class components. Now let's talk about hooks. Hooks allow you to use state and other React features in functional components. The most common hooks are useState and useEffect. useState lets you add state to functional components, while useEffect handles side effects like API calls and subscriptions.",
    
    "In this session, we'll explore JavaScript fundamentals. JavaScript is a versatile programming language used for web development. Let's begin with variables and data types. JavaScript has several primitive data types including strings, numbers, booleans, null, and undefined. Functions are first-class citizens in JavaScript, meaning they can be assigned to variables, passed as arguments, and returned from other functions. Arrays and objects are reference types that allow you to store collections of data. Understanding these concepts is crucial for building modern web applications.",
    
    "Today we'll discuss database design principles. A well-designed database is essential for any application's performance and scalability. We'll cover normalization, which helps eliminate data redundancy and ensures data integrity. Primary keys uniquely identify each record in a table, while foreign keys establish relationships between tables. Indexing improves query performance by creating efficient lookup structures. Understanding these concepts will help you design robust and efficient database schemas for your applications.",
    
    "This module covers machine learning basics. Machine learning is a subset of artificial intelligence that enables computers to learn from data without being explicitly programmed. We'll explore supervised learning, where the algorithm learns from labeled training data. Classification and regression are two main types of supervised learning problems. Unsupervised learning finds patterns in unlabeled data through clustering and dimensionality reduction. Understanding these fundamental concepts is essential for building intelligent systems.",
    
    "Welcome to our module on web security. Security is crucial in today's interconnected world. We'll start with authentication and authorization. Authentication verifies user identity, while authorization determines what resources users can access. HTTPS encrypts data in transit, protecting sensitive information from interception. SQL injection and cross-site scripting are common web vulnerabilities that developers must guard against. Input validation and output encoding are essential security practices. Remember, security should be built into applications from the ground up, not added as an afterthought."
  ];
  
  // Use video URL to deterministically select a transcript
  const hash = videoUrl.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const index = Math.abs(hash) % transcripts.length;
  
  // Add some randomness to make it more realistic
  const randomDelay = Math.random() * 1000 + 500;
  await new Promise(resolve => setTimeout(resolve, randomDelay));
  
  return transcripts[index];
};