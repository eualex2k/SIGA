import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

/**
 * Insert an authentication event into the `audit_logs` table.
 * Event types: SIGNED_IN, SIGNED_OUT, USER_UPDATED, etc.
 */
export async function logAuthEvent(event: string, user: any) {
  const payload = {
    action: event.toUpperCase(),
    user_id: user?.id ?? null,
    details: JSON.stringify({ email: user?.email, metadata: user?.user_metadata }),
  };

  // Insert only, no UPDATE/DELETE policies on audit_logs.
  const { error } = await supabase.from('audit_logs').insert(payload);
  if (error) {
    console.error('Failed to log auth event', error);
  }
}
