import {createClient} from '@supabase/supabase-js';
import {Database} from './database.types';

const supabaseUrl = 'https://pgjpiljriymqdpafzqyt.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
export const supabase = createClient<Database>(supabaseUrl, supabaseKey || '');
