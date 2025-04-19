import { useTheme } from '@/context/ThemeProvider';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import React from 'react';
import Animated, { AnimatedRef, runOnJS, SharedValue, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

type ScrollableRef = AnimatedRef<
	| Animated.FlatList<any>
	// | Animated.FlatList<any>
	// | FlashList<any>
>;

interface FilmContextType {
	tabState: TabNavigationState<ParamListBase> | undefined;
	headerHeight: SharedValue<number>;
	headerOverlayHeight: SharedValue<number>;
	tabBarHeight: SharedValue<number>;
	scrollY: SharedValue<number>;
	headerScrollY: SharedValue<number>;
  	headerMoveScrollY: SharedValue<number>;
	movieId: number;
	scrollRefs: Map<string, ScrollableRef>;
	listOffsets: Map<string, number>;
	addScrollRef: (key: string, ref: ScrollableRef) => void;
	removeScrollRef: (key: string) => void;
	syncScrollOffset: () => void;
}

const FilmContext = React.createContext<FilmContextType | undefined>(undefined);

interface FilmProviderProps {
	children: React.ReactNode;
	movieId: number;
	tabState: TabNavigationState<ParamListBase> | undefined;
	headerHeight: SharedValue<number>;
	headerOverlayHeight: SharedValue<number>;
	tabBarHeight: SharedValue<number>;
	scrollY: SharedValue<number>;
}
  
const FilmProvider: React.FC<FilmProviderProps> = ({
	children,
	movieId,
	tabState,
	headerHeight,
	headerOverlayHeight,
	tabBarHeight,
	scrollY,
}) => {
	const { inset } = useTheme();
	const scrollRefs = React.useRef<Map<string, ScrollableRef>>(new Map()).current;
	const listOffsets = React.useRef<Map<string, number>>(new Map()).current;
	const headerScrollY = useSharedValue(0);
  	const headerMoveScrollY = useSharedValue(0);

	const addScrollRef = (key: string, ref: ScrollableRef) => {
		const route = tabState?.routes.find((r) => r.key === key);
		if (!route) return;
		scrollRefs.set(route.key, ref);
	};
	const removeScrollRef = (key: string) => {
		const route = tabState?.routes.find((r) => r.key === key);
		if (!route) return;
		scrollRefs.delete(route.key);
	};
	const syncScrollOffset = () => {
		if (!tabState) return;
		const currentKey = tabState?.routes[tabState.index].key;
		const limitScrolll = headerHeight.get() - headerOverlayHeight.get() - inset.top;
		scrollRefs.forEach((ref, refKey) => {
			if (refKey !== currentKey) {
				if (scrollY.get() < limitScrolll && scrollY.get() >= 0) {
					if (ref.current) {
						ref.current.scrollToOffset({
							offset: scrollY.get(),
							animated: false,
						});
						listOffsets.set(refKey, scrollY.get());
					}
				} else if (scrollY.get() >= limitScrolll) {
					if (!listOffsets.get(refKey) || listOffsets.get(refKey)! < headerHeight.get()) {
						if (ref.current) {
							ref.current.scrollToOffset({
								offset: headerHeight.get(),
								animated: false,
							});
							listOffsets.set(refKey, headerHeight.get());
						}
					}
				}
			}
		});
	};
	const handleHeaderScroll = (value: number) => {
		const currRef = scrollRefs.get(tabState?.routes[tabState.index].key ?? '');
		if (!currRef) return;

		// In case the header is not visible, we need to sync the scroll offset between tabs
		if (value > headerHeight.value || value < 0) {
			syncScrollOffset();
		}
		if (currRef.current && value <= headerHeight.value) {
			currRef.current.scrollToOffset({
				offset: value,
				animated: false,
			});
		}
	};

	// useAnimatedReaction(
	// 	() => headerScrollY.value,
	// 	(value) => {
	// 		runOnJS(handleHeaderScroll)(value);
	// 	}
	// );
  
	return (
		<FilmContext.Provider
		value={{
			tabState,
			headerHeight,
			headerOverlayHeight,
			tabBarHeight,
			scrollY,
			headerScrollY,
			headerMoveScrollY,
			movieId,
			scrollRefs,
			listOffsets,
			addScrollRef,
			removeScrollRef,
			syncScrollOffset,
		}}
		>
			{children}
		</FilmContext.Provider>
	);
};

const useFilmContext = () => {
  const context = React.useContext(FilmContext);
  if (!context) {
    throw new Error('useFilmContext must be used within a FilmProvider');
  }
  return context;
};

export default FilmProvider;
export { useFilmContext };