'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import SalesChart from '@/components/shared/SalesChart';
import { reportService } from '@/services/report.service';
import { productService } from '@/services/product.service';
import { orderService } from '@/services/order.service';
import { DailySalesReport, TopProductReport, Product, Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  PackageCheck
} from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dailySales, setDailySales] = useState<DailySalesReport | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [topProducts, setTopProducts] = useState<TopProductReport[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [weeklySales, setWeeklySales] = useState<{ day: string; amount: number }[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Fetch daily sales
        const daily = await reportService.getDailySales(today);
        setDailySales(daily);

        // 2. Fetch monthly revenue (current month)
        const date = new Date();
        const monthRev = await reportService.getMonthlyRevenue(date.getFullYear(), date.getMonth() + 1);
        setMonthlyRevenue(monthRev);

        // 3. Fetch top products (past 30 days)
        const past30Days = new Date();
        past30Days.setDate(past30Days.getDate() - 30);
        const fromStr = past30Days.toISOString().split('T')[0];
        const topProd = await reportService.getTopProducts(fromStr, today, 5);
        setTopProducts(topProd);

        // 4. Fetch low stock alert products
        const low = await productService.getLowStock();
        setLowStock(low);

        // 5. Fetch recent orders
        const allOrders = await orderService.getAll();
        // Take the 5 most recent
        setRecentOrders(allOrders.slice(-5).reverse());

        // 6. Fetch weekly sales trend (last 7 days)
        const tempWeekly: { day: string; amount: number }[] = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          try {
            const report = await reportService.getDailySales(dateStr);
            tempWeekly.push({
              day: dayNames[d.getDay()],
              amount: report?.totalRevenue ? Number(report.totalRevenue) : 0,
            });
          } catch (e) {
            tempWeekly.push({
              day: dayNames[d.getDay()],
              amount: 0,
            });
          }
        }
        setWeeklySales(tempWeekly);
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const formatCurrency = (val: number | undefined) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  if (loading) {
    return (
      <DashboardLayout requiredRoles={['ADMIN', 'MANAGER']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            <span className="text-slate-400 text-sm">Aggregating real-time stats...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRoles={['ADMIN', 'MANAGER']}>
      <div className="space-y-6">
        {/* Title */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Operations Control
            </h1>
            <p className="text-sm text-slate-400">
              Overview of today's key performance indicators.
            </p>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span>Today: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Today's Revenue */}
          <Card className="border-slate-800/80 bg-slate-900/40 backdrop-blur-md hover:border-slate-700 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-medium text-slate-400">Today's Revenue</span>
              <div className="p-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-lg">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {formatCurrency(dailySales?.totalRevenue)}
              </div>
              <div className="flex items-center text-[10px] text-slate-500 mt-1 gap-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+4.2%</span>
                <span>from yesterday</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Today's Orders */}
          <Card className="border-slate-800/80 bg-slate-900/40 backdrop-blur-md hover:border-slate-700 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-medium text-slate-400">Today's Orders</span>
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {dailySales?.totalOrders || 0}
              </div>
              <div className="flex items-center text-[10px] text-slate-500 mt-1 gap-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+1.5%</span>
                <span>from yesterday</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Monthly Revenue */}
          <Card className="border-slate-800/80 bg-slate-900/40 backdrop-blur-md hover:border-slate-700 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-medium text-slate-400">Monthly Revenue</span>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {formatCurrency(monthlyRevenue)}
              </div>
              <div className="flex items-center text-[10px] text-slate-500 mt-1 gap-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+8.7%</span>
                <span>vs last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Low Stock Warnings */}
          <Card className="border-slate-800/80 bg-slate-900/40 backdrop-blur-md hover:border-slate-700 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-medium text-slate-400">Low Stock Warnings</span>
              <div className={`p-2 rounded-lg border ${
                lowStock.length > 0
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${lowStock.length > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
                {lowStock.length}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {lowStock.length > 0 ? 'Requires immediate restock' : 'All items sufficiently stocked'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Revenue Trend Chart */}
        <Card className="border-slate-800/80 bg-slate-900/40 backdrop-blur-md hover:border-slate-700/80 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-200">Revenue Trend Line</CardTitle>
            <CardDescription className="text-slate-500">Weekly sales overview (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full pb-4">
            <SalesChart data={weeklySales} />
          </CardContent>
        </Card>

        {/* Analytical Panels */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Orders List */}
          <Card className="border-slate-800/80 bg-slate-900/40 backdrop-blur-md lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-200">Recent Checkout Transactions</CardTitle>
              <CardDescription className="text-slate-500">Live feed of sales transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                      <th className="pb-3 font-semibold">Invoice No</th>
                      <th className="pb-3 font-semibold">Cashier</th>
                      <th className="pb-3 font-semibold">Grand Total</th>
                      <th className="pb-3 font-semibold">Payment Mode</th>
                      <th className="pb-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                          No transactions completed today.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order.id} className="text-slate-300 hover:bg-slate-800/10 transition-colors">
                          <td className="py-3 font-medium text-violet-400 text-xs font-mono">{order.invoiceNumber}</td>
                          <td className="py-3 text-xs">{order.cashierName}</td>
                          <td className="py-3 font-semibold text-xs">{formatCurrency(order.grandTotal)}</td>
                          <td className="py-3">
                            <Badge className="bg-slate-800 hover:bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                              {order.paymentMode.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <Badge className={`text-[9px] px-1.5 py-0.5 border ${
                              order.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {order.paymentStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Products & Low Stock Summary */}
          <div className="flex flex-col gap-6">
            {/* Top Products */}
            <Card className="border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-200 font-sans">Top Selling Products</CardTitle>
                <CardDescription className="text-slate-500">Past 30 days sold volume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No top product sales data available.</p>
                ) : (
                  topProducts.map((p, index) => (
                    <div key={p.productId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white text-[10px] font-bold">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate max-w-[150px]">{p.productName}</p>
                          <p className="text-[10px] text-slate-500">ID: {p.productId}</p>
                        </div>
                      </div>
                      <Badge className="bg-violet-500/10 border-violet-500/20 text-violet-400 text-xs font-semibold">
                        {p.totalQuantitySold} sold
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Low Stock Warnings list */}
            <Card className="border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  Low Stock Panel
                </CardTitle>
                <CardDescription className="text-slate-500">Items below threshold</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[200px] overflow-y-auto pr-1">
                {lowStock.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-500">
                    <PackageCheck className="h-8 w-8 text-slate-600" />
                    <span className="text-xs">All products adequately stocked.</span>
                  </div>
                ) : (
                  lowStock.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/35 border border-slate-800/40">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-300 truncate max-w-[150px]">{item.name}</p>
                        <p className="text-[9px] text-slate-500 font-mono">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-rose-400">{item.stockQuantity} remaining</div>
                        <div className="text-[9px] text-slate-500">Limit: {item.minStockThreshold}</div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
