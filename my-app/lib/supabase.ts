import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pnxcyuwebcqrxkqbnzcd.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBueGN5dXdlYmNxcnhrcWJuemNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NTc2NTcsImV4cCI6MjA2MDIzMzY1N30.93I_4gQjK88xJM4eLutkjtqtQ_n_xe32qJd2YcajjZI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
