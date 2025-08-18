import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ixqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MzQ0MDAsImV4cCI6MjA1MTUxMDQwMH0.example_key_here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface EmailSubmission {
  id?: string;
  email: string;
  name: string;
  prize_won: string;
  created_at?: string;
}

export const saveEmailSubmission = async (data: Omit<EmailSubmission, 'id' | 'created_at'>) => {
  const { data: result, error } = await supabase
    .from('email_submissions')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};