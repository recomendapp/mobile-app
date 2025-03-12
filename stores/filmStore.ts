// stores/filmStore.ts
import { create } from 'zustand';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

interface FilmState {
  sv: SharedValue<number>;
  filmHeaderHeight: SharedValue<number>;
  headerHeight: SharedValue<number>;
  stickyHeight: SharedValue<number>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setHeaderHeight: (height: number) => void;
  setStickyHeight: (height: number) => void;
  setFilmHeaderHeight: (height: number) => void;
}

export const useFilmStore = create<FilmState>((set) => {
  const sv = useSharedValue<number>(0);
  const filmHeaderHeight = useSharedValue<number>(0);
  const headerHeight = useSharedValue<number>(0);
  const stickyHeight = useSharedValue<number>(0);

  return {
    sv,
    filmHeaderHeight,
    headerHeight,
    stickyHeight,
    loading: false,
    setLoading: (loading) => set({ loading }),
    setHeaderHeight: (height) => {
      headerHeight.value = height;
    },
    setStickyHeight: (height) => {
      stickyHeight.value = height;
    },
    setFilmHeaderHeight: (height) => {
      filmHeaderHeight.value = height;
    },
  };
});