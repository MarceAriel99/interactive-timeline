import React, { createContext, useState, useEffect, useContext } from 'react';
import supabase from '../supabase/supabaseClient';
import local_avatar from '../resources/default-profile-picture.jpg';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the access token from the URL
  useEffect(() => {
    const handleAuth = async () => {

      if (process.env.REACT_APP_CURRENT_ENV === "development") {
        setSession({ access_token: "local_token", user: { user_metadata: { full_name: "LocalUser", avatar_url: local_avatar } } });
        setLoading(false);
        return;
      }

      var access_token = null;
      var session = null;
      
      //Check if there is already a session or error
      var { data, error } = await supabase.auth.getSession();
      session = data.session;
      if(error) {
        console.error('Error getting session:', error.message);
        return;
      }
      
      if (!session) {
        console.log('No session found in storage. Checking URL for access token...');
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(hash.replace('#', '?'));
        access_token = searchParams.get('access_token');

        if (!access_token) {
          console.log('No access token found in URL');
          return;
        }

        var { data: session, error } = await supabase.auth.getUser(access_token);
        if(error) {
          console.error('Error getting user:', error.message);
          return;
        }
      }

      const user = session.user;

      // Check if user email is in the allowed_users list
      const { data: allowedUser, error: allowedUserError } = await supabase
        .schema('security')
        .from('allowed_users')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (allowedUserError || !allowedUser) {
        alert('You (' + user.email  + ') are not allowed to access this application. Please contact the administrator.');
      }
      else{
        setSession({ access_token, user });
      }

      setLoading(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      
    };

    handleAuth();
  }, []);

  const handleSignIn = async () => {

    if (process.env.REACT_APP_CURRENT_ENV === "development") {
      return;
    }
    
    // Initiate sign-in with OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: process.env.REACT_APP_SUPABSE_AUTH_CALLBACK_URL,
      },
    });

    if (error) {
      console.error('Error signing in:', error.message);
      return;
    }

    // Redirect to the OAuth provider
    window.location.href = data.url;
  };

  const handleSignOut = async () => {

    if (process.env.REACT_APP_CURRENT_ENV === "development") {
      setSession(null);
      return;
    }

    // Sign out
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error.message);
      return;
    }

    console.log('Signed out successfully from Supabase');
    setSession(null);
  };

  const value = {
    session,
    loading,
    handleSignIn,
    handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
