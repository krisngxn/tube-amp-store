'use client';

/**
 * Cart Store
 * Zustand store for managing cart state with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartState } from './cart.types';
import { calculateSubtotal, calculateItemCount } from './cart.utils';

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const currentItems = get().items;
                const existingIndex = currentItems.findIndex(
                    (i) => i.productId === item.productId
                );

                if (existingIndex >= 0) {
                    // Item exists, increment quantity
                    const updatedItems = [...currentItems];
                    const existingItem = updatedItems[existingIndex];
                    updatedItems[existingIndex] = {
                        ...existingItem,
                        quantity: existingItem.quantity + (item.quantity || 1),
                    };
                    set({ items: updatedItems });
                } else {
                    // New item
                    const newItem: CartItem = {
                        ...item,
                        quantity: item.quantity || 1,
                    };
                    set({ items: [...currentItems, newItem] });
                }
            },

            removeItem: (productId) => {
                set({
                    items: get().items.filter((item) => item.productId !== productId),
                });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                const currentItems = get().items;
                const updatedItems = currentItems.map((item) =>
                    item.productId === productId
                        ? { ...item, quantity: Math.max(1, quantity) }
                        : item
                );
                set({ items: updatedItems });
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotal: () => {
                return calculateSubtotal(get().items);
            },

            getItemCount: () => {
                return calculateItemCount(get().items);
            },

            hasItem: (productId) => {
                return get().items.some((item) => item.productId === productId);
            },
        }),
        {
            name: 'rtb_cart',
            // Custom storage to handle SSR
            storage: {
                getItem: (name) => {
                    if (typeof window === 'undefined') {
                        return null;
                    }
                    const value = localStorage.getItem(name);
                    return value ? JSON.parse(value) : null;
                },
                setItem: (name, value) => {
                    if (typeof window === 'undefined') {
                        return;
                    }
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name) => {
                    if (typeof window === 'undefined') {
                        return;
                    }
                    localStorage.removeItem(name);
                },
            },
        }
    )
);

