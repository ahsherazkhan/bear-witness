import { redirect } from 'next/navigation';

export default function DashboardRedirect() {
  redirect('/dashboard/subscriptions');
  return null;
}
