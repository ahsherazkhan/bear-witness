import { createClient } from '@/utils/supabase/client';

export async function getUserClient() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user data from the customers table
  const { data: userData, error } = await supabase.from('customers').select('*').eq('auth_id', user.id).single();

  if (error) {
    console.error('Error fetching user data:', error);
    return null;
  }

  return userData;
}
