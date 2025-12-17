/**
 * Cart Types
 * Defines the structure of cart items and cart state
 */

export type CartItem = {
    productId: string;
    slug: string;
    name: string;
    priceVnd: number; // Snapshot price at add-to-cart time
    quantity: number;
    primaryImageUrl?: string;
    requiresDeposit?: boolean; // Flag for deposit reservation orders
    depositAmount?: number; // Calculated deposit amount
    depositType?: 'percent' | 'fixed'; // Deposit type from product
    depositPercentage?: number; // Deposit percentage if applicable
};

export interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
    hasItem: (productId: string) => boolean;
}

