'use client';

import { useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';

const ALLOWED_EMAILS = [
  'magician290@gmail.com',
  'xlshihab9@gmail.com',
];

const isAllowedEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email.toLowerCase().trim());
};

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (isAllowedEmail(currentUser.email)) {
          setUser(currentUser);
          setError('');
        } else {
          await signOut(auth);
          setUser(null);
          setError(`আপনার জিমেইল (${currentUser.email || 'অজানা'}) দিয়ে অ্যাডমিন প্যানেলে প্রবেশ করার অনুমতি নেই।`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      if (!isAllowedEmail(email)) {
        await signOut(auth);
        setUser(null);
        setError(`আপনার জিমেইল (${email || 'অজানা'}) দিয়ে অ্যাডমিন প্যানেলে প্রবেশ করার অনুমতি নেই।`);
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Sign in error:', err);
        setError('লগইন করতে সমস্যা হয়েছে। দয়া করে ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setError('');
  };

  // Loading spinner during auth initialization
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        gap: '16px',
        fontFamily: 'Noto Sans Bengali, sans-serif'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '4px solid #E2E8F0',
          borderTop: '4px solid #10B981',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: '#64748B', fontWeight: 600, fontSize: '15px' }}>
          যাচাই করা হচ্ছে...
        </p>
      </div>
    );
  }

  // If not logged in or not authorized, render the Login Page UI
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Noto Sans Bengali, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background glows */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#1E293B',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid #334155',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Logo & Header */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              backgroundColor: '#0F172A',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #10B981',
              boxShadow: '0 0 20px rgba(16,185,129,0.2)'
            }}>
              <img src="/logo.png" alt="Mojlish Logo" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
            </div>
          </div>

          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#F8FAFC',
            marginBottom: '6px'
          }}>
            মজলিস এডমিন প্যানেল
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#94A3B8',
            marginBottom: '32px'
          }}>
            শুধুমাত্র অনুমোদিত এডমিনগণের এক্সেস রয়েছে
          </p>

          {/* Error Message Display */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid #EF4444',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              textAlign: 'left'
            }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#EF4444', fontSize: '18px', marginTop: '2px' }} />
              <p style={{ color: '#FCA5A5', fontSize: '13px', lineHeight: '1.5', margin: 0, fontWeight: 500 }}>
                {error}
              </p>
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              backgroundColor: '#FFFFFF',
              color: '#1E293B',
              fontSize: '15px',
              fontWeight: 700,
              padding: '14px 20px',
              borderRadius: '14px',
              border: 'none',
              cursor: isSigningIn ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
              opacity: isSigningIn ? 0.75 : 1
            }}
          >
            {isSigningIn ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin" style={{ color: '#10B981', fontSize: '18px' }} />
                <span>অপেক্ষা করুন...</span>
              </>
            ) : (
              <>
                {/* SVG Google Logo */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>গুগল দিয়ে সাইন-ইন করুন</span>
              </>
            )}
          </button>

          {/* Allowed Emails Info */}
          <div style={{
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid #334155',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0, fontWeight: 500 }}>
              অনুমোদিত ইমেইল সমূহের তালিকা:
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              marginTop: '8px'
            }}>
              {ALLOWED_EMAILS.map((email) => (
                <span key={email} style={{
                  fontSize: '12px',
                  color: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontFamily: 'monospace'
                }}>
                  {email}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // When logged in and authorized, render children and pass sign out capability
  return (
    <>
      {children}
    </>
  );
}

export { handleSignOutHelper };
async function handleSignOutHelper() {
  await signOut(auth);
}
