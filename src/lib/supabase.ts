import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Provide a clearer error early if env is missing
  // eslint-disable-next-line no-console
  console.error('Missing Supabase env. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const allowAutoApprove = (import.meta.env.VITE_ALLOW_AUTO_APPROVE as string | undefined) === 'true';

export interface EmailSubmission {
  id?: string;
  email: string;
  name: string;
  prize_won: string;
  created_at?: string;
}

export const saveEmailSubmission = async (data: Omit<EmailSubmission, 'id' | 'created_at'>) => {
  // Upsert by email: keep a single row per email; update prize when present
  const { data: existing, error: selectError } = await supabase
    .from('email_submissions')
    .select('id, email, name, prize_won')
    .eq('email', data.email.toLowerCase())
    .maybeSingle();
  if (selectError) throw selectError;

  if (!existing) {
    const { data: inserted, error: insertError } = await supabase
      .from('email_submissions')
      .insert([{ ...data, email: data.email.toLowerCase() }])
      .select()
      .single();
    if (insertError) throw insertError;
    return inserted;
  }

  // Update existing if prize changed from 'pending'
  const newPrize = data.prize_won ?? existing.prize_won;
  const newName = data.name ?? existing.name;
  const { data: updated, error: updateError } = await supabase
    .from('email_submissions')
    .update({ prize_won: newPrize, name: newName })
    .eq('id', existing.id)
    .select()
    .single();
  if (updateError) throw updateError;
  return updated;
};

export const isEmailAllowed = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('allowed_emails')
    .select('email')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return !!data;
};

export const insertAllowedEmail = async (email: string) => {
  const normalized = email.toLowerCase();
  const { data, error } = await supabase
    .from('allowed_emails')
    .upsert([{ email: normalized }], { onConflict: 'email' })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const upsertAllowedEmails = async (emails: string[]) => {
  if (emails.length === 0) return [];
  const rows = Array.from(new Set(emails.map((e) => e.toLowerCase()))).map((email) => ({ email }));
  const { data, error } = await supabase
    .from('allowed_emails')
    .upsert(rows, { onConflict: 'email', ignoreDuplicates: true })
    .select();
  if (error) throw error;
  return data;
};

export const getEmailSubmission = async (email: string) => {
  const { data, error } = await supabase
    .from('email_submissions')
    .select('id, email, name, prize_won, created_at')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data;
};