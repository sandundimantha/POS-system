'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { useCartStore } from '@/store/cartStore';
import { productService } from '@/services/product.service';
import { customerService } from '@/services/customer.service';
import { orderService } from '@/services/order.service';
import { Product, Customer, PaymentMode, Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  UserPlus, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Printer, 
  Loader2,
  AlertCircle,
  PackageCheck
} from 'lucide-react';

export default function SalesPage() {
  const { 
    items, 
    customer, 
    discount, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    setCustomer, 
    setDiscount, 
    clearCart,
    getTotals 
  } = useCartStore();

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');

  // Customer search state
  const [custSearch, setCustSearch] = useState('');
  const [foundCustomers, setFoundCustomers] = useState<Customer[]>([]);
  const [showCustDropdown, setShowCustDropdown] = useState(false);
  const [showAddCustDialog, setShowAddCustDialog] = useState(false);

  // New customer form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');

  // Invoice modal state
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Totals
  const { subtotal, tax, grandTotal } = getTotals();

  // Load products initially
  useEffect(() => {
    loadProducts();
  }, []);

  // Search products when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Search customers when query changes
  useEffect(() => {
    if (custSearch.trim().length > 1) {
      searchCustomers();
    } else {
      setFoundCustomers([]);
      setShowCustDropdown(false);
    }
  }, [custSearch]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }
    try {
      setLoadingProducts(true);
      const data = await productService.search(searchQuery);
      setProducts(data);
    } catch (error) {
      console.error('Product search failed', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const searchCustomers = async () => {
    try {
      const data = await customerService.search(custSearch);
      setFoundCustomers(data);
      setShowCustDropdown(data.length > 0);
    } catch (error) {
      console.error('Customer search failed', error);
    }
  };

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;

    try {
      const newCustomer = await customerService.create({
        name: newCustName,
        phone: newCustPhone || undefined,
        email: newCustEmail || undefined,
      });
      setCustomer(newCustomer);
      setCustSearch(newCustomer.name);
      setShowAddCustDialog(false);
      // Reset form
      setNewCustName('');
      setNewCustPhone('');
      setNewCustEmail('');
    } catch (error) {
      console.error('Failed to add customer', error);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const payload = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        paymentMode,
        customerId: customer?.id || undefined,
        discount: discount
      };

      const completedOrder = await orderService.checkout(payload);
      setInvoiceOrder(completedOrder);
      setShowInvoiceDialog(true);
      clearCart();
      setCustSearch('');
      // Reload product stock levels
      loadProducts();
    } catch (err: any) {
      console.error(err);
      setCheckoutError(
        err.response?.data?.message || 
        'An error occurred during checkout. Please verify items.'
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const printReceipt = () => {
    const printContent = document.getElementById('receipt-print-area');
    if (!printContent) return;

    const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    if (winPrint) {
      winPrint.document.write(`
        <html>
          <head>
            <title>Invoice Receipt</title>
            <style>
              body { font-family: monospace; font-size: 12px; color: #000; padding: 20px; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .bold { font-weight: bold; }
              .border-b { border-bottom: 1px dashed #000; margin: 10px 0; }
              table { width: 100%; border-collapse: collapse; }
              td, th { padding: 4px 0; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      winPrint.document.close();
    }
  };

  return (
    <DashboardLayout requiredRoles={['ADMIN', 'MANAGER', 'CASHIER']}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 font-sans">
        
        {/* Left Side: Product Picker */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-violet-500" />
                POS Billing Terminal
              </h1>
              <p className="text-xs text-slate-400">Search and tap products to compile cart</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Search products by SKU / name..."
                className="pl-9 h-9 border-slate-800 bg-slate-900/40 text-slate-100 placeholder-slate-500 focus-visible:ring-violet-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="min-h-[50vh]">
            {loadingProducts ? (
              <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-500 border border-dashed border-slate-800 rounded-xl">
                <AlertCircle className="h-8 w-8 text-slate-600 mb-2" />
                <p className="text-sm">No products found matching query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {products.map((product) => {
                  const isLowStock = product.stockQuantity <= product.minStockThreshold;
                  const isOutOfStock = product.stockQuantity <= 0;
                  
                  return (
                    <Card 
                      key={product.id} 
                      onClick={() => !isOutOfStock && addToCart(product)}
                      className={`border-slate-850 bg-slate-900/30 hover:bg-slate-900/60 backdrop-blur-sm cursor-pointer hover:border-violet-500/40 transition-all duration-200 select-none relative overflow-hidden group flex flex-col justify-between ${
                        isOutOfStock ? 'opacity-50 cursor-not-allowed border-rose-950/20' : ''
                      }`}
                    >
                      <CardContent className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Image Placeholder */}
                          <div className="h-24 w-full bg-slate-950/50 rounded-lg flex items-center justify-center text-slate-700 relative overflow-hidden mb-2">
                            {product.imagePath ? (
                              <img 
                                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/uploads/${product.imagePath}`}
                                alt={product.name} 
                                className="object-cover h-full w-full"
                              />
                            ) : (
                              <PackageCheck className="h-8 w-8 text-slate-800 group-hover:scale-110 transition-transform duration-300" />
                            )}
                            
                            {isOutOfStock && (
                              <Badge className="absolute bg-rose-600 text-white text-[9px] top-1 right-1">Sold Out</Badge>
                            )}
                            {!isOutOfStock && isLowStock && (
                              <Badge className="absolute bg-amber-600 text-white text-[9px] top-1 right-1">Low Stock</Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-xs text-slate-200 line-clamp-1 group-hover:text-violet-400 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-[10px] text-slate-500 font-mono">SKU: {product.sku}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                          <span className="text-sm font-bold text-slate-200">{formatCurrency(product.price)}</span>
                          <span className="text-[9px] text-slate-400">Qty: {product.stockQuantity}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Virtual Checkout Cart */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between min-h-[60vh] max-h-[85vh] sticky top-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-600 to-indigo-600"></div>
            
            {/* Cart Header */}
            <CardHeader className="pb-3 pt-5 flex flex-row items-center justify-between border-b border-slate-800/80">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-violet-500" />
                  Virtual Cart ({items.reduce((sum, item) => sum + item.quantity, 0)})
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500">Checkout operations panel</CardDescription>
              </div>
              <Button 
                onClick={clearCart}
                variant="ghost" 
                size="sm" 
                className="text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 h-7"
              >
                Clear Cart
              </Button>
            </CardHeader>

            {/* Cart Body: Items list */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[30vh]">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12 gap-2">
                  <ShoppingCart className="h-8 w-8 text-slate-700" />
                  <span className="text-xs">Your cart is currently empty</span>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/20 border border-slate-850 gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-200 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-500">{formatCurrency(item.product.price)} each</p>
                    </div>

                    {/* Quantity selectors */}
                    <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:bg-slate-850 text-slate-400 hover:text-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-slate-200 font-mono">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:bg-slate-850 text-slate-400 hover:text-white"
                        disabled={item.quantity >= item.product.stockQuantity}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right pl-2 shrink-0">
                      <p className="text-xs font-bold text-slate-200">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>

            {/* Cart Footer: Customer CRM, Discount, Totals & Checkout */}
            <CardFooter className="flex flex-col p-4 bg-slate-950/40 border-t border-slate-800/80 space-y-4">
              
              {checkoutError && (
                <div className="flex items-center gap-2 p-2.5 text-xs text-rose-400 border border-rose-500/20 bg-rose-500/10 rounded-lg w-full">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Customer Selection Input */}
              <div className="w-full space-y-1 relative">
                <div className="flex items-center justify-between text-xs mb-1">
                  <Label htmlFor="cust-search" className="text-slate-400 text-[10px]">Customer Loyalty Profile</Label>
                  <button 
                    onClick={() => setShowAddCustDialog(true)}
                    className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-0.5 text-[10px]"
                  >
                    <UserPlus className="h-3 w-3" />
                    Add Customer
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="cust-search"
                      type="text"
                      placeholder="Search customer by name/phone..."
                      className="h-8 border-slate-850 bg-slate-900/60 text-slate-100 placeholder-slate-650 text-xs focus-visible:ring-violet-500"
                      value={custSearch}
                      onChange={(e) => {
                        setCustSearch(e.target.value);
                        if (!e.target.value) setCustomer(null);
                      }}
                    />
                    {customer && (
                      <Badge className="absolute right-2 top-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] hover:bg-emerald-500/20">
                        {customer.loyaltyPoints} Points
                      </Badge>
                    )}
                  </div>
                  {customer && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setCustomer(null);
                        setCustSearch('');
                      }}
                      className="h-8 text-xs border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Dropdown Customer results */}
                {showCustDropdown && foundCustomers.length > 0 && (
                  <div className="absolute left-0 right-0 bottom-full mb-1 z-50 rounded-lg border border-slate-800 bg-slate-900 shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                    {foundCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setCustomer(c);
                          setCustSearch(c.name);
                          setShowCustDropdown(false);
                        }}
                        className="p-2 text-xs text-slate-300 hover:bg-slate-850 hover:text-white cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-[10px] text-slate-500">{c.phone || 'No phone'}</p>
                        </div>
                        <Badge className="bg-slate-800 text-[10px] text-slate-400">{c.loyaltyPoints} pts</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Discount Selector */}
              <div className="w-full grid grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <Label htmlFor="discount" className="text-slate-400 text-[10px]">Discount ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-500" />
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      className="pl-7 h-8 border-slate-850 bg-slate-900/60 text-slate-100 text-xs focus-visible:ring-violet-500"
                      value={discount || ''}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="payment-mode" className="text-slate-400 text-[10px]">Payment Method</Label>
                  <Select 
                    value={paymentMode} 
                    onValueChange={(val) => {
                      if (val) setPaymentMode(val as PaymentMode);
                    }}
                  >
                    <SelectTrigger className="h-8 border-slate-850 bg-slate-900/60 text-slate-100 text-xs focus:ring-violet-500">
                      <SelectValue placeholder="Payment Mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-150">
                      <SelectItem value="CASH">Cash Payment</SelectItem>
                      <SelectItem value="CARD">Card Payment</SelectItem>
                      <SelectItem value="MOBILE_PAY">Mobile Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="w-full space-y-1.5 pt-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Discount Applied</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Tax (10%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-100 pt-1.5 border-t border-slate-850">
                  <span>Grand Total</span>
                  <span className="text-violet-400">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Submit Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={items.length === 0 || checkoutLoading}
                className="w-full h-10 font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Checkout...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Sales Checkout
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* dialog for receipt popup after checkout */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm">
          <DialogHeader className="text-center pb-2 border-b border-slate-800">
            <DialogTitle className="text-emerald-400 flex items-center justify-center gap-1.5 text-base font-bold">
              <CheckCircle className="h-5 w-5" />
              Transaction Success
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Invoice generated successfully
            </DialogDescription>
          </DialogHeader>

          {/* Receipt Print Area */}
          <div id="receipt-print-area" className="py-4 space-y-3 font-mono text-[11px] text-slate-350 bg-slate-950/20 p-3 rounded-lg border border-slate-850">
            <div className="text-center">
              <h2 className="font-bold text-sm text-slate-200">SuperPOS INC.</h2>
              <p>123 Enterprise Rd, Suite 4</p>
              <p>Tel: (555) 019-2834</p>
            </div>
            
            <div className="border-b border-slate-850/60 my-2"></div>
            
            <div>
              <p><span className="font-semibold text-slate-400">Invoice:</span> {invoiceOrder?.invoiceNumber}</p>
              <p><span className="font-semibold text-slate-400">Cashier:</span> {invoiceOrder?.cashierName}</p>
              <p><span className="font-semibold text-slate-400">Customer:</span> {invoiceOrder?.customerName || 'Walk-in Customer'}</p>
              <p><span className="font-semibold text-slate-400">Date:</span> {invoiceOrder ? new Date(invoiceOrder.orderDate).toLocaleString() : ''}</p>
            </div>

            <div className="border-b border-slate-850/60 my-2"></div>

            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px]">
                  <th>Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {invoiceOrder?.items.map((item) => (
                  <tr key={item.id}>
                    <td className="truncate max-w-[140px]">{item.productName}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-b border-slate-850/60 my-2"></div>

            <div className="space-y-1 text-right">
              <p>Subtotal: {formatCurrency(invoiceOrder?.subTotal || 0)}</p>
              {invoiceOrder && invoiceOrder.discount > 0 && (
                <p>Discount: -{formatCurrency(invoiceOrder.discount)}</p>
              )}
              <p>Tax (10%): {formatCurrency(invoiceOrder?.tax || 0)}</p>
              <p className="font-bold text-slate-200 text-xs">Total Paid: {formatCurrency(invoiceOrder?.grandTotal || 0)}</p>
            </div>

            <div className="border-b border-slate-850/60 my-2"></div>

            <div className="text-center text-[10px] text-slate-500">
              <p>Method: {invoiceOrder?.paymentMode}</p>
              <p>Thank you for shopping with us!</p>
            </div>
          </div>

          <DialogFooter className="flex sm:justify-between gap-2 border-t border-slate-800 pt-3">
            <Button 
              variant="outline" 
              onClick={printReceipt} 
              className="text-xs gap-1.5 border-slate-800 hover:bg-slate-800 text-slate-350"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Invoice
            </Button>
            <Button 
              onClick={() => setShowInvoiceDialog(false)}
              className="text-xs bg-violet-600 hover:bg-violet-500 text-white"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* dialog for adding a new customer */}
      <Dialog open={showAddCustDialog} onOpenChange={setShowAddCustDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-violet-500" />
              Create Customer Loyalty Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Register customer for loyalty points tracking
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddCustomerSubmit} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="new-cust-name" className="text-slate-300">Customer Name *</Label>
              <Input
                id="new-cust-name"
                type="text"
                placeholder="Full name"
                required
                className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 placeholder-slate-500 text-xs focus-visible:ring-violet-500"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-cust-phone" className="text-slate-300">Phone Number</Label>
              <Input
                id="new-cust-phone"
                type="text"
                placeholder="Phone number"
                className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 placeholder-slate-500 text-xs focus-visible:ring-violet-500"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-cust-email" className="text-slate-300">Email Address</Label>
              <Input
                id="new-cust-email"
                type="email"
                placeholder="Email address"
                className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 placeholder-slate-500 text-xs focus-visible:ring-violet-500"
                value={newCustEmail}
                onChange={(e) => setNewCustEmail(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2 border-t border-slate-800">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowAddCustDialog(false)}
                className="h-8 text-xs text-slate-400 hover:text-white hover:bg-slate-850"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="h-8 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold"
              >
                Save Profile
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
