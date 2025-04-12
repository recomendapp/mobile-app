import { create } from 'zustand';
import React, { ForwardRefExoticComponent, RefAttributes } from 'react';
import BottomSheetConfirm from '@/components/bottom-sheets/templates/BottomSheetConfirm';
import * as Haptics from 'expo-haptics';
import { SheetSize, TrueSheet } from '@lodev09/react-native-true-sheet';

type BottomSheetContentComponent<T> =
  | React.ComponentType<T>
  | ForwardRefExoticComponent<T & RefAttributes<TrueSheet>>;

type SheetState<T = any> = {
  id: string;
  ref: React.RefObject<TrueSheet> | null;
  content: BottomSheetContentComponent<T>;
  props?: Omit<T, 'id' | 'open' | 'onOpenChange'>;
  sizes?: SheetSize[];
  persistent: boolean; // Nouvelle propriété
};

const generateSheetId = <T>(
  content: BottomSheetContentComponent<T>,
  props: Omit<T, 'id' | 'open' | 'onOpenChange'>
): string => {
  const contentName = content.displayName || content.name || 'unknown';
  const propsString = JSON.stringify(props, (key, value) => {
    if (typeof value === 'function') return undefined;
    return value;
  });
  return `${contentName}-${propsString}`;
};

type BottomSheetStore = {
  sheets: SheetState[];
  openSheet: <T>(
    content: BottomSheetContentComponent<T>,
    props: Omit<T, 'id' | 'open' | 'onOpenChange'>,
    sizes?: SheetSize[] | null,
    persistent?: boolean // Optionnel, défaut à false
  ) => Promise<string>;
  closeSheet: (id: string) => Promise<void>;
  removeSheet: (id: string) => void;
  closeAll: () => void;
  createConfirmSheet: (options: {
    title: string;
    description?: string | React.ReactNode;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
    cancelLabel?: string;
    confirmLabel?: string;
  }) => Promise<string>;
};

const useBottomSheetStore = create<BottomSheetStore>((set, get) => ({
  sheets: [],
  openSheet: async <T>(
    content: BottomSheetContentComponent<T>,
    props: Omit<T, 'id' | 'open' | 'onOpenChange'>,
    sizes: SheetSize[] | null | undefined = ['auto'],
    persistent = false
  ) => {
    const id = Math.random().toString(36).substring(7);
    // const id = generateSheetId(content, props);
    // const existingSheet = get().sheets.find((s) => s.id === id);
    // if (existingSheet) return id;
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const sheetRef = React.createRef<TrueSheet>();
    set((state) => ({
      sheets: [
        ...state.sheets,
        {
          id,
          ref: sheetRef,
          content,
          props,
          sizes: sizes === null ? [] : sizes,
          persistent,
        },
      ],
    }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await sheetRef.current?.present();
    return id;
  },
  closeSheet: async (id: string) => {
    const sheet = get().sheets.find((s) => s.id === id);
    if (sheet?.ref) {
      await sheet.ref.current?.dismiss();
    }
  },
  removeSheet: (id: string) => {
    set((state) => ({
      sheets: state.sheets.filter((s) => s.id !== id),
    }));
  },
  closeAll: () => {
    const { sheets } = get();
    sheets.forEach((sheet) => {
      if (sheet.ref) {
        sheet.ref.current?.dismiss();
      }
    });
  },
  createConfirmSheet: async ({ title, description, onConfirm, onCancel, cancelLabel, confirmLabel }) => {
    return await get().openSheet(BottomSheetConfirm, {
      title,
      description,
      onConfirm,
      onCancel,
      cancelLabel,
      confirmLabel,
    }, ['auto'], true);
  },
}));

export default useBottomSheetStore;