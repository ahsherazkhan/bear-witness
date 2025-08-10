'use client';

export function DebugEnv() {
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg mb-4">
      <h3 className="font-bold mb-2">Environment Variables Debug (Production)</h3>
      <div className="text-sm space-y-1">
        <div>
          <strong>NEXT_PUBLIC_PADDLE_ENV:</strong> {process.env.NEXT_PUBLIC_PADDLE_ENV || 'NOT SET'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_PADDLE_CLIENT_TOKEN:</strong>{' '}
          {process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ? 'SET' : 'NOT SET'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_PRICE_ID_STARTER_MONTHLY:</strong>{' '}
          {process.env.NEXT_PUBLIC_PRICE_ID_STARTER_MONTHLY || 'NOT SET'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_PRICE_ID_STARTER_YEARLY:</strong>{' '}
          {process.env.NEXT_PUBLIC_PRICE_ID_STARTER_YEARLY || 'NOT SET'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY:</strong> {process.env.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY || 'NOT SET'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_PRICE_ID_PRO_YEARLY:</strong> {process.env.NEXT_PUBLIC_PRICE_ID_PRO_YEARLY || 'NOT SET'}
        </div>
      </div>
    </div>
  );
}
