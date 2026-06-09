'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { productService, ProductPayload } from '@/services/product.service';
import { categoryService, CategoryPayload } from '@/services/category.service';
import { supplierService } from '@/services/supplier.service';
import { Product, Category, Supplier } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Search, 
  Loader2, 
  AlertTriangle,
  Image as ImageIcon,
  Check
} from 'lucide-react';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  
  // Data loading states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [prodSearch, setProdSearch] = useState('');

  // Modals visibility
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  // Form states: Product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodStock, setProdStock] = useState(0);
  const [prodThreshold, setProdThreshold] = useState(10);
  const [prodCategoryId, setProdCategoryId] = useState<number | null>(null);
  const [prodSupplierId, setProdSupplierId] = useState<number | null>(null);

  // Form states: Category
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');

  // Form states: Image Upload
  const [imageProduct, setImageProduct] = useState<Product | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pData, cData, sData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        supplierService.getAll(),
      ]);
      setProducts(pData);
      setCategories(cData);
      setSuppliers(sData);
    } catch (error) {
      console.error('Failed to load inventory data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setProdSearch(val);
    if (!val.trim()) {
      const pData = await productService.getAll();
      setProducts(pData);
      return;
    }
    try {
      const filtered = await productService.search(val);
      setProducts(filtered);
    } catch (error) {
      console.error('Product search error', error);
    }
  };

  // PRODUCT CRUD HANDLERS
  const openCreateProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDescription('');
    setProdSku('');
    setProdPrice(0);
    setProdStock(0);
    setProdThreshold(10);
    setProdCategoryId(categories[0]?.id || null);
    setProdSupplierId(suppliers[0]?.id || null);
    setShowProductDialog(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdDescription(p.description || '');
    setProdSku(p.sku);
    setProdPrice(p.price);
    setProdStock(p.stockQuantity);
    setProdThreshold(p.minStockThreshold);
    setProdCategoryId(p.categoryId);
    setProdSupplierId(p.supplierId || null);
    setShowProductDialog(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodSku || !prodCategoryId) return;

    const payload: ProductPayload = {
      name: prodName,
      description: prodDescription || undefined,
      sku: prodSku,
      price: prodPrice,
      stockQuantity: prodStock,
      minStockThreshold: prodThreshold,
      categoryId: prodCategoryId,
      supplierId: prodSupplierId || undefined,
    };

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
      } else {
        await productService.create(payload);
      }
      setShowProductDialog(false);
      loadData();
    } catch (error) {
      console.error('Product save error', error);
    }
  };

  const handleProductDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete product', error);
      }
    }
  };

  // CATEGORY CRUD HANDLERS
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDescription('');
    setShowCategoryDialog(true);
  };

  const openEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCatName(c.name);
    setCatDescription(c.description || '');
    setShowCategoryDialog(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    const payload: CategoryPayload = {
      name: catName,
      description: catDescription || undefined,
    };

    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, payload);
      } else {
        await categoryService.create(payload);
      }
      setShowCategoryDialog(false);
      loadData();
    } catch (error) {
      console.error('Category save error', error);
    }
  };

  const handleCategoryDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category? All products under it will need updates.')) {
      try {
        await categoryService.delete(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete category', error);
      }
    }
  };

  // IMAGE UPLOAD HANDLER
  const openImageUpload = (p: Product) => {
    setImageProduct(p);
    setSelectedFile(null);
    setShowImageDialog(true);
  };

  const handleImageUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageProduct || !selectedFile) return;

    setUploadingImage(true);
    try {
      await productService.uploadImage(imageProduct.id, selectedFile);
      setShowImageDialog(false);
      loadData();
    } catch (error) {
      console.error('Image upload failed', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  return (
    <DashboardLayout requiredRoles={['ADMIN', 'MANAGER']}>
      <div className="space-y-6 font-sans">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Inventory & Products Hub
            </h1>
            <p className="text-xs text-slate-400">Control catalog listings and restock operations</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={activeTab === 'products' ? openCreateProduct : openCreateCategory}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs h-9 gap-1.5 shadow-md shadow-violet-500/10"
            >
              <Plus className="h-4 w-4" />
              {activeTab === 'products' ? 'Add Product' : 'Add Category'}
            </Button>
          </div>
        </div>

        {/* Custom Tab Selectors */}
        <div className="flex border-b border-slate-800 gap-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-2 text-xs font-semibold uppercase tracking-wider transition-all relative ${
              activeTab === 'products' 
                ? 'text-violet-400 border-b-2 border-violet-500 font-bold' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Products List ({products.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-2 text-xs font-semibold uppercase tracking-wider transition-all relative ${
              activeTab === 'categories' 
                ? 'text-violet-400 border-b-2 border-violet-500 font-bold' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Categories ({categories.length})
            </span>
          </button>
        </div>

        {/* Tab 1: Products Panel */}
        {activeTab === 'products' && (
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold text-slate-200">Catalog Registry</CardTitle>
                <CardDescription className="text-xs text-slate-500">Products inventory levels and details</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Filter by SKU / Name..."
                  className="pl-9 h-9 text-xs border-slate-800 bg-slate-950/40 focus-visible:ring-violet-500"
                  value={prodSearch}
                  onChange={handleProductSearch}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
                </div>
              ) : products.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-12">No products currently listed in inventory.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                        <th className="pb-3 font-semibold pl-2">Photo</th>
                        <th className="pb-3 font-semibold">Product Details</th>
                        <th className="pb-3 font-semibold">SKU</th>
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold">Price</th>
                        <th className="pb-3 font-semibold">Stock Level</th>
                        <th className="pb-3 font-semibold text-right pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {products.map((p) => {
                        const isLow = p.stockQuantity <= p.minStockThreshold;
                        return (
                          <tr key={p.id} className="text-slate-300 hover:bg-slate-800/10 transition-colors">
                            <td className="py-3 pl-2">
                              <div className="h-10 w-10 bg-slate-950 rounded-lg flex items-center justify-center text-slate-700 overflow-hidden border border-slate-800 relative">
                                {p.imagePath ? (
                                  <img 
                                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/uploads/${p.imagePath}`}
                                    alt={p.name} 
                                    className="object-cover h-full w-full"
                                  />
                                ) : (
                                  <ImageIcon className="h-4 w-4" />
                                )}
                              </div>
                            </td>
                            <td className="py-3">
                              <p className="font-semibold text-slate-100 text-xs">{p.name}</p>
                              <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{p.description || 'No description'}</p>
                            </td>
                            <td className="py-3 font-mono text-[10px] text-slate-400">{p.sku}</td>
                            <td className="py-3 text-xs">{p.categoryName}</td>
                            <td className="py-3 font-semibold text-xs">{formatCurrency(p.price)}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-semibold ${isLow ? 'text-rose-400' : 'text-slate-200'}`}>
                                  {p.stockQuantity}
                                </span>
                                {isLow && (
                                  <Badge className="bg-rose-500/10 border-rose-500/20 text-rose-400 text-[8px] px-1 py-0 border">
                                    Low
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 text-right pr-2">
                              <div className="flex justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon-xs"
                                  onClick={() => openImageUpload(p)}
                                  className="text-slate-400 hover:text-white"
                                  title="Upload Image"
                                >
                                  <Upload className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon-xs" 
                                  onClick={() => openEditProduct(p)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon-xs" 
                                  onClick={() => handleProductDelete(p.id)}
                                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Categories Panel */}
        {activeTab === 'categories' && (
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-200">Category Index</CardTitle>
              <CardDescription className="text-xs text-slate-500">Inventory categorization tags</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
                </div>
              ) : categories.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-12">No categories defined yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                        <th className="pb-3 font-semibold pl-2">ID</th>
                        <th className="pb-3 font-semibold">Category Name</th>
                        <th className="pb-3 font-semibold">Description</th>
                        <th className="pb-3 font-semibold text-right pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {categories.map((c) => (
                        <tr key={c.id} className="text-slate-300 hover:bg-slate-800/10 transition-colors">
                          <td className="py-3 pl-2 text-xs font-mono text-slate-400">{c.id}</td>
                          <td className="py-3 font-semibold text-slate-100 text-xs">{c.name}</td>
                          <td className="py-3 text-xs text-slate-400">{c.description || 'No description provided'}</td>
                          <td className="py-3 text-right pr-2">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon-xs" 
                                onClick={() => openEditCategory(c)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon-xs" 
                                onClick={() => handleCategoryDelete(c.id)}
                                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
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
        )}
      </div>

      {/* Product Form dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-100">
              {editingProduct ? 'Edit Catalog Product' : 'Register New Product'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Enter catalog listing parameters below
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProductSubmit} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="prod-name" className="text-slate-350">Product Name *</Label>
                <Input
                  id="prod-name"
                  type="text"
                  required
                  placeholder="e.g. Organic Juice"
                  className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="prod-sku" className="text-slate-350">SKU Code *</Label>
                <Input
                  id="prod-sku"
                  type="text"
                  required
                  placeholder="e.g. BEV-ORG-JUICE"
                  className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                  value={prodSku}
                  onChange={(e) => setProdSku(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="prod-desc" className="text-slate-350">Description</Label>
              <Input
                id="prod-desc"
                type="text"
                placeholder="Product characteristics..."
                className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                value={prodDescription}
                onChange={(e) => setProdDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="prod-price" className="text-slate-350">Unit Price *</Label>
                <Input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  required
                  className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                  value={prodPrice || ''}
                  onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="prod-stock" className="text-slate-350">Stock Quantity *</Label>
                <Input
                  id="prod-stock"
                  type="number"
                  required
                  className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                  value={prodStock || ''}
                  onChange={(e) => setProdStock(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="prod-threshold" className="text-slate-350">Min Limit</Label>
                <Input
                  id="prod-threshold"
                  type="number"
                  className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                  value={prodThreshold || ''}
                  onChange={(e) => setProdThreshold(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="prod-cat" className="text-slate-355">Category *</Label>
                <Select
                  value={prodCategoryId ? String(prodCategoryId) : ''}
                  onValueChange={(val) => {
                    if (val) setProdCategoryId(parseInt(val));
                  }}
                >
                  <SelectTrigger className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus:ring-violet-500">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="prod-sup" className="text-slate-355">Supplier</Label>
                <Select
                  value={prodSupplierId ? String(prodSupplierId) : 'none'}
                  onValueChange={(val) => {
                    if (val === 'none' || !val) {
                      setProdSupplierId(null);
                    } else {
                      setProdSupplierId(parseInt(val));
                    }
                  }}
                >
                  <SelectTrigger className="h-8 border-slate-850 bg-slate-950/50 text-slate-100 text-xs focus:ring-violet-500">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="none">No Supplier</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800/80">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowProductDialog(false)}
                className="h-8 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="h-8 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold"
              >
                {editingProduct ? 'Save Changes' : 'Create Listing'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Form dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-100">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Describe category tag properties
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCategorySubmit} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name" className="text-slate-350">Category Name *</Label>
              <Input
                id="cat-name"
                type="text"
                required
                placeholder="e.g. Beverages"
                className="h-8 border-slate-850 bg-slate-955/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-desc" className="text-slate-350">Description</Label>
              <Input
                id="cat-desc"
                type="text"
                placeholder="Category description..."
                className="h-8 border-slate-855 bg-slate-955/50 text-slate-100 text-xs focus-visible:ring-violet-500"
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowCategoryDialog(false)}
                className="h-8 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="h-8 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold"
              >
                {editingCategory ? 'Save' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Upload dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-violet-500" />
              Upload Product Photo
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Select an image file to bind to product: {imageProduct?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleImageUploadSubmit} className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-slate-400">Choose Image File (JPEG/PNG/WebP, max 5MB)</Label>
              <div className="flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg p-6 bg-slate-950/20 hover:border-slate-700 transition-all cursor-pointer relative">
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-center space-y-1">
                  <ImageIcon className="h-6 w-6 text-slate-650 mx-auto" />
                  <span className="block text-[10px] text-slate-500">
                    {selectedFile ? selectedFile.name : 'Drag & drop or click to browse'}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowImageDialog(false)}
                className="h-8 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!selectedFile || uploadingImage}
                className="h-8 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold gap-1.5"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Upload Image
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
