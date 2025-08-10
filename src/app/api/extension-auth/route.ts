import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGINS = [
  'chrome-extension://obhbibkigecipphgofligjlkjnchndbi',
  'https://www.linkedin.com',
  'http://localhost:3000',
];

function corsHeaders(origin) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    const { authToken } = await request.json();

    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No auth token provided',
        },
        {
          status: 400,
          headers: corsHeaders(origin),
        },
      );
    }

    console.log('Extension auth - Received auth token:', authToken);

    // Verify the auth token with Supabase
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authToken);

    if (authError || !user) {
      console.log('Extension auth - Auth error:', authError);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid auth token',
          authenticated: false,
        },
        {
          status: 401,
          headers: corsHeaders(origin),
        },
      );
    }

    console.log('Extension auth - User authenticated:', user.id);

    // Get user's customer data and remaining AI requests
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
      .eq('id', user.id)
      .eq('subscriptions.status', 'active')
      .single();

    if (customerError) {
      // Try to get customer without subscription (new user)
      const { data: customerWithoutSub, error: customerWithoutSubError } = await supabase
        .from('customers')
        .select('id, email, ai_requests_remaining')
        .eq('id', user.id)
        .single();

      if (customerWithoutSubError || !customerWithoutSub) {
        return NextResponse.json(
          {
            success: false,
            error: 'User not found in database',
            authenticated: false,
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
          authenticated: true,
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
        authenticated: true,
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
    console.error('Extension auth error:', error);
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
