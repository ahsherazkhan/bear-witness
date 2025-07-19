import { createClient } from '@/utils/supabase/server';

export async function getUser() {
  const supabase = await createClient();

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
