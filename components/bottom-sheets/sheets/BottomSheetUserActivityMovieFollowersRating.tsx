import React, { useMemo } from 'react';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { FlatList } from 'react-native-gesture-handler';
import { useUserActivityMovieFollowersRatingQuery } from '@/features/user/userQueries';
import { useAuth } from '@/providers/AuthProvider';
import { CardUser } from '@/components/cards/CardUser';
import { BarChart } from '@/components/charts/bar-chart';
import { IconMediaRating } from '@/components/medias/IconMediaRating';
import { upperFirst } from 'lodash';
import { Icons } from '@/constants/Icons';
import { useTranslations } from 'use-intl';
import { interpolateRgb } from 'd3-interpolate'; 
import { Text } from '@/components/ui/text';

interface BottomSheetUserActivityMovieFollowersRatingProps extends BottomSheetProps {
  movieId: number;
}

const BottomSheetUserActivityMovieFollowersRating = React.forwardRef<
	React.ComponentRef<typeof TrueSheet>,
	BottomSheetUserActivityMovieFollowersRatingProps
>(({ id, movieId, sizes = ['medium', 'large'], ...props }, ref) => {
  const { user } = useAuth();
  const { inset } = useTheme();
  const t = useTranslations();
  const {
    data: followersRating,
		isLoading,
	} = useUserActivityMovieFollowersRatingQuery({
    userId: user?.id,
		movieId: movieId,
	});
  const loading = followersRating === undefined || isLoading;
  const refFlatList = React.useRef<FlatList<NonNullable<typeof followersRating>[number]>>(null);
  const chartsData = useMemo(() => {
    if (!followersRating) return null;
    const startColor = '#ff6f6fff';
    const endColor = '#5fff57ff';
    const interpolateColor = interpolateRgb(startColor, endColor);


    return new Array(10).fill(0).map((_, index) => ({
      label: (index + 1).toString(),
      value: followersRating.filter((f) => f.rating === index + 1).length || 0,
      color: interpolateColor(index / 9),
    }));
  }, [followersRating]);

  return (
    <ThemedTrueSheet
    ref={ref}
    sizes={sizes}
    scrollRef={refFlatList as React.RefObject<React.Component<unknown, {}, any>>}
    {...props}
    >
      <FlatList
      ref={refFlatList}
      data={followersRating}
      renderItem={({ item }) => (
        <CardUser
        key={item.id}
        user={item.user!}
        style={tw`h-auto`}
        >
          <IconMediaRating
          rating={item.rating}
          variant='follower'
          />
        </CardUser>
      )}
      ListHeaderComponent={
        chartsData ? (
          <View style={tw`gap-2 mb-4`}>
            <Text variant="title" style={tw`text-center`}>
            {upperFirst(t('common.messages.ratings_from_followees'))}
            </Text>
            <BarChart
            data={chartsData}
            config={{
              height: 220,
              showLabels: true,
              animated: true,
              duration: 1000,
            }}
            />
          </View>
        ) : null
      }
      ListEmptyComponent={
        loading ? <Icons.Loader />
        : (
          <View style={tw`flex-1 items-center justify-center p-4`}>
            <Text textColor='muted' style={tw`text-center`}>
              {upperFirst(t('common.messages.no_results'))}
            </Text>
          </View>
        )
      }
      contentContainerStyle={[
        tw`p-4`,
        {
          paddingBottom: inset.bottom,
        },
      ]}
      ItemSeparatorComponent={() => <View style={tw.style('h-2')} />}
      keyExtractor={(item) => item.id!.toString()}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      />
    </ThemedTrueSheet>
  );
});
BottomSheetUserActivityMovieFollowersRating.displayName = 'BottomSheetUserActivityMovieFollowersRating';

export default BottomSheetUserActivityMovieFollowersRating;