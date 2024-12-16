import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://txeyvnhraorruszptskw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4ZXl2bmhyYW9ycnVzenB0c2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNDE4MzYsImV4cCI6MjA0OTkxNzgzNn0.nm1ioTv9vUNhjuV3JJ0_Au9tjd-1_S-TER2hI_ygZao';

export const supabase = createClient(supabaseUrl, supabaseKey);