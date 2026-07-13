import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SignInPage } from './SignInPage';

interface User {
  name?: string;
  email?: string;
  avatar?: string;
}

interface AuthGuardProps {
  children: (user: User, signOut: () => void) => React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 1. Check Supabase session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          setUser({
            name: u.user_metadata?.full_name || u.user_metadata?.name,
            email: u.email || undefined,
            avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture,
          });
          setChecking(false);
          return;
        }
      } catch {
        // Supabase not configured — fall through to demo mode
      }

      // 2. Check demo user stored in localStorage
      const demoUser = localStorage.getItem('sh_demo_user');
      if (demoUser) {
        try {
          setUser(JSON.parse(demoUser));
        } catch { /* ignore */ }
      }
      setChecking(false);
    };

    checkSession();

    // 3. Listen for auth state changes (Google OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          name: u.user_metadata?.full_name || u.user_metadata?.name,
          email: u.email || undefined,
          avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);



  const handleSignOut = async () => {
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    localStorage.removeItem('sh_demo_user');
    setUser(null);
  };

  // Loading state
  if (checking) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="h-1 w-full absolute top-0 bg-gradient-to-r from-[#0C2461] via-[#C9A84C] to-[#0C2461]" />
        <div className="w-10 h-10 rounded-full border-2 border-[#0C2461] border-t-[#C9A84C] animate-spin" />
        <span className="text-sm text-[#6B7280]">Loading ClearPort AI…</span>
      </div>
    );
  }

  if (!user) {
    return <SignInPage />;
  }

  return <>{children(user, handleSignOut)}</>;
};
