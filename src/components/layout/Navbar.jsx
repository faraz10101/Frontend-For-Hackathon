import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { Button } from '../ui/button';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/check', label: 'Check' },
  { to: '/lookup', label: 'Lookup' },
  { to: '/report', label: 'Report' },
];

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  // Close the mobile menu after navigating (state reset during render, no effect needed).
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) { setLastPath(location.pathname); setOpen(false); }

  const links = user?.role === 'admin' ? [...LINKS, { to: '/admin', label: 'Admin' }] : LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <ShieldCheck className="h-6 w-6 text-primary" />ScamShield
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>)}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="text-sm text-slate-500">{user.username}</span>
              <Button variant="outline" size="sm" onClick={onLogout}><LogOut className="mr-1.5 h-3.5 w-3.5" />Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/register"><Button size="sm">Sign up</Button></Link>
            </>
          )}
        </div>

        <button type="button" className="cursor-pointer rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="space-y-1 border-t border-slate-100 bg-white px-4 pb-4 pt-2 md:hidden">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={(s) => `block ${linkClass(s)}`}>{l.label}</NavLink>)}
          <div className="flex gap-2 pt-2">
            {user ? (
              <Button variant="outline" className="w-full" onClick={onLogout}><LogOut className="mr-1.5 h-4 w-4" />Logout ({user.username})</Button>
            ) : (
              <>
                <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Login</Button></Link>
                <Link to="/register" className="flex-1"><Button className="w-full">Sign up</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
