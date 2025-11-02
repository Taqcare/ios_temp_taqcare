
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        if (data.session?.user) {
          setUser(data.session.user);
          
          // Check if this is a new user (first login)
          const isNewUser = data.session.user.user_metadata?.is_new_user;
          console.log("Initialize auth - is new user:", isNewUser);
          
          if (isNewUser && data.session.user.id) {
            // For new users, make sure onboarding is not marked as completed
            localStorage.removeItem(`onboarding_completed_${data.session.user.id}`);
            
            // Update user metadata to remove the new user flag
            await supabase.auth.updateUser({
              data: { is_new_user: false }
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state change event:", event);
      setSession(newSession);
      
      if (newSession?.user) {
        setUser(newSession.user);
        
        // Check for new users on login events
        if (event === 'SIGNED_IN') {
          const isNewUser = newSession.user.user_metadata?.is_new_user;
          console.log("Sign in event - is new user:", isNewUser);
          
          if (isNewUser) {
            // For new users, make sure onboarding is not marked as completed
            localStorage.removeItem(`onboarding_completed_${newSession.user.id}`);
            
            // Update user metadata to remove the new user flag after first login
            setTimeout(() => {
              supabase.auth.updateUser({
                data: { is_new_user: false }
              });
            }, 0);
          }
        }
        
        // Handle password recovery events
        if (event === 'PASSWORD_RECOVERY') {
          console.log("Password recovery event detected");
          // The reset password form will handle the rest
        }
      } else {
        setUser(null);
      }
      
      // If logout event occurs, ensure state is reset
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Check if there's a current session before attempting to sign out
      const { data: currentSession } = await supabase.auth.getSession();
      
      if (currentSession.session) {
        console.log("Signing out with active session");
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        if (error) throw error;
      } else {
        console.log("No active session found, clearing local state");
        // If no session exists, just clear the local state
        setSession(null);
        setUser(null);
      }
    } catch (error: any) {
      console.error('Error signing out:', error);
      
      // If the error is about missing session, just clear local state
      if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
        console.log("Session already missing, clearing local state");
        setSession(null);
        setUser(null);
        return; // Don't throw the error, just clear state
      }
      
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
