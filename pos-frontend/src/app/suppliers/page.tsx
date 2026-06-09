'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { supplierService, SupplierPayload } from '@/services/supplier.service';
import { Supplier } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Loader2
} from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to load suppliers', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingSupplier(null);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setShowDialog(true);
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setName(s.name);
    setContactPerson(s.contactPerson || '');
    setPhone(s.phone || '');
    setEmail(s.email || '');
    setAddress(s.address || '');
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const payload: SupplierPayload = {
      name,
      contactPerson: contactPerson || undefined,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
    };

    try {
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, payload);
      } else {
        await supplierService.create(payload);
      }
      setShowDialog(false);
      loadSuppliers();
    } catch (error) {
      console.error('Supplier save failed', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this supplier profile?')) {
      try {
        await supplierService.delete(id);
        loadSuppliers();
      } catch (error) {
        console.error('Failed to delete supplier', error);
      }
    }
  };

  return (
    <DashboardLayout requiredRoles={['ADMIN', 'MANAGER']}>
      <div className="space-y-6 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Supplier Directory
            </h1>
            <p className="text-xs text-slate-400">Track and manage supply chain product providers</p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs h-9 gap-1.5 shadow-md shadow-violet-500/10"
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
        </div>

        {/* Suppliers List */}
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Truck className="h-4 w-4 text-violet-500" />
              Provider Registry
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Contact information for restock logistics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
              </div>
            ) : suppliers.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-12">No supplier profiles registered.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map((s) => (
                  <Card key={s.id} className="border-slate-850 bg-slate-950/20 hover:bg-slate-900/40 transition-all duration-300 hover:border-slate-700 relative overflow-hidden group">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-200 truncate group-hover:text-violet-400 transition-colors">
                        {s.name}
                      </CardTitle>
                      <CardDescription className="text-[10px] text-slate-500 font-mono">ID: {s.id}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>{s.contactPerson || 'No contact representative'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>{s.phone || 'No phone number'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{s.email || 'No email registered'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{s.address || 'No address registered'}</span>
                      </div>
                    </CardContent>

                    <div className="p-3 border-t border-slate-800/60 bg-slate-950/40 flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEdit(s)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(s.id)}
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

      {/* dialog for supplier form */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-100">
              {editingSupplier ? 'Edit Supplier Details' : 'Register New Supplier'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Fill details to configure supplier profile
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-slate-350">Supplier Name *</Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="e.g. Acme Distributions"
                className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact" className="text-slate-350">Contact Person</Label>
              <Input
                id="contact"
                type="text"
                placeholder="Representative name"
                className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
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
              <Label htmlFor="address" className="text-slate-350">Physical Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="Factory / Warehouse location"
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
                {editingSupplier ? 'Save Changes' : 'Register Supplier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
