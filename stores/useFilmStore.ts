import { create } from 'zustand';
import Animated, { makeMutable } from 'react-native-reanimated';
import type { AnimatedRef } from 'react-native-reanimated';
import { Mutable } from 'react-native-reanimated/lib/typescript/commonTypes';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';

type ScrollableRef = AnimatedRef<
	| Animated.FlatList<any>
	// | Animated.FlatList<any>
	// | FlashList<any>
>;

type FilmStore = {
  tabState?: TabNavigationState<ParamListBase>;
  movieId: number;
  scrollRefs: Map<string, ScrollableRef>;
  listOffsets: Map<string, number>;
  headerHeight: Mutable<number>;
  headerOverlayHeight: Mutable<number>;
  tabBarHeight: Mutable<number>;
  scrollY: Mutable<number>;
  headerScrollY: Mutable<number>;
  headerMoveScrollY: Mutable<number>;

  init: (movieId: number) => void;
  setTabState: (state: any) => void;
  addScrollRef: (key: string, ref: ScrollableRef) => void;
  removeScrollRef: (key: string) => void;
  syncScrollOffset: () => void;
  handleHeaderScroll: (value: number) => void;
};

export const useFilmStore = create<FilmStore>((set, get) => ({
	tabState: undefined,
	movieId: 0,
	scrollRefs: new Map(),
	listOffsets: new Map(),
	headerHeight: makeMutable(0),
	headerOverlayHeight: makeMutable(43),
	tabBarHeight: makeMutable(33),
	scrollY: makeMutable(0),
	headerScrollY: makeMutable(0),
	headerMoveScrollY: makeMutable(0),

	init: (movieId) => set({
		tabState: undefined,
		movieId,
		scrollRefs: new Map(),
		listOffsets: new Map(),
		headerHeight: makeMutable(0),
		headerOverlayHeight: makeMutable(43),
		tabBarHeight: makeMutable(33),
		scrollY: makeMutable(0),
		headerScrollY: makeMutable(0),
		headerMoveScrollY: makeMutable(0),
	}),

	setTabState: (tabState) => set({ tabState }),

	addScrollRef: (key, ref) => {
		const k = get().tabState?.routes.find((r) => r.key === key)?.key;
		if (!k) return;
		get().scrollRefs.set(k, ref);
	},

	removeScrollRef: (key) => {
		const k = get().tabState?.routes.find((r) => r.key === key)?.key;
		if (!k) return;
		get().scrollRefs.delete(k);
	},

	syncScrollOffset: () => {
		const { scrollY, tabState, headerHeight, scrollRefs, listOffsets } = get();
		if (!tabState) return;
		const currentKey = tabState.routes[tabState.index].key;
		scrollRefs.forEach((ref, refKey) => {
			if (refKey !== currentKey && ref.current) {
				const offset = scrollY.value;
				const header = headerHeight.value;
				if (offset < header && offset >= 0) {
					ref.current.scrollToOffset({ offset, animated: false });
					listOffsets.set(refKey, offset);
				} else if (offset >= header) {
					const prevOffset = listOffsets.get(refKey) ?? 0;
					if (prevOffset < header) {
						ref.current.scrollToOffset({ offset: header, animated: false });
						listOffsets.set(refKey, header);
					}
				}
			}
		});
	},

	handleHeaderScroll: (value: number) => {
		const { tabState, scrollRefs, headerHeight, syncScrollOffset } = get();
		if (!tabState) return;
	
		const currentKey = tabState.routes[tabState.index].key;
		const currentRef = scrollRefs.get(currentKey);
	
		if (!currentRef) return;
	
		if (value > headerHeight.value || value < 0) {
			syncScrollOffset();
		}
	
		if (value <= headerHeight.value && currentRef.current) {
			currentRef.current.scrollToOffset({
				offset: value,
				animated: false,
			});
		}
	},
}));
