import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

// Smart Handling full logo for sign-in page
const SmartHandlingLogo: React.FC = () => (
  <div className="flex flex-col items-center gap-3">
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer gold ring */}
      <circle cx="36" cy="36" r="33" stroke="#C9A84C" strokeWidth="2" />
      {/* Inner navy ring */}
      <circle cx="36" cy="36" r="28" stroke="#0C2461" strokeWidth="0.5" strokeDasharray="3 3" />
      {/* Tick marks */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 36 + 30 * Math.cos(rad);
        const y1 = 36 + 30 * Math.sin(rad);
        const len = deg % 90 === 0 ? 4 : 2;
        const x2 = 36 + (30 + len) * Math.cos(rad);
        const y2 = 36 + (30 + len) * Math.sin(rad);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C9A84C" strokeWidth={deg % 90 === 0 ? 1.5 : 1} strokeLinecap="round" />;
      })}
      {/* SH lettermark */}
      <circle cx="36" cy="36" r="24" fill="white" opacity="0.1" />
      <text x="36" y="44" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="24" fill="#C9A84C" letterSpacing="-1">SH</text>
    </svg>
    <div className="text-center flex flex-col items-center">
      <div className="flex items-baseline gap-2 justify-center">
        <span className="text-3xl font-semibold italic text-white tracking-wide" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Smart
        </span>
        <span className="text-[14px] font-sans font-extrabold uppercase tracking-[0.25em] text-[#C9A84C]">
          Handling
        </span>
      </div>
      <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent my-3" />
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#F3F4F6]/80 font-bold">
        Intelligent Customs Declaration
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
            <SmartHandlingLogo />
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
