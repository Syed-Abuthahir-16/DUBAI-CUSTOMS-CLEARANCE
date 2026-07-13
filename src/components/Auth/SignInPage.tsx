import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

// ClearPort AI logo for sign-in page
const ClearPortLogo: React.FC = () => (
  <div className="flex flex-col items-center gap-3">
    <svg width="84" height="84" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crescent/Arc */}
      <path 
        d="M38 78C21.5 68.5 19 46.5 32 30C46.5 11.5 73.5 16 82.5 35" 
        stroke="#C9A84C" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      
      {/* Container Ship Hull */}
      <path 
        d="M26 62.5C28 65 31.5 67 36.5 68C43.5 69.5 59.5 70.5 76 66.5L82 60L54 53.5L34 56.5L26 62.5Z" 
        fill="#C9A84C" 
      />
      <path 
        d="M23 60C32.5 71 52.5 73 72.5 66.5C76 65.5 83 62 85 59L82.5 56.5C75 59.5 68.5 60.5 53 58C36.5 55.5 25 58 23 60Z" 
        fill="#C9A84C" 
      />
      
      {/* Containers Block */}
      {/* Row 1 */}
      <rect x="36" y="47" width="8" height="6" rx="1" fill="#C9A84C" />
      <rect x="45" y="45.5" width="8" height="6" rx="1" fill="#C9A84C" />
      <rect x="54" y="44" width="8" height="6" rx="1" fill="#C9A84C" />
      <rect x="63" y="42.5" width="8" height="6" rx="1" fill="#C9A84C" />
      <rect x="72" y="41" width="8" height="6" rx="1" fill="#C9A84C" />
      {/* Row 2 */}
      <rect x="39" y="40.5" width="8" height="6" rx="1" fill="#C9A84C" />
      <rect x="48" y="39" width="8" height="6" rx="1" fill="#C9A84C" />
      <rect x="57" y="37.5" width="8" height="6" rx="1" fill="#C9A84C" />
      <rect x="66" y="36" width="8" height="6" rx="1" fill="#C9A84C" />
      {/* Row 3 */}
      <rect x="42" y="34" width="8" height="6" rx="1" fill="#C9A84C" />
      <rect x="51" y="32.5" width="8" height="6" rx="1" fill="#C9A84C" />
      <rect x="60" y="31" width="8" height="6" rx="1" fill="#C9A84C" />
      
      {/* Bridge / Superstructure */}
      <path d="M30 46H34V54H30V46Z" fill="#C9A84C" />
      <path d="M28 49H31V53H28V49Z" fill="#C9A84C" />
      <path d="M32 43H34V46H32V43Z" fill="#C9A84C" />

      {/* Waves */}
      <path 
        d="M23 74C32 71.5 39 74.5 48.5 76C59 77.5 70.5 75.5 81.5 70" 
        stroke="#C9A84C" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />
      <path 
        d="M29 80C39.5 77 48.5 80.5 59.5 81.5C70 82.5 81 78.5 90 73.5" 
        stroke="#C9A84C" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
    </svg>
    <div className="text-center flex flex-col items-center">
      <div className="flex items-baseline gap-1.5 justify-center">
        <span className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
          ClearPort
        </span>
        <span className="text-3xl font-light text-[#C9A84C]" style={{ fontFamily: "'Inter', sans-serif" }}>
          AI
        </span>
      </div>
      <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent my-3" />
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#F3F4F6]/80 font-bold">
        AI-Powered Customs Intelligence
      </p>
    </div>
  </div>
);

// Google Icon SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

interface SignInPageProps {
}

export const SignInPage: React.FC<SignInPageProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    // Check if Supabase is configured first
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-supabase')) {
      setIsLoading(false);
      setError('Google Sign-In requires Supabase credentials. Please set up VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your local .env file and restart your npm dev server.');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      // OAuth redirects the page — nothing more to do here
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError('Google Sign-In failed: ' + (err?.message || 'Unknown error. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col relative">
      {/* Top navy brand strip */}
      <div className="h-[3px] bg-[#0C2461]" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative">
        
        {/* Card (Clean white theme, max-w-420px) */}
        <div className="w-full max-w-[420px] bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          
          {/* Card header — navy bg */}
          <div className="bg-[#0C2461] px-8 pt-12 pb-10 flex flex-col items-center gap-6">
            <ClearPortLogo />
          </div>

          {/* Card body */}
          <div className="px-8 py-10 flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#0A0A0A]">Welcome back</h2>
              <p className="text-sm text-[#6B7280] mt-1">Sign in to access your declarations</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 text-center">
                {error}
              </div>
            )}

            {/* Google Sign-In */}
            <button
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 h-12 px-6 border border-[#E5E7EB] rounded-xl bg-white hover:bg-[#F7F7F7] hover:border-[#0A0A0A] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm text-[#0A0A0A] shadow-sm cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#0C2461] border-t-transparent animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>


            <p className="text-[10px] text-center text-[#9CA3AF] leading-relaxed">
              By signing in you agree to our Terms of Service.<br />
              Your data is secured under Dubai Customs compliance standards.
            </p>
          </div>
        </div>

        {/* Features strip */}
        <div className="mt-8 flex items-center gap-8 text-[11px] text-[#9CA3AF] font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0C2461]" />
            Mirsal 2 Ready
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0C2461]" />
            AI Extraction
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0C2461]" />
            Audit Validated
          </span>
        </div>
      </div>

      {/* Bottom gold accent strip */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" />
    </div>
  );
};
