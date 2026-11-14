/* Supabase connection for cross-device sync.
   Fill in both values from Supabase: Project Settings > API.
   The anon (public) key is safe to ship in a web page: row-level security
   in supabase/schema.sql keeps each account's data private.
   Leave them empty to run in local-only mode (data stays on this device). */
window.APP_CONFIG = {
  supabaseUrl: "https://imqkodhjuokkginrxljq.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcWtvZGhqdW9ra2dpbnJ4bGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2ODMyMTksImV4cCI6MjExMDI1OTIxOX0.Nedmhs-0iI2NZWCHHT91OFB6sRpmp5OQsfokg2DDLX4"
};
