import { create } from 'zustand';

interface LoadingDialogState {
    visible: boolean;
    message: string;
    showLoadingDialog: (message: string) => void;
    hideLoadingDialog: () => void;
}

export const useLoadingDialogStore = create<LoadingDialogState>((set) => ({
    visible: false,
    message: '',
    showLoadingDialog: (message) => set({ visible: true, message }),
    hideLoadingDialog: () => set({ visible: false, message: '' }),
}));
