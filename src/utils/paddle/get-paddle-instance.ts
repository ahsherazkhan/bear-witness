import { Environment, LogLevel, Paddle, PaddleOptions } from '@paddle/paddle-node-sdk';

export function getPaddleInstance() {
  const apiKey = process.env.PADDLE_API_KEY;
  const environment = process.env.PADDLE_ENV as Environment;

  if (!apiKey) {
    throw new Error('Paddle API key is missing');
  }

  const paddleOptions: PaddleOptions = {
    environment: environment ?? Environment.sandbox,
    logLevel: LogLevel.error,
  };

  return new Paddle(apiKey, paddleOptions);
}
