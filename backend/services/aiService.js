import axios from 'axios';
import { extractTranscript } from './videoService.js';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = "google/gemini-2.5-flash";

const openRouterGenerate = async (prompt, systemPrompt = "You are a helpful assistant that generates multiple choice quizzes in JSON format.") => {
  if (!OPENROUTER_API_KEY) throw new Error('OpenRouter API key not set');
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2048,
      temperature: 0.7
    },
    {
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  // The response format is similar to OpenAI
  return response.data.choices[0].message.content;
};

// Simple semantic similarity function (cosine similarity)
const calculateSimilarity = (text1, text2) => {
  if (!text1 || !text2 || text1.trim().length === 0 || text2.trim().length === 0) {
    return 0;
  }
  
  // Normalize and clean text
  const normalizeText = (text) => {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
  };
  
  const normalizedText1 = normalizeText(text1);
  const normalizedText2 = normalizeText(text2);
  
  // Split into words and filter out common stop words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
  
  const words1 = normalizedText1.split(' ').filter(word => word.length > 2 && !stopWords.has(word));
  const words2 = normalizedText2.split(' ').filter(word => word.length > 2 && !stopWords.has(word));
  
  if (words1.length === 0 || words2.length === 0) {
    return 0;
  }
  
  // Create word frequency maps
  const freq1 = {};
  const freq2 = {};
  
  words1.forEach(word => freq1[word] = (freq1[word] || 0) + 1);
  words2.forEach(word => freq2[word] = (freq2[word] || 0) + 1);
  
  // Get all unique words
  const allWords = new Set([...words1, ...words2]);
  
  // Calculate cosine similarity
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  allWords.forEach(word => {
    const f1 = freq1[word] || 0;
    const f2 = freq2[word] || 0;
    dotProduct += f1 * f2;
    magnitude1 += f1 * f1;
    magnitude2 += f2 * f2;
  });
  
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
};

// Extract relevant content chunks for RAG
const extractRelevantContent = (question, notes, transcript) => {
  const contentChunks = [];
  
  // PRIORITY 1: Extract from notes first (higher priority)
  if (notes && notes.trim().length > 0) {
    const noteChunks = notes.split('\n\n').filter(chunk => chunk.trim().length > 10);
    
    noteChunks.forEach((chunk, index) => {
      const similarity = calculateSimilarity(question, chunk);
      if (similarity > 0.03) { // Lower threshold for notes (higher priority)
        contentChunks.push({
          content: chunk,
          source: 'notes',
          relevance: similarity,
          index: index,
          priority: 1 // Higher priority for notes
        });
      }
    });
  }
  
  // PRIORITY 2: Extract from transcript (lower priority)
  if (transcript && transcript.trim().length > 0) {
    const transcriptChunks = transcript.split('.').filter(chunk => chunk.trim().length > 10);
    
    transcriptChunks.forEach((chunk, index) => {
      const similarity = calculateSimilarity(question, chunk);
      if (similarity > 0.08) { // Higher threshold for transcript (lower priority)
        contentChunks.push({
          content: chunk,
          source: 'transcript',
          relevance: similarity,
          index: index,
          priority: 2 // Lower priority for transcript
        });
      }
    });
  }
  
  // If no relevant chunks found, include notes as fallback
  if (contentChunks.length === 0) {
    if (notes && notes.trim().length > 0) {
      const noteChunks = notes.split('\n\n').filter(chunk => chunk.trim().length > 10);
      if (noteChunks.length > 0) {
        noteChunks.slice(0, 3).forEach((chunk, index) => {
          contentChunks.push({
            content: chunk,
            source: 'notes',
            relevance: 0.02, // Low relevance but still included
            index: index,
            priority: 1
          });
        });
      }
    }
    
    // Only add transcript as fallback if no notes available
    if (contentChunks.length === 0 && transcript && transcript.trim().length > 0) {
      const transcriptChunks = transcript.split('.').filter(chunk => chunk.trim().length > 10);
      if (transcriptChunks.length > 0) {
        transcriptChunks.slice(0, 2).forEach((chunk, index) => {
          contentChunks.push({
            content: chunk,
            source: 'transcript',
            relevance: 0.02,
            index: index,
            priority: 2
          });
        });
      }
    }
  }
  
  // Sort by priority first, then by relevance
  const sortedChunks = contentChunks
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Notes first
      }
      return b.relevance - a.relevance; // Then by relevance
    })
    .slice(0, 8);
  
  return sortedChunks;
};

export const generateQuiz = async (content, contentType = 'video') => {
  let sourceContent;
  if (contentType === 'video') {
    sourceContent = await extractTranscript(content);
  } else {
    sourceContent = content;
  }
  if (!sourceContent || sourceContent.trim().length < 10) {
    throw new Error('Insufficient content for quiz generation');
  }

  const prompt = `
Generate 5 multiple choice questions (with 4 options and the correct answer index) based on the following content:
${sourceContent}

Format as JSON:
{
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": 0
    }
  ]
}
`;

  const result = await openRouterGenerate(prompt);

  // Try to parse the JSON from the result
  try {
    // Sometimes the model may return extra text, so extract JSON block
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : result;
    const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid quiz structure');
    }
    return parsed;
  } catch (e) {
    throw new Error('Failed to parse OpenRouter response as JSON: ' + result);
  }
};

export const generateQuizFromNotes = async (notes) => {
  return generateQuiz(notes, 'notes');
};

// New RAG-based question answering function
export const askQuestion = async (question, moduleData) => {
  try {
    const { notes, transcript } = moduleData;
    
    // Extract relevant content chunks
    const relevantChunks = extractRelevantContent(question, notes, transcript);
    
    // Build context from relevant chunks
    const context = relevantChunks.map(chunk => 
      `[${chunk.source.toUpperCase()}] ${chunk.content}`
    ).join('\n\n');
    
    // Create a more specific system prompt for RAG
    const systemPrompt = `You are an AI assistant helping students with their learning. You have access to the following context from the module's notes and transcript. 

IMPORTANT INSTRUCTIONS:
1. ALWAYS prioritize information from NOTES over transcript content
2. Use the provided context to answer questions comprehensively
3. If the context contains relevant information, use it to provide a detailed answer
4. If the context doesn't contain the specific information requested, clearly state that the information is not available in the provided context
5. Be specific about which parts of the context you're using (NOTES vs TRANSCRIPT)
6. Provide accurate, educational responses
7. Use markdown formatting for better readability
8. When citing sources, clearly indicate whether information comes from NOTES or TRANSCRIPT

Context from the module:
${context}

Please answer the following question based on the context provided above. If you find relevant information in the NOTES, prioritize that over TRANSCRIPT content.`;

    const userPrompt = `Question: ${question}

Please provide a detailed answer using the context provided. Prioritize information from NOTES over TRANSCRIPT. If the context contains relevant information, cite it properly. If the information is not available in the context, clearly state that.`;
    
    // Generate response using OpenRouter
    const response = await openRouterGenerate(userPrompt, systemPrompt);
    
    // Prepare citations
    const citations = relevantChunks
      .filter(chunk => chunk.relevance > 0.03)
      .map(chunk => ({
        content: chunk.content.substring(0, 100) + (chunk.content.length > 100 ? '...' : ''),
        source: chunk.source,
        relevance: chunk.relevance
      }));

    return {
      answer: response,
      citations,
      contextUsed: context.length > 0
    };
  } catch (error) {
    console.error('Error in askQuestion:', error);
    throw new Error('Failed to generate answer');
  }
};