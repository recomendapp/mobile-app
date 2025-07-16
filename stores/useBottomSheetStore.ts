import { create } from 'zustand';
import React from 'react';
import * as Haptics from 'expo-haptics';
import { SheetSize, TrueSheet } from '@lodev09/react-native-true-sheet';

type BottomSheetContentComponent<T> =
  | React.ComponentType<T>
  | React.ForwardRefExoticComponent<T & React.RefAttributes<TrueSheet>>;

export type SheetState<T = any> = {
  id: string;
  ref: React.RefObject<TrueSheet> | null;
  content: BottomSheetContentComponent<T>;
  props?: Omit<T, 'id' | 'open' | 'onOpenChange'>;
  sizes?: SheetSize[];
  persistent: boolean;
  parentId?: string;
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
    options?: {
      sizes?: SheetSize[] | null | undefined,
      persistent?: boolean,
      parentId?: string,
    },
  ) => Promise<string>;
  closeSheet: (id: string) => Promise<void>;
  removeSheet: (id: string) => void;
  closeAll: () => void;
};

const useBottomSheetStore = create<BottomSheetStore>((set, get) => ({
  sheets: [],
  openSheet: async <T>(
    content: BottomSheetContentComponent<T>,
    props: Omit<T, 'id' | 'open' | 'onOpenChange'>,
    options: {
      sizes?: SheetSize[] | null;
      persistent?: boolean;
      parentId?: string;
    } = {
      sizes: undefined,
      persistent: false,
      parentId: undefined,
    },
  ) => {
    const id = Math.random().toString(36).substring(7);
    // const id = generateSheetId(content, props);
    // const existingSheet = get().sheets.find((s) => s.id === id);
    // if (existingSheet) return id;
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const sheetRef = React.createRef<TrueSheet>() as React.RefObject<TrueSheet>;
    set((state) => ({
      sheets: [
        ...state.sheets,
        {
          id,
          ref: sheetRef,
          content,
          props,
          sizes: options.sizes === null ? [] : options.sizes,
          persistent: options.persistent ?? false,
          parentId: options.parentId,
        },
      ],
    }));
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
}));

export default useBottomSheetStore;