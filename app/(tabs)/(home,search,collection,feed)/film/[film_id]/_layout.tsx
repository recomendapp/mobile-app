import { useMediaMovieDetailsQuery } from '@/features/media/mediaQueries';
import { getIdFromSlug } from '@/hooks/getIdFromSlug';
import { useTheme } from '@/providers/ThemeProvider';
import { Stack, useLocalSearchParams } from 'expo-router';
import { upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';

const FilmLayout = () => {
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId} = getIdFromSlug(film_id as string);
	const { t, i18n } = useTranslation();
	const { colors } = useTheme();
	const {
		data: movie,
		isLoading,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: i18n.language,
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