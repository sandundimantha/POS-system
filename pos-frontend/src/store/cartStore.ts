import { create } from 'zustand';
import { CartItem, Product, Customer } from '@/types';

interface CartState {
  items: CartItem[];
  customer: Customer | null;
  discount: number; // Flat discount amount
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setDiscount: (discount: number) => void;
  clearCart: () => void;
  // Computed values
  getTotals: () => {
    subtotal: number;
    discount: number;
    tax: number;
    grandTotal: number;
  };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer: null,
  discount: 0,

  addToCart: (product, quantity = 1) => {
    const { items } = get();
    const existingIndex = items.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const updatedItems = [...items];
      const newQty = updatedItems[existingIndex].quantity + quantity;
      
      // Stock limit check
      if (newQty <= product.stockQuantity) {
        updatedItems[existingIndex].quantity = newQty;
        set({ items: updatedItems });
      }
    } else {
      // Add new item if within stock
      if (quantity <= product.stockQuantity) {
        set({ items: [...items, { product, quantity }] });
      }
    }
  },

  removeFromCart: (productId) => {
    set({
      items: get().items.filter((item) => item.product.id !== productId),
    });
  },

  updateQuantity: (productId, quantity) => {
    const { items } = get();
    const item = items.find((item) => item.product.id === productId);
    if (!item) return;

    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    // Ensure we don't exceed stock quantity
    if (quantity <= item.product.stockQuantity) {
      const updatedItems = items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      set({ items: updatedItems });
    }
  },

  setCustomer: (customer) => set({ customer }),
  
  setDiscount: (discount) => set({ discount: Math.max(0, discount) }),

  clearCart: () => set({ items: [], customer: null, discount: 0 }),

  getTotals: () => {
    const { items, discount } = get();
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const taxRate = 0.1; // 10% tax rate
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * taxRate;
    const grandTotal = taxableAmount + tax;

    return {
      subtotal,
      discount,
      tax,
      grandTotal,
    };
  },
}));
