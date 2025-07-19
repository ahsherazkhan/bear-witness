import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function backfillCustomers() {
  try {
    // Get all users from auth.users
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching users:', authError);
      return;
    }

    console.log(`Found ${users.users.length} users in auth.users`);

    // Insert each user into customers table
    for (const user of users.users) {
      const { error: insertError } = await supabase.from('customers').upsert(
        {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.username || user.user_metadata?.full_name || 'Unknown',
          company: user.user_metadata?.company || null,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        {
          onConflict: 'id',
        },
      );

      if (insertError) {
        console.error(`Error inserting user ${user.email}:`, insertError);
      } else {
        console.log(`✅ Inserted user: ${user.email}`);
      }
    }

    console.log('Backfill completed!');
  } catch (error) {
    console.error('Backfill error:', error);
  }
}

backfillCustomers();
