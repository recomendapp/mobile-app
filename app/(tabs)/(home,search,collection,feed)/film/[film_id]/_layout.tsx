import { useMediaMovieDetailsQuery } from '@/features/media/mediaQueries';
import { getIdFromSlug } from '@/hooks/getIdFromSlug';
import { useTheme } from '@/providers/ThemeProvider';
import { Stack, useLocalSearchParams } from 'expo-router';
import { upperFirst } from 'lodash';
import { useLocale, useTranslations } from 'use-intl';

const FilmLayout = () => {
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId } = getIdFromSlug(film_id);
	const locale = useLocale();
	const t = useTranslations();
	const { colors } = useTheme();
	const {
		data: movie,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: locale,
	});
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="playlists"
				options={{
					animation: 'ios_from_right',
					headerBackground: () => null,
					headerTitle: movie?.title || '',
					headerTitleStyle: {
						color: colors.foreground,
					},
					headerBackTitle: upperFirst(t('common.messages.playlist', { count: 2 })),
					headerTintColor: colors.foreground,
				}}
			/>
			<Stack.Screen
				name="reviews"
				options={{
					animation: 'ios_from_right',
					headerBackground: () => null,
					headerTitle: movie?.title || '',
					headerTitleStyle: {
						color: colors.foreground,
					},
					headerBackTitle: upperFirst(t('common.messages.review', { count: 2 })),
					headerTintColor: colors.foreground,
				}}
			/>
		</Stack>
	)
};

export default FilmLayout;