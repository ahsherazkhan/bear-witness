'use client';
import { useEffect } from 'react';

export function SetPurchaseCookie() {
  useEffect(() => {
    fetch('/checkout/set-purchase-cookie');
  }, []);

  return null;
}
