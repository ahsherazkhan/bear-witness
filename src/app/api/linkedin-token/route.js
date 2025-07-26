import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

//TODO: This is not needed for now as we will use supabase flow
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'chrome-extension://obhbibkigecipphgofligjlkjnchndbi',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  return handleLinkedInAuth(code);
}

export async function POST(request) {
  const body = await request.json();
  const code = body.code;

  return handleLinkedInAuth(code);
}

async function handleLinkedInAuth(code) {
  if (!code) {
    return NextResponse.json({ error: 'Authorization code is required' }, { status: 400, headers: CORS_HEADERS });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing LinkedIn OAuth configuration');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500, headers: CORS_HEADERS });
  }

  try {
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'https://obhbibkigecipphgofligjlkjnchndbi.chromiumapp.org',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      const errorData = await tokenRes.text();
      console.error('LinkedIn token exchange failed:', errorData);
      return NextResponse.json(
        { error: 'Failed to exchange code for token', details: errorData },
        { status: tokenRes.status, headers: CORS_HEADERS },
      );
    }

    const { access_token } = await tokenRes.json();

    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!profileRes.ok) {
      const errorData = await profileRes.text();
      console.error('Failed to fetch user profile:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch user profile', details: errorData },
        { status: profileRes.status, headers: CORS_HEADERS },
      );
    }

    const { email, name, sub: linkedinId } = await profileRes.json();

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    let userId;
    let username;

    // Check if user exists using listUsers
    const { data: userList, error: getUserError } = await supabase.auth.admin.listUsers();
    if (getUserError) {
      return NextResponse.json(
        { error: 'Failed to check existing users', details: getUserError.message },
        { status: 500, headers: CORS_HEADERS },
      );
    }

    const existingUser = userList?.users?.find((user) => user.email === email);
    if (existingUser) {
      userId = existingUser.id;
      username = existingUser.user?.user_metadata?.name || name;
    } else {
      // Create new user and mark as LinkedIn extension user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          name,
          linkedinId,
          source: 'linkedin_extension',
          created_via: 'extension',
        },
      });

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create user', details: createError.message },
          { status: 500, headers: CORS_HEADERS },
        );
      }

      userId = newUser.user?.id;
      username = newUser.user?.user_metadata?.name || name;
    }

    // Only return username and user ID
    return NextResponse.json(
      {
        userId: userId,
        username: username,
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
