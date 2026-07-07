'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
    <div className="admin-layout">
      {/* Mobile Topbar - ONLY title, no logo or text matching user instructions */}
      <div className="topbar-mobile">
        <h1 className="mobile-header-title">{getMobileTitle()}</h1>
      </div>

      {/* Desktop Sidebar */}
      <aside className="sidebar">
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
  );
}
