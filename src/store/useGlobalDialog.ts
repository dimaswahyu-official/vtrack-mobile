import { create } from 'zustand';

type DialogType = 'success' | 'error';

interface DialogState {
    visible: boolean;
    type: DialogType;
    title: string;
    showDialog: (type: DialogType, title: string) => void;
    hideDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
    visible: false,
    type: 'success',
    title: '',
    showDialog: (type, title) => set({ visible: true, type, title }),
    hideDialog: () => set({ visible: false, title: '' }),
}));