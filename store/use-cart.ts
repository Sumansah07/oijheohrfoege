import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    color?: string;
    size?: string;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addItem: (item: CartItem) => void;
    removeItem: (id: string, color?: string, size?: string) => void;
    updateQuantity: (id: string, quantity: number, color?: string, size?: string) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            addItem: (newItem) => {
                const currentItems = get().items;
                const existingItemIndex = currentItems.findIndex(
                    (item) =>
                        item.id === newItem.id &&
                        item.color === newItem.color &&
                        item.size === newItem.size
                );

                if (existingItemIndex > -1) {
                    const updatedItems = [...currentItems];
                    updatedItems[existingItemIndex].quantity += newItem.quantity;
                    set({ items: updatedItems });
                } else {
                    set({ items: [...currentItems, newItem] });
                }
            },

            removeItem: (id, color, size) => {
                set({
                    items: get().items.filter(
                        (item) =>
                            !(item.id === id && item.color === color && item.size === size)
                    ),
                });
            },

            updateQuantity: (id, quantity, color, size) => {
                if (quantity <= 0) {
                    get().removeItem(id, color, size);
                    return;
                }

                set({
                    items: get().items.map((item) =>
                        item.id === id && item.color === color && item.size === size
                            ? { ...item, quantity }
                            : item
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

            totalPrice: () =>
                get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
