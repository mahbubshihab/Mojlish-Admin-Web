'use client';

import { useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const SUPER_ADMIN_EMAILS = [
  'magician290@gmail.com',
  'xlshihab9@gmail.com',
];

export const checkIsAuthorizedAdmin = async (email: string | null | undefined): Promise<boolean> => {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  
  // Super Admins always have access
  if (SUPER_ADMIN_EMAILS.includes(cleanEmail)) {
    return true;
  }

  // Check Firestore 'allowed_admins' collection
  try {
    const adminDocRef = doc(db, 'allowed_admins', cleanEmail);
    const adminDoc = await getDoc(adminDocRef);
    if (adminDoc.exists() && adminDoc.data()?.active !== false) {
      return true;
    }
  } catch (err) {
    console.error('Error checking admin authorization:', err);
  }
  return false;
};

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const isAuthorized = await checkIsAuthorizedAdmin(currentUser.email);
        if (isAuthorized) {
          setUser(currentUser);
          setError('');
        } else {
          await signOut(auth);
          setUser(null);
          setError(`অ্যাক্সেস অনুমোদিত নয়: ${currentUser.email || 'অনুমোদনহীন ইমেইল'}`);
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
      const isAuthorized = await checkIsAuthorizedAdmin(email);
      if (!isAuthorized) {
        await signOut(auth);
        setUser(null);
        setError(`অ্যাক্সেস অনুমোদিত নয়: ${email || 'অনুমোদনহীন ইমেইল'}`);
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Sign in error:', err);
        setError('অ্যাডমিন প্যানেলে সাইন-ইন করতে ব্যর্থ হয়েছে। ইন্টারনেট সংযোগ চেক করুন।');
      }
    } finally {
      setIsSigningIn(false);
    }
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
        backgroundColor: '#090D16',
        gap: '16px',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #10B981',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: '#94A3B8', fontWeight: 600, fontSize: '14px', letterSpacing: '0.5px' }}>
          অ্যাডমিন অ্যাক্সেস যাচাই করা হচ্ছে...
        </p>
      </div>
    );
  }

  // If not logged in or not authorized, render Login Page UI
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#070A12',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <style jsx>{`
          @keyframes floatBlob1 {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(60px, -80px) scale(1.15); }
            66% { transform: translate(-40px, 50px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          @keyframes floatBlob2 {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(-70px, 60px) scale(1.2); }
            66% { transform: translate(50px, -40px) scale(0.85); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          @keyframes floatBlob3 {
            0% { transform: translate(0px, 0px) scale(1); }
            50% { transform: translate(40px, 50px) scale(1.1); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          @keyframes rotateEdgeGlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .grid-overlay {
            background-size: 40px 40px;
            background-image: 
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          }
        `}</style>

        {/* Animated Mesh Gradient Background Blobs */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0) 70%)',
          animation: 'floatBlob1 18s ease-in-out infinite',
          pointerEvents: 'none',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.25) 0%, rgba(14,165,233,0) 70%)',
          animation: 'floatBlob2 22s ease-in-out infinite',
          pointerEvents: 'none',
          filter: 'blur(45px)'
        }} />
        <div style={{
          position: 'absolute',
          top: '40%',
          right: '35%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0) 70%)',
          animation: 'floatBlob3 15s ease-in-out infinite',
          pointerEvents: 'none',
          filter: 'blur(35px)'
        }} />

        {/* Grid Overlay */}
        <div className="grid-overlay" style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none'
        }} />

        {/* Card Wrapper */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          borderRadius: '28px',
          padding: '2px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          zIndex: 10
        }}>
          {/* Animated Edge Glow */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'conic-gradient(from 0deg, #10B981, #0EA5E9, #6366F1, #10B981)',
            animation: 'rotateEdgeGlow 8s linear infinite',
            zIndex: 1
          }} />

          {/* Inner Card */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(20px)',
            borderRadius: '26px',
            padding: '44px 36px',
            textAlign: 'center'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '68px',
                height: '68px',
                backgroundColor: 'rgba(7, 10, 18, 0.8)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(16,185,129,0.3)',
                boxShadow: '0 0 25px rgba(16,185,129,0.25)'
              }}>
                <img src="/logo.png" alt="Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
              </div>
            </div>

            <h1 style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#F8FAFC',
              letterSpacing: '-0.5px',
              marginBottom: '6px'
            }}>
              মজলিস অ্যাডমিন প্যানেল
            </h1>
            <p style={{
              fontSize: '13px',
              color: '#94A3B8',
              letterSpacing: '0.2px',
              marginBottom: '32px'
            }}>
              শুধুমাত্র অনুমোদিত অ্যাডমিনগণ প্রবেশ করতে পারবেন
            </p>

            {/* Error Banner */}
            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left'
              }}>
                <i className="fa-solid fa-circle-exclamation" style={{ color: '#FCA5A5', fontSize: '16px' }} />
                <p style={{ color: '#FCA5A5', fontSize: '12.5px', fontWeight: 500, margin: 0 }}>
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
                gap: '12px',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontSize: '14.5px',
                fontWeight: 700,
                padding: '14px 20px',
                borderRadius: '14px',
                border: 'none',
                cursor: isSigningIn ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.3)',
                opacity: isSigningIn ? 0.8 : 1
              }}
            >
              {isSigningIn ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin" style={{ color: '#10B981', fontSize: '17px' }} />
                  <span>সংযুক্ত করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <svg width="19" height="19" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>গুগল অ্যাকাউন্ট দিয়ে প্রবেশ করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
