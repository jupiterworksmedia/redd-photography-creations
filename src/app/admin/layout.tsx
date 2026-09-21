'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Inbox,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Tags,
  SlidersHorizontal,
  Globe,
  PanelTop,
  User,
  Sparkles,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newInquiriesCount, setNewInquiriesCount] = useState<number>(0);

  // If on login page, render children directly without dashboard chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Fetch pending inquiries count
  useEffect(() => {
    fetch('/api/inquiries?status=new')
      .then((r) => r.json())
      .then((data) => {
        if (data.inquiries) {
          setNewInquiriesCount(data.inquiries.length);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Portfolio Gallery', href: '/admin/gallery', icon: ImageIcon },
    { label: 'Hero Slider', href: '/admin/slider', icon: SlidersHorizontal },
    { label: 'Categories & Options', href: '/admin/categories', icon: Tags },
    { label: 'About Page', href: '/admin/about', icon: User },
    { label: 'Services Page', href: '/admin/services', icon: Sparkles },
    { label: 'Menu & Footer', href: '/admin/navigation', icon: PanelTop },
    {
      label: 'Inquiries & Bookings',
      href: '/admin/inquiries',
      icon: Inbox,
      badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
    },
    { label: 'SEO & Analytics', href: '/admin/seo', icon: Globe },
    { label: 'Studio Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-200 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#0c0c11] border-r border-white/10 shrink-0 p-6">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/admin" className="block">
            <div className="flex items-center space-x-2">
              <span className="font-editorial text-2xl font-bold tracking-tight text-white">REDD</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono px-1.5 py-0.5 bg-red-950/60 border border-red-800/40 rounded">
                CMS
              </span>
            </div>
            <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-500 mt-1">
              Admin Management Portal
            </span>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded text-xs uppercase tracking-[0.15em] font-medium transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white font-semibold shadow-md shadow-red-950/50'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-white text-black text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Info & Logout */}
        <div className="space-y-5 pt-6 border-t border-white/10">
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              <span>Admin Account</span>
            </div>
            <p className="text-[11px] text-neutral-300 font-mono truncate">
              reddphotographycreations@gmail.com
            </p>
          </div>

          <div className="flex flex-col space-y-2 text-xs">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded transition-colors"
            >
              <span className="text-[11px] uppercase tracking-wider">Preview Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[11px] uppercase tracking-wider font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0c0c11] border-b border-white/10 sticky top-0 z-30">
        <Link href="/admin" className="flex items-center space-x-2">
          <span className="font-editorial text-xl font-bold text-white">REDD</span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono px-1 bg-red-950/60 border border-red-800/40 rounded">
            CMS
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-neutral-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0c11] border-b border-white/10 p-4 space-y-2 z-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded text-xs uppercase tracking-wider ${
                  isActive ? 'bg-red-600 text-white font-semibold' : 'text-neutral-400 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-white text-black text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
            <Link href="/" target="_blank" className="text-neutral-400 hover:text-white">
              Preview Site
            </Link>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-semibold">
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto max-h-screen p-6 md:p-10">{children}</main>
    </div>
  );
}
