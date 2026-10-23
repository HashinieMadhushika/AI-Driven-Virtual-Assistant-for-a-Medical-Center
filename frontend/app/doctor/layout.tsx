'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Sidebar is a slide-in drawer below lg; always visible on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on login or accept-invite page, skip authentication
  const isLoginPage = pathname === '/doctor/login';
  const isAcceptInvitePage = pathname.startsWith('/doctor/accept-invite');

  useEffect(() => {
    // Skip authentication check for login and accept-invite pages
    if (isLoginPage || isAcceptInvitePage) {
      setLoading(false);
      return;
    }

    // Check authentication for other pages
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userData = localStorage.getItem('user');

    if (!token || userRole !== 'doctor') {
      // replace (not push) so the back button can't return to a protected page
      router.replace('/login');
      return;
    }

    if (userData) {
      setDoctor(JSON.parse(userData));
    }
    setLoading(false);
  }, [router, pathname, isLoginPage, isAcceptInvitePage]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    router.replace('/');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/doctor/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Appointments',
      href: '/doctor/appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Profile',
      href: '/doctor/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  // Show login/accept-invite page without layout
  if (isLoginPage || isAcceptInvitePage) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (loading || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="h-[72px] bg-white border-b border-black/10 text-slate-800">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-6 h-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 rounded-lg hover:bg-slate-50 lg:hidden"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:grid w-10 h-10 rounded-xl place-items-center text-white font-black bg-linear-to-br from-teal-700 to-cyan-500">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-wide">DOCTOR</h1>
              <p className="hidden sm:block text-xs text-slate-500">MediCare AI System</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button className="relative p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-teal-50 border border-black/10">
                <span className="text-teal-800 font-bold text-sm">{doctor?.name?.charAt(0)}</span>
              </div>
              <div className="hidden md:block">
                <p className="font-semibold text-sm">DR. {doctor?.name}</p>
                <p className="text-xs text-slate-500">{doctor?.specialization}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-2 font-semibold text-teal-800 hover:underline text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {/* Backdrop for the mobile drawer */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={[
            'fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto bg-white border-r border-black/10 transition-transform duration-200',
            'lg:static lg:z-auto lg:translate-x-0 lg:min-h-[calc(100vh-72px)]',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          ].join(' ')}
        >
          <div className="px-4 pt-4 flex items-center justify-between font-extrabold text-slate-700 lg:hidden">
            Doctor
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    setSidebarOpen(false);
                    router.push(item.href);
                  }}
                  className={[
                    'w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition',
                    isActive
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                      : 'bg-white text-slate-700 border-transparent hover:bg-slate-50 hover:border-black/10'
                  ].join(' ')}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
