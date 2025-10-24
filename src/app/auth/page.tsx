'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

// Force dynamic rendering to avoid SSR issues with ThemeProvider
export const dynamic = 'force-dynamic';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin
        ? { email, password }
        : { email, password, name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred');
        setIsLoading(false);
        return;
      }

      // Success - redirect to home
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--background)' }}
    >
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div
        className="w-full max-w-md rounded-lg shadow-lg p-8"
        style={{
          background: 'var(--card-background)',
          border: '1px solid var(--card-border)',
        }}
      >
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            HubSpot AI Audit
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--foreground)' }}
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-md border transition-colors"
                style={{
                  background: 'var(--input-background)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-focus)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--input-border)';
                }}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--foreground)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md border transition-colors"
              style={{
                background: 'var(--input-background)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--input-focus)';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--foreground)' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 rounded-md border transition-colors"
              style={{
                background: 'var(--input-background)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--input-focus)';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
              }}
            />
            {!isLogin && (
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Must be at least 8 characters
              </p>
            )}
          </div>

          {error && (
            <div
              className="p-3 rounded-md text-sm"
              style={{
                background: 'var(--error)',
                color: '#ffffff',
                opacity: 0.9,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-md font-medium transition-colors"
            style={{
              background: 'var(--primary)',
              color: '#ffffff',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'var(--primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
            }}
          >
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm transition-colors"
            style={{ color: 'var(--primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--primary)';
            }}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
