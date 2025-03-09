import * as React from 'react';
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import tailwind from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';
import { Slot, useLocalSearchParams } from 'expo-router';
import { Icons } from '@/constants/Icons';
import { useTranslation } from 'react-i18next';
import { getIdFromSlug } from '@/hooks/getIdFromSlug';
import { useMediaMovieDetailsQuery } from '@/features/media/mediaQueries';
import { RefreshControl } from 'react-native-gesture-handler';
import FilmNav from '@/components/screens/film/FilmNav';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ui/ThemedText';

const formatter = Intl.NumberFormat('en-IN');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const posterSize = Dimensions.get('screen').height / 2;
const headerTop = 44 - 16;

interface ScreenHeaderProps {
	sv: SharedValue<number>;
	title: string;
}
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
	sv,
	title,
}) => {
	const navigation = useNavigation();
	const inset = useSafeAreaInsets();
	const opacityAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
			sv.value,
			[
				((posterSize - (headerTop + inset.top)) / 4) * 3,
				posterSize - (headerTop + inset.top) + 1,
			],
			[0, 1],
			),
			transform: [
			{
				scale: interpolate(
				sv.value,
				[
					((posterSize - (headerTop + inset.top)) / 4) * 3,
					posterSize - (headerTop + inset.top) + 1,
				],
				[0.98, 1],
				Extrapolation.CLAMP,
				),
			},
			{
				translateY: interpolate(
				sv.value,
				[
					((posterSize - (headerTop + inset.top)) / 4) * 3,
					posterSize - (headerTop + inset.top) + 1,
				],
				[-10, 0],
				Extrapolation.CLAMP,
				),
			},
			],
			paddingTop: inset.top === 0 ? 8 : inset.top,
		};
	});
  return (
    <Animated.View
	style={[
	tailwind.style(
		'absolute w-full px-4 pb-2 flex flex-row items-center justify-between z-10 bg-black',
	),
	opacityAnim,
	]}>
		{navigation.canGoBack() ? <Pressable onPress={() => navigation.goBack()}>
			<Icons.ChevronLeft className="text-foreground" />
		</Pressable> : null}
		<ThemedText className='text-xl font-medium'>
		{title}
		</ThemedText>
		<Pressable onPress={() => console.log('pressed')}>
			<Icons.EllipsisVertical className="text-foreground"/>
		</Pressable>
    </Animated.View>
  );
};

interface PosterImageProps {
	sv: SharedValue<number>;
	title: string;
	backgroundImage: string;
}
const PosterImage: React.FC<PosterImageProps> = ({
	sv,
	title,
	backgroundImage,
}) => {
  const inset = useSafeAreaInsets();
  const layoutY = useSharedValue(0);
  const opacityAnim = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        sv.value,
        [0, posterSize - (headerTop + inset.top) / 0.9],
        [1, 0],
        Extrapolation.CLAMP,
      ),
    };
  });
  const textAnim = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        sv.value,
        [-posterSize / 8, 0, posterSize - (headerTop + inset.top) / 0.8],
        [0, 1, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale: interpolate(
            sv.value,
            [-posterSize / 8, 0, (posterSize - (headerTop + inset.top)) / 2],
            [1.1, 1, 0.95],
            'clamp',
          ),
        },
        {
          translateY: interpolate(
            sv.value,
            [layoutY.value - 1, layoutY.value, layoutY.value + 1],
            [0, 0, -1],
          ),
        },
      ],
    };
  });
  const scaleAnim = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(sv.value, [-50, 0], [1.3, 1], {
            extrapolateLeft: 'extend',
            extrapolateRight: 'clamp',
          }),
        },
      ],
    };
  });
  return (
    <Animated.View style={[styles.imageContainer, opacityAnim]}>
      <Animated.Image
        style={[styles.imageStyle, scaleAnim]}
		source={{ uri: backgroundImage }}
        // source={require('./src/assets/artist.jpeg')}
      />
      <Animated.View
        onLayout={(event: LayoutChangeEvent) => {
          'worklet';
          layoutY.value = event.nativeEvent.layout.y;
        }}
        style={[
          tailwind.style(
            'absolute bottom-0 top-0 left-0 right-0 justify-end items-center px-5  z-10',
          ),
          textAnim,
        ]}>
        <ThemedText
          numberOfLines={2}
		  className='text-6xl font-bold text-center'
		>
        	{title}
        </ThemedText>
      </Animated.View>
      <AnimatedLinearGradient
        style={[tailwind.style('absolute inset-0'), scaleAnim]}
        colors={[
          `rgba(0,0,0,${0})`,
          `rgba(0,0,0,${0.1})`,
          `rgba(0,0,0,${0.3})`,
          `rgba(0,0,0,${0.5})`,
          `rgba(0,0,0,${0.8})`,
          `rgba(0,0,0,${1})`,
        ]}
      />
    </Animated.View>
  );
};

const FilmLayout = () => {
	const { i18n, t } = useTranslation();
	const { film_id } = useLocalSearchParams();
	const { id: movieId} = getIdFromSlug(film_id as string);

	const {
		data: movie,
		isLoading,
		isError,
		isRefetching,
		refetch,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: i18n.language,
	});
	const loading = isLoading || movie === undefined;
	const refresh = () => {
		console.log('refresh');
		refetch();
	};

	const inset = useSafeAreaInsets();
	const sv = useSharedValue<number>(0);
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
		'worklet';
		sv.value = event.contentOffset.y;
		},
	});
	const initialTranslateValue = posterSize;
	const animatedScrollStyle = useAnimatedStyle(() => {
		return {
		paddingTop: initialTranslateValue,
		};
	});
	const layoutY = useSharedValue(0);
	const stickyElement = useAnimatedStyle(() => {
		return {
		backgroundColor: 'black',
		transform: [
			{
			translateY: interpolate(
				sv.value,
				[
				layoutY.value - (headerTop + inset.top) - 1,
				layoutY.value - (headerTop + inset.top),
				layoutY.value - (headerTop + inset.top) + 1,
				],
				[0, 0, 1],
			),
			},
		],
		};
	});

	return (
    <Animated.View style={[tailwind.style('flex-1 bg-black')]}>
      <ScreenHeader sv={sv} title={movie?.title ?? ''} />
      <PosterImage sv={sv} title={movie?.title ?? ''} backgroundImage={movie?.backdrop_url ?? ''} />
      <Animated.View style={tailwind.style('flex-1')}>
        <Animated.ScrollView
		onScroll={scrollHandler}
		scrollEventThrottle={16}
		style={tailwind.style('flex-1')}
		showsVerticalScrollIndicator={false}
		refreshControl={
			<RefreshControl
				refreshing={isRefetching}
				onRefresh={refresh}
			/>
		}
		>
          <Animated.View style={[animatedScrollStyle, tailwind.style('pb-10')]}>
            {/* Button Section */}
			<Animated.View
			onLayout={(event: LayoutChangeEvent) => {
                'worklet';
                layoutY.value = event.nativeEvent.layout.y;
			}}
			style={[
                tailwind.style(
                  'flex items-center justify-center z-10 py-4',
                ),
                stickyElement,
              ]}
			>
				<FilmNav slug={String(film_id)} />
			</Animated.View>
			<Slot />
          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>
    </Animated.View>
	);
};

const styles = StyleSheet.create({
	imageContainer: {
	  height: Dimensions.get('screen').height / 2,
	  width: Dimensions.get('screen').width,
	  position: 'absolute',
	},
	imageStyle: {
	  height: '100%',
	  width: '100%',
	  resizeMode: 'cover',
	},
});

export default FilmLayout;