'use client';

import { useAuth } from './AuthProvider';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const menuItems = [
    { label: 'Home', path: '/', icon: '🏠' },
    { label: 'Configure', path: '/configure', icon: '⚙️' },
    { label: 'History', path: '/history', icon: '📋' },
    { label: 'Settings', path: '/profile', icon: '⚡' },
  ];

  // Add Admin option for admin users only
  if (user?.role === 'admin') {
    menuItems.push({ label: 'Admin Panel', path: '/admin', icon: '👑' });
  }

  return (
    <header
      className="border-b"
      style={{
        background: 'var(--card-background)',
        borderColor: 'var(--card-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/')}
              className="text-xl font-semibold hover:opacity-80 transition-opacity"
              style={{ color: 'var(--foreground)' }}
            >
              HubSpot AI Audit
            </button>
          </div>

          {/* Right side: Theme Toggle + User Menu */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* User Avatar with Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:opacity-90"
                style={{
                  background: 'var(--muted)',
                  color: 'var(--foreground)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-medium"
                  style={{
                    background: 'var(--primary)',
                    color: '#ffffff',
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || user?.email[0]?.toUpperCase()}
                </div>
                <span className="text-sm hidden sm:inline">
                  {user?.name || user?.email}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-20 border"
                    style={{
                      background: 'var(--card-background)',
                      borderColor: 'var(--card-border)',
                    }}
                  >
                    <div className="p-2">
                      {/* Menu Items */}
                      {menuItems.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            router.push(item.path);
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-md transition-colors text-sm flex items-center gap-2"
                          style={{ color: 'var(--foreground)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--muted)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                      
                      {/* Divider */}
                      <div className="my-1 h-px" style={{ background: 'var(--card-border)' }}></div>
                      
                      {/* Sign Out */}
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-md transition-colors text-sm flex items-center gap-2"
                        style={{ color: 'var(--foreground)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--muted)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
