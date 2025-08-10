import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySignedUserId } from '@/lib/signed-cookie';

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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
  }
  return {};
}

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
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'No token provided',
        },
        {
          status: 400,
          headers: corsHeaders(origin),
        },
      );
    }

    console.log('Verifying token:', token);

    // Verify the token
    let userId;
    try {
      userId = verifySignedUserId(token);
      console.log('Token verified, user ID:', userId);
    } catch (error) {
      console.log('Token verification failed:', error.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token',
        },
        {
          status: 401,
          headers: corsHeaders(origin),
        },
      );
    }

    // Get user data from database
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select(
        `
        id,
        email,
        ai_requests_remaining,
        subscriptions!inner(
          plan_name,
          status,
          billing_cycle
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
        .select('id, email, ai_requests_remaining')
        .eq('id', userId)
        .single();

      if (customerWithoutSubError || !customerWithoutSub) {
        return NextResponse.json(
          {
            success: false,
            error: 'User not found',
          },
          {
            status: 404,
            headers: corsHeaders(origin),
          },
        );
      }

      // New user with 500 requests
      return NextResponse.json(
        {
          success: true,
          user: {
            id: customerWithoutSub.id,
            email: customerWithoutSub.email,
            ai_requests_remaining: customerWithoutSub.ai_requests_remaining,
            subscription: null,
          },
        },
        {
          headers: corsHeaders(origin),
        },
      );
    }

    // User with active subscription
    const subscription = customer.subscriptions[0];

    return NextResponse.json(
      {
        success: true,
        user: {
          id: customer.id,
          email: customer.email,
          ai_requests_remaining: customer.ai_requests_remaining,
          subscription: {
            plan_name: subscription.plan_name,
            billing_cycle: subscription.billing_cycle,
            status: subscription.status,
          },
        },
      },
      {
        headers: corsHeaders(origin),
      },
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
        headers: corsHeaders(origin),
      },
    );
  }
}
