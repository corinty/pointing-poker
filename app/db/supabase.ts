import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://pgjpiljriymqdpafzqyt.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnanBpbGpyaXltcWRwYWZ6cXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcwOTIzMzgsImV4cCI6MjAyMjY2ODMzOH0.NztC8KPo7ELF2QQ9G1IknZ38gxBZjylbbOvvhEYkZEk';
export const supabase = createClient(supabaseUrl, supabaseKey || '');
