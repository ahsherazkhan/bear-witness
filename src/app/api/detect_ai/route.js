import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import { verifySignedUserId } from '@/lib/signed-cookie';

// We have to replace this with real DB if users explode because current setup will reset the users if server restarts
const GROQ_RATE_LIMIT = {
  PER_MINUTE: 25,
  PER_USER_TOTAL: 5,
};

const ALLOWED_ORIGINS = [
  'chrome-extension://obhbibkigecipphgofligjlkjnchndbi',
  'https://www.linkedin.com',
  'http://localhost:3000',
];

function corsHeaders(origin) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, X-Timestamp, X-Signature, X-User-Id',
    };
  }
  return {};
}

const userRequestStore = new Map(); // visitorId -> [timestamps]
const globalGroqRequestTimestamps = [];

function now() {
  return Date.now();
}

function cleanupOldTimestamps(store, windowMs) {
  const cutoff = now() - windowMs;
  return store.filter((t) => t > cutoff);
}

function trackUser(visitorId) {
  const count = userRequestStore.get(visitorId) || 0;
  userRequestStore.set(visitorId, count + 1);
}

function userLimitExceeded(visitorId) {
  const count = userRequestStore.get(visitorId) || 0;
  return count >= GROQ_RATE_LIMIT.PER_USER_TOTAL;
}

function groqThrottleExceeded() {
  const cleaned = cleanupOldTimestamps(globalGroqRequestTimestamps, 60 * 1000);
  globalGroqRequestTimestamps.length = 0;
  globalGroqRequestTimestamps.push(...cleaned);
  return cleaned.length >= GROQ_RATE_LIMIT.PER_MINUTE;
}

function recordGroqRequest() {
  globalGroqRequestTimestamps.push(now());
}
// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

