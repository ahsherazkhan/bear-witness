import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import { verifySignedUserId } from '@/lib/signed-cookie';
import { buildAiDetectionPrompt } from '../../../lib/prompt.js';

// Rate limits for non-authenticated users
const GROQ_RATE_LIMIT = {
  PER_MINUTE: 25,
  PER_USER_TOTAL: 10, // Allow 100 requests for anonymous users
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

// For non-authenticated users only
const userRequestStore = new Map();
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
    let { text, visitorId } = body;
    const authHeader = request.headers.get('x-user-id');
    let userId = authHeader ? verifySignedUserId(authHeader) : null;
    if (!text || (!userId && !visitorId)) {
      return new NextResponse(JSON.stringify({ error: 'Missing text or user identification' }), {
        status: 400,
        headers: corsHeaders(origin),
      });
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    let isAuthenticated = false;

    if (userId) {
      // Get user, subscription status, and check counter
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select(
          `
          ai_requests_remaining,
          subscriptions!inner(
            plan_name,
            status
          )
        `,
        )
        .eq('id', userId)
        .eq('subscriptions.status', 'active')
        .single();

      if (customerError || !customer) {
        // Try to get customer without subscription (new user)
        const { data: customerWithoutSub, error: customerWithoutSubError } = await supabase
          .from('customers')
          .select('ai_requests_remaining')
          .eq('id', userId)
          .single();

        if (customerWithoutSubError || !customerWithoutSub) {
          return new NextResponse(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: corsHeaders(origin),
          });
        }

        // New user with 500 requests
        if (true) {
          return new NextResponse(
            JSON.stringify({
              error: 'AI request limit reached. Please upgrade to continue.',
              remaining: 0,
              needsUpgrade: true,
            }),
            {
              status: 429,
              headers: corsHeaders(origin),
            },
          );
        }

        isAuthenticated = true;
      } else {
        // User with active subscription

        if (customer.ai_requests_remaining <= 0) {
          return new NextResponse(
            JSON.stringify({
              error: 'AI request limit reached. Please upgrade to continue.',
              remaining: 0,
              needsUpgrade: true,
            }),
            {
              status: 429,
              headers: corsHeaders(origin),
            },
          );
        }

        isAuthenticated = true;
      }
    } else {
      // Handle non-authenticated users with existing rate limiting
      if (userLimitExceeded(visitorId)) {
        return NextResponse.json(
          {
            error: 'Usage limit reached for this user. Please create an account to continue.',
            remaining: 0,
            limitReached: true,
          },
          { status: 429, headers: corsHeaders(origin) },
        );
      }

      if (groqThrottleExceeded()) {
        return NextResponse.json(
          { error: 'Server is busy. Try again in a few seconds.' },
          { status: 503, headers: corsHeaders(origin) },
        );
      }

      // Track non-authenticated user
      trackUser(visitorId);
      recordGroqRequest();
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "text"' },
        {
          status: 400,
          headers: corsHeaders(origin),
        },
      );
    }

    // Calculate text metrics (existing logic)
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceCount = sentences.length;

    const sentenceLengths = sentences.map((s) => s.split(/\s+/).length);
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 0;
    const sentenceVariance =
      sentenceLengths.length > 1
        ? sentenceLengths.reduce((acc, len) => acc + Math.pow(len - avgSentenceLength, 2), 0) / sentenceLengths.length
        : 0;
    const burstiness = Math.sqrt(sentenceVariance);

    const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^\w]/g, ''))).size;
    const lexicalDiversity = wordCount > 0 ? uniqueWords / wordCount : 0;
    const contractionCount = (text.match(/\b\w+'\w+\b/g) || []).length;
    const avgWordLength =
      wordCount > 0 ? words.reduce((acc, word) => acc + word.replace(/[^\w]/g, '').length, 0) / wordCount : 0;

    const formalConnectors = (
      text.match(/\b(furthermore|moreover|additionally|consequently|therefore|thus|hence)\b/gi) || []
    ).length;
    const listPatterns = (text.match(/\b(first|second|third|finally|in conclusion)\b/gi) || []).length;
    const passiveVoice = (text.match(/\b(is|are|was|were|been|being)\s+\w+ed\b/g) || []).length;

    let score = 0;

    if (process.env.NODE_ENV === 'development') {
      score = Math.floor(Math.random() * (100 - 25 + 1)) + 25;
    } else {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const chatCompletion = await groq.chat.completions.create({
        messages: buildAiDetectionPrompt(text),
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 5,
        stream: false,
      });

      let message = chatCompletion.choices[0].message.content.trim();
      console.log('Raw AI response:', message);

      let aiScore = null;

      const numberMatch = message.match(/\b(\d{1,3})\b/);
      if (numberMatch) {
        const num = parseInt(numberMatch[1]);
        if (num >= 0 && num <= 100) {
          aiScore = num;
        }
      }

      if (aiScore === null) {
        const digitMatch = message.match(/(\d+)/);
        if (digitMatch) {
          let num = parseInt(digitMatch[1]);
          num = Math.max(0, Math.min(100, num));
          aiScore = num;
        }
      }

      if (aiScore === null) {
        console.log('No number found, analyzing response text');
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('human') && !lowerMessage.includes('ai')) {
          aiScore = 15;
        } else if (lowerMessage.includes('ai') && !lowerMessage.includes('human')) {
          aiScore = 85;
        } else {
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

    // Decrement counter for authenticated users AFTER successful AI analysis
    let remainingRequests = null;
    if (isAuthenticated && userId) {
      // First, get the current ai_requests_remaining value
      const { data: currentCustomerData, error: fetchError } = await supabase
        .from('customers')
        .select('ai_requests_remaining')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching customer data:', fetchError);
      } else {
        // Calculate new value by decrementing current value by 1
        const newAiRequestsValue = (currentCustomerData?.ai_requests_remaining || 0) - 1;

        // Update customer's AI requests remaining
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update({ ai_requests_remaining: newAiRequestsValue })
          .eq('id', userId)
          .select('ai_requests_remaining')
          .single();

        if (updateError) {
          console.error('Failed to update counter:', updateError);
        } else {
          remainingRequests = updatedCustomer.ai_requests_remaining;
        }
      }
    }

    const confidence = score > 75 || score < 25 ? 'high' : score > 60 || score < 40 ? 'medium' : 'low';

    let finalScore = score;
    if (wordCount < 10) {
      const uncertainty = Math.floor(Math.random() * 10) - 5;
      finalScore = Math.max(0, Math.min(100, score + uncertainty));
    }

    console.log('Final adjusted score:', finalScore);

    const response = {
      score: Number(finalScore),
      confidence,
      ...(remainingRequests !== null && { remaining: remainingRequests }),
      ...(isAuthenticated === false && { remaining: remainingRequests }),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: corsHeaders(origin),
    });
  } catch (error) {
    console.error('API error:', error);
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
