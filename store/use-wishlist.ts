import { create } from 'zustand'

interface WishlistState {
    itemIds: string[];
    isLoaded: boolean;
    setItems: (ids: string[]) => void;
    toggleItem: (id: string) => void;
}

export const useWishlist = create<WishlistState>((set) => ({
    itemIds: [],
    isLoaded: false,
    setItems: (ids) => set({ itemIds: ids, isLoaded: true }),
    toggleItem: (id) => set((state) => ({
        itemIds: state.itemIds.includes(id)
            ? state.itemIds.filter((itemId) => itemId !== id)
            : [...state.itemIds, id]
    }))
}))
