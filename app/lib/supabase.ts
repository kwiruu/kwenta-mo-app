import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Cache for access token to avoid calling getSession on every request
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Listen for auth changes to update cached token
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    cachedToken = session.access_token;
    // Set expiry 5 minutes before actual expiry to be safe
    tokenExpiry = (session.expires_at ?? 0) * 1000 - 5 * 60 * 1000;
  } else {
    cachedToken = null;
    tokenExpiry = 0;
  }
});

// Auth helper functions
export const signUp = async (email: string, password: string, name: string) => {
  const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${redirectUrl}/login`,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${redirectUrl}/dashboard`,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

// Get access token for API calls - uses cache to avoid slow getSession calls
export const getAccessToken = async (): Promise<string | null> => {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // Otherwise fetch fresh session (this updates the cache via onAuthStateChange)
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      cachedToken = data.session.access_token;
      tokenExpiry = (data.session.expires_at ?? 0) * 1000 - 5 * 60 * 1000;
      return cachedToken;
    }
  } catch (error) {
    console.error("Error getting session:", error);
  }
  return null;
};

// Clear token cache (call on logout)
export const clearTokenCache = () => {
  cachedToken = null;
  tokenExpiry = 0;
};
