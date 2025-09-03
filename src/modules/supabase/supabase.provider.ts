import { createClient } from '@supabase/supabase-js';

export const SUPABASE_TOKEN = Symbol('SUPABASE_TOKEN');

export const SupabaseProvider = {
  provide: SUPABASE_TOKEN,
  useFactory: () => {
    return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  },
};
