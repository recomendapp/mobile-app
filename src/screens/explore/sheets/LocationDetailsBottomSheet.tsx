import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
import { SharedValue } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { ExploreTile, MediaPerson } from '@recomendapp/types';
import { Button } from '@/components/ui/Button';
import { View } from '@/components/ui/view';
import tw from '@/lib/tw';
import { BORDER_RADIUS_FULL, GAP, GAP_LG, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { Icons } from '@/constants/Icons';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { MovieHeaderInfo } from '@/components/screens/film/MovieHeaderInfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocale, useTranslations } from 'use-intl';
import { Link } from 'expo-router';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTheme } from '@/providers/ThemeProvider';
import { upperFirst } from 'lodash';
import ButtonUserActivityMovieRating from '@/components/buttons/movies/ButtonUserActivityMovieRating';
import ButtonUserActivityMovieLike from '@/components/buttons/movies/ButtonUserActivityMovieLike';
import ButtonUserActivityMovieWatch from '@/components/buttons/movies/ButtonUserActivityMovieWatch';
import { ButtonUserWatchlistMovie } from '@/components/buttons/movies/ButtonUserWatchlistMovie';
import { ButtonPlaylistMovieAdd } from '@/components/buttons/ButtonPlaylistMovieAdd';
import ButtonUserRecoMovieSend from '@/components/buttons/movies/ButtonUserRecoMovieSend';
import { useAuth } from '@/providers/AuthProvider';
import { useMediaMovieDetailsQuery } from '@/api/medias/mediaQueries';

interface LocationDetailsBottomSheetProps {
  index: SharedValue<number>;
  position: SharedValue<number>;
  onClose?: () => Promise<void> | void;
}

export interface LocationDetailsBottomSheetMethods {
  present: (item: ExploreTile['features'][number]['properties']) => void;
}

export const LocationDetailsBottomSheet = forwardRef<
  LocationDetailsBottomSheetMethods,
  LocationDetailsBottomSheetProps
>(({ index, position, onClose }, ref) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const t = useTranslations();
  const { session } = useAuth();
  // REFs
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // States
  const [selectedLocation, setSelectedLocation] = useState<ExploreTile['features'][number]['properties']>();

  // Queries
  const {
    data: movie,
  } = useMediaMovieDetailsQuery({ movieId: selectedLocation?.movie.id })

  //#region hooks
  const headerHeight = useHeaderHeight();
  //#endregion

  //#region callbacks
  const handleCloseLocationDetails = async () => {
    bottomSheetRef.current?.dismiss();
  };
  const handleOnDismiss = () => {
    setSelectedLocation(undefined);
    onClose?.();
  };
  //#endregion

  //#region effects
  useImperativeHandle(ref, () => ({
    present: location => {
      setSelectedLocation(location);
    },
  }));

  useEffect(() => {
    if (selectedLocation) {
      bottomSheetRef.current?.present();
    }
  }, [selectedLocation]);

  return (
  <BottomSheetModal
  ref={bottomSheetRef}
  key="PoiDetailsSheet"
  name="PoiDetailsSheet"
  snapPoints={['35%']}
  topInset={headerHeight}
  animatedIndex={index}
  animatedPosition={position}
  handleIndicatorStyle={{ backgroundColor: colors.mutedForeground }}
  backgroundStyle={{ backgroundColor: colors.muted }}
  onDismiss={handleOnDismiss}
  >
	  <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: PADDING_HORIZONTAL, gap: GAP, paddingBottom: insets.bottom }} bounces={false}>
      <View style={[tw`flex-row justify-between items-center`, { gap: GAP }]}>
        {movie ? <MovieHeaderInfo movie={movie} /> : <Skeleton color={colors.background} style={tw`w-32 h-8`}/>}
        <View style={[tw`flex-row items-center`, { gap: GAP }]}>
          <Button onPress={handleCloseLocationDetails} variant='muted' icon={Icons.X} size='icon' style={{ borderRadius: BORDER_RADIUS_FULL, backgroundColor: colors.background }}/>
        </View>
      </View>
      <View style={[tw`flex-row items-center`, { gap: GAP }]}>
        {movie ?  (
          <ImageWithFallback
          alt={movie.title || 'Movie Poster'}
          source={{ uri: movie.poster_url || '' }}
          style={[
            {aspectRatio: 2 / 3},
            tw`w-20 h-auto rounded-md`
          ]}
          type={'movie'}
          />
        ) : <Skeleton color={colors.background} style={[{ aspectRatio: 2 / 3 }, tw`w-20 h-auto rounded-md`]}/>}
        <View>
          {movie ? <Link href={{ pathname: '/film/[film_id]', params: { film_id: movie.slug || movie.id }}}><Text variant='title'>{movie.title}</Text></Link> : <Skeleton color={colors.background} style={tw`w-32 h-8`}/>}
          {movie?.directors && movie.directors.length > 0 && (
            <Text>
              <Directors directors={movie.directors} />
            </Text>
          )}
        </View>
      </View>
      {session && movie && (
        <View style={[tw`flex-row items-center justify-between`, { gap: GAP_LG, paddingVertical: PADDING_VERTICAL }]}>
          <View style={[tw`flex-row items-center`, { gap: GAP_LG }]}>
            <ButtonUserActivityMovieRating movie={movie} />
            <ButtonUserActivityMovieLike movie={movie} />
            <ButtonUserActivityMovieWatch movie={movie} />
            <ButtonUserWatchlistMovie movie={movie} />
          </View>
          <View style={[tw`flex-row items-center`, { gap: GAP_LG }]}>
            <ButtonPlaylistMovieAdd movie={movie} />
            <ButtonUserRecoMovieSend movie={movie} />
          </View>
        </View>
      )}
      {movie ? (
        <View style={[{ backgroundColor: colors.background, paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL, gap: GAP }, tw`rounded-md`]}>
          <Text variant='caption'>{upperFirst(t('common.messages.overview'))}</Text>
          <Text>{movie.overview || upperFirst(t('common.messages.no_description'))}</Text>
        </View>
      ) : (
        <Skeleton color={colors.background} style={tw`w-full h-32 rounded-md`} />
      )}
	  </BottomSheetScrollView>
  </BottomSheetModal>
  );
});
LocationDetailsBottomSheet.displayName = 'LocationDetailsBottomSheet';

const Directors = ({ directors }: { directors: MediaPerson[] }) => {
  const locale = useLocale();
  const listFormatter = new Intl.ListFormat(locale, {
    style: 'long',
    type: 'conjunction',
  });
  const names = directors.map(d => d.name!);
  const formatted = listFormatter.formatToParts(names);
  if (formatted.length === 0) return null;
  return (
    <>
    {formatted.map((part, i) => {
      const director = directors.find(d => d.name === part.value);
      if (part.type === 'element') {
        return (
          <Link key={i} href={`/person/${director?.slug || director?.id}`}>
          {director?.name}
          </Link>
        );
      }
      return part.value;
    })}
    </>
  );
};
