import { useMediaTvSeriesDetailsQuery } from '@/features/media/mediaQueries';
import { getIdFromSlug } from '@/hooks/getIdFromSlug';
import { useTheme } from '@/providers/ThemeProvider';
import { Stack, useLocalSearchParams } from 'expo-router';
import { upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';

const TvSeriesLayout = () => {
	const { tv_series_id } = useLocalSearchParams<{ tv_series_id: string }>();
	const { id: seriesId} = getIdFromSlug(tv_series_id as string);
	const { t, i18n } = useTranslation();
	const { colors } = useTheme();
	const {
		data: series,
	} = useMediaTvSeriesDetailsQuery({
		id: seriesId,
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
					headerTitle: series?.title || '',
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
					headerTitle: series?.title || '',
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

export default TvSeriesLayout;