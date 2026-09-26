import { create } from 'zustand';
import { supabase } from '../lib/supabase';

/**
 * useAuthStore — global auth state managed by Zustand.
 *
 * Fields:
 *   session  — raw Supabase session (null if logged out)
 *   user     — { id, email, role, fullName } derived from session + profile
 *   loading  — true while the initial session is being resolved
 *
 * Actions:
 *   initialize()  — called once at app mount to restore session
 *   setSession()  — called by Supabase onAuthStateChange listener
 *   signOut()     — logs user out and clears state
 */
const useAuthStore = create((set, get) => ({
  session: null,
  user:    null,
  loading: true,

  /**
   * Restore session on app load and subscribe to auth state changes.
   * Returns the unsubscribe function — call it on unmount.
   */
  initialize: async () => {
    // Get current session (from localStorage / cookie)
    const { data: { session } } = await supabase.auth.getSession();
    await get()._resolveSession(session);

    // Subscribe to future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await get()._resolveSession(session);
      }
    );

    return () => subscription.unsubscribe();
  },

  /**
   * Internal — resolves a raw Supabase session into a user profile.
   */
  _resolveSession: async (session) => {
    if (!session) {
      set({ session: null, user: null, loading: false });
      return;
    }

    // Fetch user_profiles row for role + display name
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, full_name')
      .eq('id', session.user.id)
      .single();

    set({
      session,
      user: {
        id:       session.user.id,
        email:    session.user.email,
        role:     profile?.role     ?? 'staff',
        fullName: profile?.full_name ?? '',
        avatarUrl: session.user.user_metadata?.avatar_url || '',
      },
      loading: false,
    });
  },

  /**
   * Sign the current user out.
   */
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));

export default useAuthStore;
