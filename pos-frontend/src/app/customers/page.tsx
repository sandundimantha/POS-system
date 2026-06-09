'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { customerService, CustomerPayload } from '@/services/customer.service';
import { Customer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Loader2, 
  Gift,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      loadCustomers();
      return;
    }
    try {
      const data = await customerService.search(val);
      setCustomers(data);
    } catch (error) {
      console.error('Customer search error', error);
    }
  };

  const openCreate = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setShowDialog(true);
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setAddress(c.address || '');
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const payload: CustomerPayload = {
      name,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
    };

    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id, payload);
      } else {
        await customerService.create(payload);
      }
      setShowDialog(false);
      loadCustomers();
    } catch (error) {
      console.error('Customer save failed', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this customer profile?')) {
      try {
        await customerService.delete(id);
        loadCustomers();
      } catch (error) {
        console.error('Failed to delete customer', error);
      }
    }
  };

  return (
    <DashboardLayout requiredRoles={['ADMIN', 'MANAGER', 'CASHIER']}>
      <div className="space-y-6 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Customer CRM Profiles
            </h1>
            <p className="text-xs text-slate-400">Manage cashier loyalty registrations and points ledgers</p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs h-9 gap-1.5 shadow-md shadow-violet-500/10"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* CRM Customers list */}
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold text-slate-200 flex items-center gap-2">
                <Users className="h-4 w-4 text-violet-500" />
                Loyalty Directory
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Customer profiles and accumulated points balance</CardDescription>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Filter by name / phone..."
                className="pl-9 h-9 text-xs border-slate-800 bg-slate-950/40 focus-visible:ring-violet-500"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
              </div>
            ) : customers.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-12">No customer profiles found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((c) => (
                  <Card key={c.id} className="border-slate-850 bg-slate-950/20 hover:bg-slate-900/40 transition-all duration-300 hover:border-slate-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3">
                      <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold gap-1 py-1">
                        <Gift className="h-3.5 w-3.5" />
                        {c.loyaltyPoints} Pts
                      </Badge>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-200 truncate group-hover:text-violet-400 transition-colors pr-20">
                        {c.name}
                      </CardTitle>
                      <CardDescription className="text-[10px] text-slate-500 font-mono">ID: {c.id}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>{c.phone || 'No phone number'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{c.email || 'No email registered'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{c.address || 'No address registered'}</span>
                      </div>
                    </CardContent>

                    <div className="p-3 border-t border-slate-800/60 bg-slate-950/40 flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEdit(c)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(c.id)}
                        className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* dialog for customer form */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-100">
              {editingCustomer ? 'Edit Customer Profile' : 'Register New Customer'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Fill details to configure customer loyalty card
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-slate-350">Customer Name *</Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="Full name"
                className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-slate-350">Phone Number</Label>
              <Input
                id="phone"
                type="text"
                placeholder="Phone number"
                className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-350">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-slate-350">Home Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="City, State, Country"
                className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowDialog(false)}
                className="h-8 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="h-8 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold"
              >
                {editingCustomer ? 'Save Profile' : 'Register Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
