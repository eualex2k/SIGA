import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole, UserRole } from "@/lib/roles";

/**
 * Hook that provides the current Supabase auth session, user object, role and loading state.
 * It also registers authentication events in the audit_logs table via the authLogger helper.
 */
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(UserRole.VIEWER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial check
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Failed to get session", error);
        setLoading(false);
        return;
      }
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      setRole(sessionUser ? getUserRole(sessionUser) : UserRole.VIEWER);
      setLoading(false);
    };
    fetchSession();

    // Listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Log authentication events
        try {
          const { logAuthEvent } = await import("@/lib/authLogger");
          await logAuthEvent(event, session?.user ?? null);
        } catch (_) {
          // ignore if logger not yet available
        }
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          const u = session?.user ?? null;
          setUser(u);
          setRole(u ? getUserRole(u) : UserRole.VIEWER);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setRole(UserRole.VIEWER);
        } else if (event === "USER_UPDATED") {
          const u = session?.user ?? null;
          setUser(u);
          setRole(u ? getUserRole(u) : UserRole.VIEWER);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return { user, role, loading };
};
