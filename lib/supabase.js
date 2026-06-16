import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fdrfjdbvhoerwpupiaog.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcmZqZGJ2aG9lcndwdXBpYW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTY4MTMsImV4cCI6MjA5NzAzMjgxM30.FNEZ_ajZCLW2UHZdgqcLXNjQE8z8-d3QEDJnlqyilTQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);