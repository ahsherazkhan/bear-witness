import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout';
import { createClient } from '@/utils/supabase/server-internal';
import { redirect } from 'next/navigation';

interface Props {
  children: ReactNode;
}

export default async function Layout({ children }: Props) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  console.log('Dashboard layout - Current user:', data.user?.email);

  if (!data.user) {
    redirect('/login');
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}
