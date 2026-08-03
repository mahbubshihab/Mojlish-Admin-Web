'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminGuard, { handleSignOutHelper } from '@/components/AdminGuard';
import { auth } from '@/lib/firebase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentUser = auth.currentUser;

  const links = [
    { href: '/applications', label: 'আবেদন সমূহ', icon: 'fa-users' },
    { href: '/announcements', label: 'ঘোষণা', icon: 'fa-bullhorn' },
    { href: '/resources', label: 'রিসোর্স', icon: 'fa-book-open' },
    { href: '/settings', label: 'সেটিংস', icon: 'fa-sliders' },
  ];

  // Dynamic Page Title for Mobile Topbar
  const getMobileTitle = () => {
    switch (pathname) {
      case '/applications':
        return 'আবেদন ড্যাশবোর্ড';
      case '/announcements':
        return 'ঘোষণা ড্যাশবোর্ড';
      case '/resources':
        return 'রিসোর্স ড্যাশবোর্ড';
      case '/settings':
        return 'সেটিংস ড্যাশবোর্ড';
      default:
        return 'অ্যাডমিন প্যানেল';
    }
  };

  return (
    <AdminGuard>
      <div className="admin-layout">
        {/* Mobile Topbar */}
        <div className="topbar-mobile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <h1 className="mobile-header-title" style={{ margin: 0 }}>{getMobileTitle()}</h1>
          <button 
            onClick={handleSignOutHelper}
            title="লগআউট"
            style={{
              background: 'none',
              border: 'none',
              color: '#EF4444',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)'
            }}
          >
            <i className="fa-solid fa-right-from-bracket" />
          </button>
        </div>

        {/* Desktop Sidebar */}
        <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="sidebar-header">
              <img src="/logo.png" alt="Logo" style={{ height: '40px' }} />
              <h2 style={{ color: 'var(--primary-dark)', fontSize: '20px', fontWeight: '800' }}>
                মজলিস এডমিন
              </h2>
            </div>
            <nav>
              {links.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                >
                  <i className={`fa-solid ${link.icon}`}></i> {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Profile & Logout Box in Sidebar */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Avatar" 
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {currentUser?.email?.[0].toUpperCase() || 'A'}
                </div>
              )}
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser?.displayName || 'এডমিন'}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-light)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser?.email || ''}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOutHelper}
              title="লগআউট"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                border: 'none',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <i className="fa-solid fa-right-from-bracket" />
            </button>
          </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <nav className="bottom-nav">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`bottom-nav-link ${pathname === link.href ? 'active' : ''}`}
            >
              <i className={`fa-solid ${link.icon}`}></i>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
