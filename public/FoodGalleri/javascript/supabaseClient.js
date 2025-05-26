
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';


const supabaseUrl = 'https://bupuawehdwgqgstylfzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1cHVhd2VoZHdncWdzdHlsZnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzkxNTQsImV4cCI6MjA2MjExNTE1NH0.W8yf7BOXJuYDhElohu0S_3DV6S8h1tJNye2Rc1L3z-w';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;