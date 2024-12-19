import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Mobile } from '../../helpers/types';

interface CartItem extends Mobile {
  amount: number;
}

interface CartState {
  items: CartItem[];
  cartItems: CartItem[];
  amount: number;
  total: number;
}

const initialState: CartState = {
  items: [],
  cartItems: [],
  amount: 0,
  total: 0,
};

const calculateTotal = (cartItems: CartItem[]): number =>
  cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.amount), 0);

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  selectors: {
    items: (state: CartState) => state.items,
    cartItems: (state: CartState) => state.cartItems,
    cartAmount: (state: CartState) => state.amount,
    cartTotal: (state: CartState) => state.total,
  },
  reducers: {
    setItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.cartItems.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.amount += 1;
      } else {
        state.cartItems.push({ ...action.payload, amount: 1 });
      }
      state.amount += 1;
      state.total = calculateTotal(state.cartItems);
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      state.amount = 0;
      state.total = 0;
    },
    removeCartItem: (state, action: PayloadAction<string>) => {
      const removedItem = state.cartItems.find(item => item.id === action.payload);
      state.cartItems = state.cartItems.filter(item => item.id !== action.payload);
      if (removedItem) {
        state.amount -= removedItem.amount;
      }
      state.total = calculateTotal(state.cartItems);
    },
    updateCartItemAmount: (state, action: PayloadAction<{ id: string, change: number }>) => {
      const { id, change } = action.payload;
      const cartItem = state.cartItems.find(item => item.id === id);

      if (cartItem) {
        cartItem.amount = Math.max(0, cartItem.amount + change);
        if (cartItem.amount === 0) {
          state.cartItems = state.cartItems.filter(item => item.id !== id);
        }
      } else if (change > 0) {
        const newItem = state.items.find(item => item.id === id);
        if (newItem) {
          state.cartItems.push({ ...newItem, amount: change });
        }
      }

      state.amount = state.cartItems.reduce((total, item) => total + item.amount, 0);
      state.total = calculateTotal(state.cartItems);
    },
  },
});
