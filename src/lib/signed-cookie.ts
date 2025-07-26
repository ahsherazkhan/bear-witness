// lib/signed-cookie.ts
import crypto from 'crypto';

const secret = process.env.COOKIE_SECRET || 'default_secret_key';

export function signUserId(userId: string): string {
  const signature = crypto.createHmac('sha256', secret).update(userId).digest('hex');

  return `${userId}.${signature}`;
}

export function verifySignedUserId(signed: string): string | null {
  const [userId, signature] = signed.split('.');
  const expected = crypto.createHmac('sha256', secret).update(userId).digest('hex');

  return expected === signature ? userId : null;
}
