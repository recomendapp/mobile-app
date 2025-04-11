import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import  * as React from 'react';
import Animated, { AnimatedRef, runOnJS, SharedValue, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

// type ScrollableRef =
//   | Animated.ScrollView
//   | Animated.FlatList<any>
//   | FlashList<any>;
type ScrollableRef = AnimatedRef<
	| Animated.FlatList<any>
	// | Animated.FlatList<any>
	// | FlashList<any>
>;

type Screen = 'index' | 'reviews' | 'playlists';

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
	addScrollRef: (key: Screen, ref: ScrollableRef) => void;
	removeScrollRef: (key: Screen) => void;
	syncScrollOffset: (offset: number, key: string) => void;
}

const FilmContext = React.createContext<FilmContextType | undefined>(undefined);

interface FilmProviderProps {
	children: React.ReactNode;
	tabState: TabNavigationState<ParamListBase> | undefined;
	headerHeight: SharedValue<number>;
	headerOverlayHeight: SharedValue<number>;
	tabBarHeight: SharedValue<number>;
	scrollY: SharedValue<number>;
	movieId: number;
}
  
const FilmProvider: React.FC<FilmProviderProps> = ({
	children,
	tabState,
	headerHeight,
	headerOverlayHeight,
	tabBarHeight,
	scrollY,
	movieId,
}) => {
	const scrollRefs = React.useRef<Map<string, ScrollableRef>>(new Map()).current;
	const listOffsets = React.useRef<Map<string, number>>(new Map()).current;
	const headerScrollY = useSharedValue(0);
  	const headerMoveScrollY = useSharedValue(0);

	const addScrollRef = (key: Screen, ref: ScrollableRef) => {
		const route = tabState?.routes.find((r) => r.name.startsWith(key));
		if (!route) return;
		scrollRefs.set(route.key, ref);
	};
	const removeScrollRef = (key: Screen) => {
		const route = tabState?.routes.find((r) => r.name.startsWith(key));
		if (!route) return;
		scrollRefs.delete(route.key);
	};
	const syncScrollOffset = () => {
		console.log('syncScrollOffset');
		if (!tabState) return;
		const currentKey = tabState?.routes[tabState.index].key;
	
		scrollRefs.forEach((ref, refKey) => {
			if (refKey !== currentKey) {
				if (scrollY.get() < headerHeight.get() && scrollY.get() >= 0) {
					if (ref.current) {
						console.log('scroll to offset', scrollY.get());
						ref.current.scrollToOffset({
							offset: scrollY.get(),
							animated: false,
						});
						listOffsets.set(refKey, scrollY.get());
					}
				} else if (scrollY.get() >= headerHeight.get()) {
					if (!listOffsets.get(refKey) || listOffsets.get(refKey)! < headerHeight.get()) {
						console.log('scroll to offset 2', headerHeight.get());
						if (ref.current) {
							ref.current.scrollToOffset({
								offset: headerHeight.get(),
								animated: false,
							});
							listOffsets.set(refKey, headerHeight.get());
						}
					}
				}
			} // else {
			// 	listOffsets.set(refKey, scrollY.get());
			// }
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

	useAnimatedReaction(
		() => scrollY.value,
		(value) => {
			console.log('scrollY', value);
			runOnJS(syncScrollOffset)();
		}
	);

	useAnimatedReaction(
		() => headerScrollY.value,
		(value) => {
			// console.log('headerScrollY', value);
			runOnJS(handleHeaderScroll)(value);
		}
	)
  
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