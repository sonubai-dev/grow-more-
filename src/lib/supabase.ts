import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yrhyisgvjgvpogtawuze.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaHlpc2d2amd2cG9ndGF3dXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NDkzNjUsImV4cCI6MjExMDEyNTM2NX0.IzfqGOmDAkD6LjErqdaZCVrcCRBAg4ujOjGrcmt7S7g';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
