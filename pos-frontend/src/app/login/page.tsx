'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, KeyRound, User as UserIcon, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'CASHIER') {
        router.push('/sales');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({ username, password });
      
      // Save auth to Zustand store
      setAuth(response.token, {
        userId: response.userId,
        username: response.username,
        email: response.email,
        role: response.role,
      });

      // Redirect depending on user role
      if (response.role === 'CASHIER') {
        router.push('/sales');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Invalid username or password. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick select helper to auto-populate credentials for recruiters/testing
  const handleQuickSelect = (role: 'admin' | 'manager' | 'cashier') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'manager') {
      setUsername('manager');
      setPassword('manager123');
    } else {
      setUsername('cashier');
      setPassword('cashier123');
    }
    setError(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 font-sans">
      {/* Dynamic colorful aura background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="w-full max-w-md p-4 z-10">
        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl text-slate-100 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-slate-700">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500"></div>
          
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl shadow-lg shadow-violet-500/20">
                <KeyRound className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              POS System Portal
            </CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to manage sales, products, and analytics
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-rose-400 border border-rose-500/20 bg-rose-500/10 rounded-lg">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    className="pl-10 border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-500 focus-visible:ring-violet-500 focus-visible:border-violet-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    className="pl-10 border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-500 focus-visible:ring-violet-500 focus-visible:border-violet-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-6 font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800" />
              </div>
              <span className="relative px-3 text-xs bg-slate-900 text-slate-500 uppercase tracking-wider">
                Demo Accounts
              </span>
            </div>

            {/* Quick credentials selection for recruiters */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickSelect('admin')}
                className="flex flex-col items-center p-2 rounded-lg border border-slate-800 bg-slate-950/30 hover:bg-slate-800/50 hover:border-slate-700 transition-all group"
              >
                <Badge className="bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-1 group-hover:bg-violet-500/20">Admin</Badge>
                <span className="text-[10px] text-slate-500 font-mono">admin / admin123</span>
              </button>
              <button
                onClick={() => handleQuickSelect('manager')}
                className="flex flex-col items-center p-2 rounded-lg border border-slate-800 bg-slate-950/30 hover:bg-slate-800/50 hover:border-slate-700 transition-all group"
              >
                <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1 group-hover:bg-indigo-500/20">Manager</Badge>
                <span className="text-[10px] text-slate-500 font-mono">manager / manager123</span>
              </button>
              <button
                onClick={() => handleQuickSelect('cashier')}
                className="flex flex-col items-center p-2 rounded-lg border border-slate-800 bg-slate-950/30 hover:bg-slate-800/50 hover:border-slate-700 transition-all group"
              >
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1 group-hover:bg-emerald-500/20">Cashier</Badge>
                <span className="text-[10px] text-slate-500 font-mono">cashier / cashier123</span>
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-800/50 pt-4 pb-4 bg-slate-950/20">
            <span className="text-xs text-slate-500">
              POS System v1.0.0
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
