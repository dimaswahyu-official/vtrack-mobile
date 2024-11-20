// src/store/useLoadingStore.ts
import { create } from 'zustand';

interface LoadingState {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
    isLoading: true,
    setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
