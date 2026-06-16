'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Nav({ variant = 'auto' }) {
  const { profile, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/');
  }

  const isActive = (href) => pathname === href ? 'nav-link active' : 'nav-link';

  // Operator nav
  if (variant === 'operator' || (!loading && profile?.user_type === 'operator')) {
    return (
      <nav className="nav">
        <Link href="/operator" className="nav-brand">Corridor<span>Book</span></Link>
        <span className="nav-badge">Operator Portal</span>
        <div className="nav-right">
          {profile && <span className="nav-company">{profile.company_name}</span>}
          <Link href="/how-it-works" className="nav-link">How it works</Link>
          <Link href="/about" className="nav-link">About</Link>
          <button className="nav-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </nav>
    );
  }

  // Forwarder nav (logged in)
  if (!loading && profile?.user_type === 'forwarder') {
    return (
      <nav className="nav">
        <Link href="/search" className="nav-brand">Corridor<span>Book</span></Link>
        <div className="nav-links">
          <Link href="/search" className={isActive('/search')}>Search slots</Link>
          <Link href="/tracking" className={isActive('/tracking')}>My Shipments</Link>
          <Link href="/how-it-works" className={isActive('/how-it-works')}>How it works</Link>
          <Link href="/about" className={isActive('/about')}>About</Link>
        </div>
        <div className="nav-right">
          {profile && <span className="nav-company">{profile.company_name}</span>}
          <button className="nav-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </nav>
    );
  }

  // Public nav (not logged in or loading)
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">Corridor<span>Book</span></Link>
      <div className="nav-links">
        <Link href="/how-it-works" className={isActive('/how-it-works')}>How it works</Link>
        <Link href="/about" className={isActive('/about')}>About</Link>
      </div>
      <div className="nav-right">
        <button className="nav-btn" onClick={() => router.push('/')}>Sign in</button>
      </div>
    </nav>
  );
}