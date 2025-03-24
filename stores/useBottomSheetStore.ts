import { create } from 'zustand';
import React, { ForwardRefExoticComponent, RefAttributes } from 'react';
import {
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFlashList,
  BottomSheetFlatList,
  BottomSheetSectionList,
} from '@gorhom/bottom-sheet';
import { useRouter, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import BottomSheetConfirm from '@/components/bottom-sheets/templates/BottomSheetConfirm';

type BottomSheetContentElement =
  | React.ReactElement<typeof BottomSheetView>
  | React.ReactElement<typeof BottomSheetScrollView>
  | React.ReactElement<typeof BottomSheetFlashList>
  | React.ReactElement<typeof BottomSheetFlatList>
  | React.ReactElement<typeof BottomSheetSectionList>;

  type BottomSheetContentComponent<T> =
  | (React.ComponentType<T> & { (props: T): BottomSheetContentElement })
  | ForwardRefExoticComponent<T & RefAttributes<any>>;

type SheetState<T = any> = {
  id: string;
  isOpen: boolean;
  isClosing: boolean;
  content: BottomSheetContentComponent<T>;
  props?: Omit<T, 'id' | 'open' | 'onOpenChange'>;
  snapPoints?: string[];
  persistent: boolean; // Nouvelle propriété
};

type BottomSheetStore = {
  sheets: SheetState[];
  openSheet: <T>(
    content: BottomSheetContentComponent<T>,
    props: Omit<T, 'id' | 'open' | 'onOpenChange'>,
    snapPoints?: string[] | null,
    persistent?: boolean // Optionnel, défaut à false
  ) => string;
  closeSheet: (id: string) => void;
  removeSheet: (id: string) => void;
  closeAll: () => void;
  createConfirmSheet: (options: {
    title: string;
    description?: string | React.ReactNode;
    onConfirm: () => void;
    cancelLabel?: string;
    confirmLabel?: string;
  }) => string;
};

const useBottomSheetStore = create<BottomSheetStore>((set, get) => ({
  sheets: [],
  openSheet: <T>(
    content: BottomSheetContentComponent<T>,
    props: Omit<T, 'id' | 'open' | 'onOpenChange'>,
    snapPoints: string[] | null | undefined = ['40%', '60%'],
    persistent = false // Défaut à false
  ) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      sheets: [
        ...state.sheets,
        {
          id,
          isOpen: true,
          isClosing: false,
          content,
          props,
          snapPoints: snapPoints === null ? [] : snapPoints,
          persistent,
        },
      ],
    }));
    return id;
  },
  closeSheet: (id: string) => {
    const sheet = get().sheets.find((s) => s.id === id);
    if (!sheet) return;
    set((state) => ({
      sheets: state.sheets.map((s) =>
        s.id === id ? { ...s, isOpen: false, isClosing: true } : s
      ),
    }));
    // Délai pour laisser l’animation se terminer avant suppression
    setTimeout(() => get().removeSheet(id), 300);
  },
  removeSheet: (id: string) => {
    set((state) => ({
      sheets: state.sheets.filter((s) => s.id !== id),
    }));
  },
  closeAll: () => {
    set((state) => ({
      sheets: state.sheets.map((s) => ({ ...s, isOpen: false, isClosing: true })),
    }));
    setTimeout(() => set({ sheets: [] }), 300);
  },
  createConfirmSheet: ({ title, description, onConfirm, cancelLabel, confirmLabel }) => {
    return get().openSheet(BottomSheetConfirm, {
      title,
      description,
      onConfirm,
      cancelLabel,
      confirmLabel,
    }, ['30%'], true);
  },
}));

export default useBottomSheetStore;