export async function POST(request) {
  const origin = request.headers.get('origin');
  try {
    const body = await request.json();
    const { text, visitorId } = body;
    const signedHeader = request.headers.get('x-user-id');
    const userId = signedHeader ? verifySignedUserId(signedHeader) : null;
    if (userId) {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

      const { data } = await supabase.auth.admin.getUserById(userId);
      // TODO: count logic on backend
      if (data?.user) {
        return new NextResponse(JSON.stringify({ error: 'Authenticated users must use the pro endpoint' }), {
          status: 403,
          headers: corsHeaders(origin),
        });
      }
    }

    if (!text || !visitorId) {
      return new NextResponse(JSON.stringify({ error: 'Missing text or visitorId' }), {
        status: 400,
        headers: corsHeaders(origin),
      });
    }

    if (userLimitExceeded(visitorId)) {
      return NextResponse.json(
        { error: 'Usage limit reached for this user' },
        { status: 429, headers: corsHeaders(origin) },
      );
    }

    if (groqThrottleExceeded()) {
      return NextResponse.json(
        { error: 'Server is busy. Try again in a few seconds.' },
        { status: 503, headers: corsHeaders(origin) },
      );
    }

    // track usage
    trackUser(visitorId);
    recordGroqRequest();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "text"' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }

    // Calculate meaningful linguistic features
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceCount = sentences.length;

    // Sentence length variation (burstiness)
    const sentenceLengths = sentences.map((s) => s.split(/\s+/).length);
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 0;
    const sentenceVariance =
      sentenceLengths.length > 1
        ? sentenceLengths.reduce((acc, len) => acc + Math.pow(len - avgSentenceLength, 2), 0) / sentenceLengths.length
        : 0;
    const burstiness = Math.sqrt(sentenceVariance);

    // Lexical diversity (unique words / total words)
    const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^\w]/g, ''))).size;
    const lexicalDiversity = wordCount > 0 ? uniqueWords / wordCount : 0;

    // Contractions and informal markers
    const contractionCount = (text.match(/\b\w+'\w+\b/g) || []).length;

    // Average word length
    const avgWordLength =
      wordCount > 0 ? words.reduce((acc, word) => acc + word.replace(/[^\w]/g, '').length, 0) / wordCount : 0;

    // AI-typical patterns
    const formalConnectors = (
      text.match(/\b(furthermore|moreover|additionally|consequently|therefore|thus|hence)\b/gi) || []
    ).length;
    const listPatterns = (text.match(/\b(first|second|third|finally|in conclusion)\b/gi) || []).length;
    const passiveVoice = (text.match(/\b(is|are|was|were|been|being)\s+\w+ed\b/g) || []).length;

    // More nuanced prompts that encourage middle-range scores
    const nuancedPrompts = [
      `Analyze this text for AI vs human writing patterns. Consider that most text falls somewhere in between. Rate 0-100 where 0=clearly human, 30=probably human, 50=uncertain, 70=probably AI, 100=clearly AI: "${text.substring(0, 300)}${text.length > 300 ? '...' : ''}"\n\nScore:`,
      `Rate the likelihood this text was AI-generated. Use the full 0-100 scale - avoid extremes unless very certain. Most text scores between 20-80: "${text.substring(0, 300)}${text.length > 300 ? '...' : ''}"\n\nNumber:`,
      `AI detection confidence score (0-100). Consider writing style, vocabulary, structure. Be nuanced - few texts are 0 or 100: "${text.substring(0, 300)}${text.length > 300 ? '...' : ''}"\n\nAnswer:`,
      `Score this text's AI probability 0-100. Look for subtle patterns. Most real text scores 25-75 range: "${text.substring(0, 300)}${text.length > 300 ? '...' : ''}"\n\nScore:`,
    ];

    const prompt = nuancedPrompts[Math.floor(Math.random() * nuancedPrompts.length)];

    // System prompt that encourages more nuanced scoring
    const systemPrompt = `You are an expert AI detection system. Respond with ONLY a number from 0 to 100. Be nuanced - most text isn't completely human (0) or completely AI (100). Use the full range: 0-20=very human, 20-40=probably human, 40-60=mixed/uncertain, 60-80=probably AI, 80-100=very AI.`;

    let score = 0;

    if (process.env.NODE_ENV === 'development') {
      score = Math.floor(Math.random() * (100 - 25 + 1)) + 25;
    } else {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        model: 'llama3-8b-8192',
        temperature: 0.3, // Moderate temperature for nuanced responses
        max_tokens: 5,
        stream: false,
      });

      let message = chatCompletion.choices[0].message.content.trim();
      console.log('Raw AI response:', message);

      // Enhanced parsing with multiple attempts
      let aiScore = null;

      // Method 1: Extract first number found
      const numberMatch = message.match(/\b(\d{1,3})\b/);
      if (numberMatch) {
        const num = parseInt(numberMatch[1]);
        if (num >= 0 && num <= 100) {
          aiScore = num;
        }
      }

      // Method 2: If still no valid score, try extracting any digits
      if (aiScore === null) {
        const digitMatch = message.match(/(\d+)/);
        if (digitMatch) {
          let num = parseInt(digitMatch[1]);
          // Clamp to valid range
          num = Math.max(0, Math.min(100, num));
          aiScore = num;
        }
      }

      // Method 3: Last resort - analyze response text
      if (aiScore === null) {
        console.log('No number found, analyzing response text');
        const lowerMessage = message.toLowerCase();

        // Look for definitive words
        if (lowerMessage.includes('human') && !lowerMessage.includes('ai')) {
          aiScore = 15;
        } else if (lowerMessage.includes('ai') && !lowerMessage.includes('human')) {
          aiScore = 85;
        } else {
          // Retry with a different model or approach
          console.log('Retrying with simplified prompt');
          try {
            const retryCompletion = await groq.chat.completions.create({
              messages: [
                { role: 'system', content: 'Return only a number 0-100. Nothing else.' },
                { role: 'user', content: `AI detection score for: "${text.substring(0, 100)}..."` },
              ],
              model: 'llama3-8b-8192',
              temperature: 0,
              max_tokens: 3,
            });

            const retryMessage = retryCompletion.choices[0].message.content.trim();
            const retryMatch = retryMessage.match(/(\d+)/);
            aiScore = retryMatch ? Math.max(0, Math.min(100, parseInt(retryMatch[1]))) : 50;
          } catch {
            console.log('Retry failed, using heuristic score');
            aiScore = calculateHeuristicScore(text, {
              wordCount,
              sentenceCount,
              burstiness,
              lexicalDiversity,
              avgWordLength,
              contractionCount,
              formalConnectors,
              listPatterns,
              passiveVoice,
            });
          }
        }
      }

      score = aiScore;
    }

    // Determine confidence based on how decisive the score is
    const confidence = score > 75 || score < 25 ? 'high' : score > 60 || score < 40 ? 'medium' : 'low';

    // Add small random variation only for very short texts (where AI might be less reliable)
    let finalScore = score;
    if (wordCount < 10) {
      const uncertainty = Math.floor(Math.random() * 10) - 5; // -5 to +5
      finalScore = Math.max(0, Math.min(100, score + uncertainty));
    }

    console.log('Final adjusted score:', finalScore);

    return NextResponse.json(
      {
        score: Number(finalScore),
        confidence,
      },
      {
        status: 200,
        headers: corsHeaders(origin),
      },
    );
  } catch (error) {
    console.error('Groq API error:', error);
    return NextResponse.json(
      { error: 'AI analysis failed', details: error.message },
      {
        status: 500,
        headers: corsHeaders(origin),
      },
    );
  }
}

// Fallback heuristic scoring when AI model fails
function calculateHeuristicScore(text, metrics) {
  const {
    wordCount,
    sentenceCount,
    burstiness,
    lexicalDiversity,
    avgWordLength,
    contractionCount,
    formalConnectors,
    listPatterns,
    passiveVoice,
  } = metrics;

  let score = 50; // Start neutral

  // Human indicators (decrease score)
  if (contractionCount > 0) score -= 15;
  if (burstiness > 4) score -= 10;
  if (lexicalDiversity > 0.7) score -= 10;
  if (avgWordLength < 4.5) score -= 8;

  // AI indicators (increase score)
  if (formalConnectors > 1) score += 15;
  if (listPatterns > 0) score += 10;
  if (passiveVoice > wordCount * 0.03) score += 10;
  if (burstiness < 2 && sentenceCount > 3) score += 12;

  return Math.max(0, Math.min(100, score));
}
