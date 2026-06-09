'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Truck, 
  LogOut, 
  Menu, 
  User as UserIcon,
  ShieldCheck,
  Lock,
  FileText,
  UserCog
} from 'lucide-react';

interface SidebarLink {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: ('ADMIN' | 'MANAGER' | 'CASHIER')[];
}

const SIDEBAR_LINKS: SidebarLink[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    name: 'Billing (POS)',
    href: '/sales',
    icon: ShoppingBag,
    roles: ['ADMIN', 'MANAGER', 'CASHIER'],
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    name: 'Customers CRM',
    href: '/customers',
    icon: Users,
    roles: ['ADMIN', 'MANAGER', 'CASHIER'],
  },
  {
    name: 'Suppliers',
    href: '/suppliers',
    icon: Truck,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    name: 'User Accounts',
    href: '/users',
    icon: UserCog,
    roles: ['ADMIN'],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRoles?: ('ADMIN' | 'MANAGER' | 'CASHIER')[];
}

export default function DashboardLayout({ children, requiredRoles }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle client-side mounting for Zustand hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isMounted, isAuthenticated, router]);

  if (!isMounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="animate-pulse flex space-x-2 items-center">
          <div className="h-2 w-2 bg-violet-500 rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    );
  }

  // Check role authorization
  const isAuthorized = !requiredRoles || requiredRoles.includes(user.role);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'MANAGER': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 font-sans">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-md">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            SuperPOS
          </span>
        </div>
      </div>

      {/* Sidebar Links */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {SIDEBAR_LINKS.filter(link => link.roles.includes(user.role)).map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <a
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-violet-400 border-l-2 border-violet-500 pl-2.5 shadow-inner'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-400'
              }`} />
              {link.name}
            </a>
          );
        })}
      </nav>

      {/* Profile & Logout Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 p-2 bg-slate-950/40 rounded-xl border border-slate-800/60 mb-3">
          <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400 shrink-0">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{user.username}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
          </div>
          <Badge className={`shrink-0 text-[9px] uppercase border px-1.5 py-0.5 ${getRoleBadgeColor(user.role)}`}>
            {user.role}
          </Badge>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border hover:border-rose-500/20 text-xs gap-2 py-2"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex h-16 items-center justify-between px-6 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white">SuperPOS</span>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg inline-flex items-center justify-center cursor-pointer">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r border-slate-800 w-64">
              {sidebarContent}
            </SheetContent>
          </Sheet>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-950 relative">
          {/* Subtle decoration aura background blobs */}
          <div className="absolute top-10 right-10 w-80 h-80 bg-violet-600/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          {isAuthorized ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 relative z-10">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-4 text-rose-400 shadow-lg shadow-rose-950/20">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-slate-100">Access Denied</h2>
              <p className="text-slate-400 max-w-sm text-sm">
                Your account ({user.role}) does not have permissions to access this page. Please contact your administrator.
              </p>
              <Button 
                onClick={() => router.push(user.role === 'CASHIER' ? '/sales' : '/dashboard')}
                className="mt-6 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                Go Back Home
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
