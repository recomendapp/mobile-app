import { useTheme } from '@/providers/ThemeProvider';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import React, { useCallback } from 'react';
import Animated, { AnimatedRef, runOnJS, scrollTo, SharedValue, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

type ScrollableRef = AnimatedRef<
	| Animated.FlatList<any>
>;

interface FilmContextType {
	tabState: TabNavigationState<ParamListBase> | undefined;
	headerHeight: SharedValue<number>;
	headerOverlayHeight: SharedValue<number>;
	tabBarHeight: SharedValue<number>;
	scrollY: SharedValue<number>;
	headerScrollY: SharedValue<number>;
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
	const currentKey = React.useMemo(() => tabState?.routes[tabState.index].key, [tabState]);
	const currentRef = React.useMemo(() => currentKey ? scrollRefs.get(currentKey) : undefined, [currentKey, scrollRefs]);
	const headerScrollY = useSharedValue(0);

	const addScrollRef = useCallback((key: string, ref: ScrollableRef) => {
		const route = tabState?.routes.find((r) => r.key === key);
		if (!route) return;
		scrollRefs.set(route.key, ref);
	}, [scrollRefs, tabState]);
	const removeScrollRef = useCallback((key: string) => {
		const route = tabState?.routes.find((r) => r.key === key);
		if (!route) return;
		scrollRefs.delete(route.key);
	}, [scrollRefs, tabState]);
	const syncScrollOffset = useCallback(() => {
		if (!tabState) return;
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
	}, [headerHeight, headerOverlayHeight, inset, listOffsets, scrollRefs, scrollY, tabState, currentKey]);
	const handleHeaderScroll = useCallback((value: number) => {
		if (!currentRef) return;

		// In case the header is not visible, we need to sync the scroll offset between tabs
		if (value > headerHeight.value || value < 0) {
			syncScrollOffset();
		}
		if (currentRef.current && value <= headerHeight.value) {
			currentRef.current.scrollToOffset({
				offset: value,
				animated: false,
			});
		}
	}, [currentRef, headerHeight, syncScrollOffset]);

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