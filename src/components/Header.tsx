'use client';

import { useAuth } from './AuthProvider';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

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
          <div className="flex items-center">
            <h1
              className="text-xl font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              HubSpot AI Audit
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
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

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-20 border"
                    style={{
                      background: 'var(--card-background)',
                      borderColor: 'var(--card-border)',
                    }}
                  >
                    <div className="p-2">
                      <button
                        onClick={() => {
                          logout();
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-md transition-colors text-sm"
                        style={{ color: 'var(--foreground)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--muted)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
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
