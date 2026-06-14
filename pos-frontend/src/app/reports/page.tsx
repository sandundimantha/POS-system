'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import PaymentDonutChart from '@/components/shared/PaymentDonutChart';
import { orderService } from '@/services/order.service';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  Search, 
  Loader2, 
  Download, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Clock 
} from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Set default range: Past 7 days
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Backend expects LocalDateTime. We append start and end of day times.
      const fromStr = `${fromDate}T00:00:00`;
      const toStr = `${toDate}T23:59:59`;
      const data = await orderService.getByDateRange(fromStr, toStr);
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders range', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  // Computations
  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalDiscount = orders.reduce((sum, o) => sum + o.discount, 0);
  const totalTax = orders.reduce((sum, o) => sum + o.tax, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Payment method breakdowns
  const paymentBreakdown = orders.reduce((acc, o) => {
    acc[o.paymentMode] = (acc[o.paymentMode] || 0) + o.grandTotal;
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `POS_Sales_Report_${fromDate}_to_${toDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <DashboardLayout requiredRoles={['ADMIN', 'MANAGER']}>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Financial Reports Ledger
            </h1>
            <p className="text-xs text-slate-400">Review cash volumes, payment splits, and receipt logs</p>
          </div>
          {orders.length > 0 && (
            <Button
              onClick={handleExportData}
              variant="outline"
              className="text-xs gap-1.5 border-slate-800 hover:bg-slate-800 text-slate-300"
            >
              <Download className="h-4 w-4" />
              Export JSON Report
            </Button>
          )}
        </div>

        {/* Date Filter Card */}
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <CardContent className="pt-6">
            <form onSubmit={handleQuerySubmit} className="flex flex-col sm:flex-row items-end gap-4 text-xs">
              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                <div className="space-y-1.5">
                  <Label htmlFor="from-date" className="text-slate-400">Starting Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="from-date"
                      type="date"
                      className="pl-9 h-9 border-slate-850 bg-slate-950/40 text-slate-100 text-xs focus-visible:ring-violet-500"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="to-date" className="text-slate-400">Ending Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="to-date"
                      type="date"
                      className="pl-9 h-9 border-slate-850 bg-slate-950/40 text-slate-100 text-xs focus-visible:ring-violet-500"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-9 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs gap-1.5 px-6 shadow-md shadow-violet-500/10"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Filter Results
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats breakdown grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-800 bg-slate-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Gross Sales Value</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Receipt Volume</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">{totalOrders}</p>
                </div>
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Discounts Conceded</p>
                  <p className="text-2xl font-bold text-rose-450 mt-1">{formatCurrency(totalDiscount)}</p>
                </div>
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Average Cart Total</p>
                  <p className="text-2xl font-bold text-emerald-450 mt-1">{formatCurrency(avgOrderValue)}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ledger logs & Payment breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Detailed Receipts Table */}
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-200">Transaction History Log</CardTitle>
              <CardDescription className="text-xs text-slate-500">List of receipts issued in the selected range</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
                </div>
              ) : orders.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-12">No orders created in this range.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                        <th className="pb-3 font-semibold pl-2">Invoice No</th>
                        <th className="pb-3 font-semibold">Cashier</th>
                        <th className="pb-3 font-semibold">Discount</th>
                        <th className="pb-3 font-semibold">Grand Total</th>
                        <th className="pb-3 font-semibold">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {orders.map((o) => (
                        <tr key={o.id} className="text-slate-300 hover:bg-slate-800/10 transition-colors">
                          <td className="py-3 pl-2 font-mono text-violet-400 text-xs">{o.invoiceNumber}</td>
                          <td className="py-3 text-xs">{o.cashierName}</td>
                          <td className="py-3 text-xs text-rose-450">{formatCurrency(o.discount)}</td>
                          <td className="py-3 font-semibold text-slate-100 text-xs">{formatCurrency(o.grandTotal)}</td>
                          <td className="py-3">
                            <Badge className="bg-slate-800 hover:bg-slate-800 text-[9px] border border-slate-700">
                              {o.paymentMode}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-200">Payment Channel Breakdown</CardTitle>
              <CardDescription className="text-xs text-slate-500">Sales volume by settlement method</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-12">No data to split.</p>
              ) : (
                <PaymentDonutChart
                  data={{
                    CASH: paymentBreakdown['CASH'] || 0,
                    CARD: paymentBreakdown['CARD'] || 0,
                    MOBILE_PAY: paymentBreakdown['MOBILE_PAY'] || 0,
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
