import * as React from 'react';
import {
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import tailwind from 'twrnc';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ui/ThemedText';
import { AnimatedImageWithFallback } from '@/components/ui/AnimatedImageWithFallback';
import { upperFirst } from 'lodash';
import { MediaMovie, MediaPerson } from '@/types/type.db';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import useColorConverter from '@/hooks/useColorConverter';
import { Skeleton } from '@/components/ui/skeletonNEWNAME';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Pressable } from 'react-native-gesture-handler';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface FilmHeaderProps {
	filmHeaderHeight: SharedValue<number>;
	onHeaderHeight: (height: number) => void;
	headerHeight: SharedValue<number>;
	sv: SharedValue<number>;
	movie?: MediaMovie | null;
	loading: boolean;
}
const FilmHeader: React.FC<FilmHeaderProps> = ({
	filmHeaderHeight,
	onHeaderHeight,
	headerHeight,
	sv,
	movie,
	loading,
}) => {
	const { t } = useTranslation();
	const { hslToRgb } = useColorConverter();
	const colorsRef = useThemeColor({
		dark: Colors.dark.background,
		light: Colors.light.background,
	}, 'background');
	const colors = hslToRgb(colorsRef);
	const inset = useSafeAreaInsets();
	const layoutY = useSharedValue(0);
	const opacityAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
			sv.get(),
			[0, filmHeaderHeight.get() - (headerHeight.get() + inset.top) / 0.9],
			[1, 0],
			Extrapolation.CLAMP,
			),
		};
	});
	const posterAnim = useAnimatedStyle(() => ({
		opacity: interpolate(
			sv.get(),
			[0, filmHeaderHeight.get() - (headerHeight.get() + inset.top) / 0.8],
			[1, 0],
			Extrapolation.CLAMP,
		),
		transform: [
			{
				scale: interpolate(
					sv.get(),
					[-filmHeaderHeight.get() / 2, 0, (filmHeaderHeight.get() - (headerHeight.get() + inset.top))],
					[1.8, 1, 0.95],
					'clamp',
				),
			},
			{
				translateY: interpolate(
				sv.get(),
				[layoutY.get() - 1, layoutY.get(), layoutY.get()],
				[-0.3, 0, -1],
				),
			},
		],
	}));
	const textAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				sv.get(),
				[0, filmHeaderHeight.get() - (headerHeight.get() + inset.top) / 0.8],
				[1, 0],
				Extrapolation.CLAMP,
			),
			transform: [
				{
					scale: interpolate(
					sv.get(),
					[0, (filmHeaderHeight.get() - (headerHeight.get() + inset.top)) / 2],
					[1, 0.95],
					'clamp',
					),
				},
				// {
				// 	translateY: interpolate(
				// 		sv.get(),
				// 		[layoutY.value - 1, layoutY.value, layoutY.value + 1],
				// 		[1, 0, -1],
				// 	),
				// },
			],
		};
	});
	const scaleAnim = useAnimatedStyle(() => {
		return {
			transform: [
			{
				scale: interpolate(sv.get(), [-50, 0], [1.3, 1], {
				extrapolateLeft: 'extend',
				extrapolateRight: 'clamp',
				}),
			},
			],
		};
	});
	return (
    <Animated.View
	className="w-full absolute"
	style={[opacityAnim]}
	onLayout={(event: LayoutChangeEvent) => {
		'worklet';
		onHeaderHeight(event.nativeEvent.layout.height);
		layoutY.value = event.nativeEvent.layout.y;
	  }}
	>
		{movie ? <Animated.Image
		style={[tailwind.style('absolute h-full w-full'), scaleAnim]}
		source={{ uri: movie.backdrop_url ?? '' }}
		/> : null}
		<AnimatedLinearGradient
		style={[tailwind.style('absolute inset-0'), scaleAnim]}
		colors={[
			`rgba(${colors.r}, ${colors.g}, ${colors.b}, 0.3)`,
			`rgba(${colors.r}, ${colors.g}, ${colors.b}, 0.4)`,
			`rgba(${colors.r}, ${colors.g}, ${colors.b}, 0.5)`,
			`rgba(${colors.r}, ${colors.g}, ${colors.b}, 0.6)`,
			`rgba(${colors.r}, ${colors.g}, ${colors.b}, 0.6)`,
			`rgba(${colors.r}, ${colors.g}, ${colors.b}, 0.8)`,
			`rgba(${colors.r}, ${colors.g}, ${colors.b}, 1)`,
		]}
		/>
		<Animated.View
		className="flex items-center gap-4 p-2"
		style={{ paddingTop: inset.top === 0 ? 8 : inset.top }}
		>
			{!loading ? (
				<AnimatedImageWithFallback
				alt={movie?.title ?? ''}
				source={{ uri: movie?.avatar_url ?? '' }}
				className={'w-48 aspect-[2/3] rounded-md h-fit'}
				style={[ posterAnim ]}
				/>
			) : <Skeleton className="w-48 aspect-[2/3]" style={posterAnim}/>}
			<Animated.View
			className="gap-2 w-full"
			style={[textAnim]}
			>
				{/* GENRES */}
				{movie ? <ThemedText>
					<ThemedText className='text-accent-yellow'>{upperFirst('film')}</ThemedText>
					{movie?.genres ? <Genres genres={movie.genres} /> : null}
				</ThemedText> : loading ? <Skeleton className="w-32 h-8" /> : null}
				{/* TITLE */}
				{!loading ? (
					<ThemedText
					numberOfLines={2}
					className={`
						text-4xl font-bold
						${(!movie && !loading) ? 'text-center text-muted-foreground' : ''}
					`}
					>
						{movie?.title ?? upperFirst(t('common.errors.film_not_found'))}
					</ThemedText>
				) : <Skeleton className="w-64 h-12" />}
				{(movie?.extra_data.original_title && movie.extra_data.original_title !== movie.title) ? (
					<ThemedText numberOfLines={1} className="text-lg font-semibold text-muted-foreground">
						{movie.extra_data.original_title}
					</ThemedText>
				) : null}
				{/* DIRECTORS & DURATION */}
				{movie?.main_credit || movie?.extra_data.runtime ? (
					<ThemedText>
						{movie.main_credit ? <Directors directors={movie.main_credit} /> : null}

					</ThemedText>
				) : null}

			</Animated.View>
		</Animated.View>
    </Animated.View>
	);
};

const Genres = ({
	genres,
  } : {
	genres: {
	  id: number;
	  name: string;
	}[];
  }) => {
	// const formattedGenres = new Intl.ListFormat(i18n.language, {
	//   style: 'narrow',
	//   type: 'conjunction',
	// }).formatToParts(genres.map((genre) => genre.name));
	return (
	  	<>
			{" | "}
			{genres.map((genre, index) => (
				<React.Fragment key={index}>
					{index !== 0 ? ", " : null}
					<Link href={`/genre/${genre.id}`} onPress={() => console.log('link pressed')}>{genre.name}</Link>
				</React.Fragment>
			))}
		</>
	);
};

const Directors = ({
	directors,
} : {
	directors: MediaPerson[];
}) => {
	return (
		<>
			{directors.map((director, index) => (
				<React.Fragment key={index}>
					{index !== 0 ? ", " : null}
					<Link href={`/person/${director.id}`}>{director.title}</Link>
				</React.Fragment>
			))}
		</>
	)
};
export default FilmHeader;