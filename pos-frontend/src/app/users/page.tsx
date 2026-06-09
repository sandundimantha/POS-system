'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { userService, UserManagementRecord } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserCog, 
  Plus, 
  Trash2, 
  Loader2, 
  ShieldAlert, 
  UserPlus, 
  Check, 
  UserX,
  UserCheck
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<UserManagementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  // Form states
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('CASHIER');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword) return;

    setRegLoading(true);
    setRegError(null);

    try {
      await authService.register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        role: regRole,
      });
      setShowRegisterDialog(false);
      // Reset form
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegRole('CASHIER');
      loadUsers();
    } catch (err: any) {
      console.error(err);
      setRegError(
        err.response?.data?.message || 
        'Registration failed. Username or email might be taken.'
      );
    } finally {
      setRegLoading(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await userService.toggleActive(id);
      loadUsers();
    } catch (error) {
      console.error('Failed to toggle user status', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to permanently delete this user account?')) {
      try {
        await userService.delete(id);
        loadUsers();
      } catch (error) {
        console.error('Failed to delete user', error);
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'MANAGER': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <DashboardLayout requiredRoles={['ADMIN']}>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              User Account Profiles
            </h1>
            <p className="text-xs text-slate-400">Add, edit, and toggle authorization for system users</p>
          </div>
          <Button
            onClick={() => setShowRegisterDialog(true)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs h-9 gap-1.5 shadow-md shadow-violet-500/10"
          >
            <Plus className="h-4 w-4" />
            Add User Account
          </Button>
        </div>

        {/* User directory card */}
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <UserCog className="h-4 w-4 text-violet-500" />
              User List Registry
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Manage employee portal profiles</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-12">No users registered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                      <th className="pb-3 font-semibold pl-2">ID</th>
                      <th className="pb-3 font-semibold">Username</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">System Role</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {users.map((u) => (
                      <tr key={u.id} className="text-slate-300 hover:bg-slate-800/10 transition-colors">
                        <td className="py-3.5 pl-2 text-xs font-mono text-slate-550">{u.id}</td>
                        <td className="py-3.5 font-semibold text-slate-100 text-xs">{u.username}</td>
                        <td className="py-3.5 text-xs text-slate-400">{u.email}</td>
                        <td className="py-3.5">
                          <Badge className={`text-[9px] uppercase border px-1.5 py-0.5 ${getRoleBadgeColor(u.role)}`}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3.5">
                          <Badge className={`text-[9px] px-1.5 py-0.5 border ${
                            u.active 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {u.active ? 'ACTIVE' : 'SUSPENDED'}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleToggleActive(u.id)}
                              className={`text-slate-450 hover:text-white ${u.active ? 'hover:text-rose-400' : 'hover:text-emerald-400'}`}
                              title={u.active ? 'Suspend Account' : 'Activate Account'}
                            >
                              {u.active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDelete(u.id)}
                              className="text-slate-450 hover:text-rose-400 hover:bg-rose-500/10"
                              title="Delete Account"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registration dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-violet-500" />
              Create Employee Portal Account
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Configure login credentials for new employee
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterSubmit} className="space-y-4 py-2 text-xs">
            {regError && (
              <div className="flex items-center gap-2 p-2.5 text-xs text-rose-400 border border-rose-500/20 bg-rose-500/10 rounded-lg">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="reg-username" className="text-slate-350">Username *</Label>
              <Input
                id="reg-username"
                type="text"
                required
                placeholder="e.g. employee123"
                className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-slate-350">Email Address *</Label>
              <Input
                id="reg-email"
                type="email"
                required
                placeholder="employee@pos.com"
                className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-pass" className="text-slate-355">Temporary Password *</Label>
              <Input
                id="reg-pass"
                type="password"
                required
                placeholder="Minimum 6 characters"
                className="h-8 border-slate-855 bg-slate-955/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-role" className="text-slate-355">Access Role *</Label>
              <Select
                value={regRole}
                onValueChange={(val) => setRegRole(val as UserRole)}
              >
                <SelectTrigger className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus:ring-violet-500">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="CASHIER">Cashier (Sales and CRM access)</SelectItem>
                  <SelectItem value="MANAGER">Manager (Inventory and Stats access)</SelectItem>
                  <SelectItem value="ADMIN">Admin (Root System access)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowRegisterDialog(false)}
                className="h-8 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={regLoading}
                className="h-8 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold gap-1.5"
              >
                {regLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Register Account
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
