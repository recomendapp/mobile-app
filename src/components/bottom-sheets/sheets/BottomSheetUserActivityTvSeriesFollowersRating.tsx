import React, { useMemo } from 'react';
import tw from '@/lib/tw';
import { FlatList, View } from 'react-native';
import TrueSheet from '@/components/ui/TrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { CardUser } from '@/components/cards/CardUser';
import { BarChart } from '@/components/charts/bar-chart';
import { IconMediaRating } from '@/components/medias/IconMediaRating';
import { upperFirst } from 'lodash';
import { Icons } from '@/constants/Icons';
import { useTranslations } from 'use-intl';
import { interpolateRgb } from 'd3-interpolate'; 
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMediaTvSeriesFollowersAverageRatingsQuery } from '@/api/medias/mediaQueries';

interface BottomSheetUserActivityTvSeriesFollowersRatingProps extends BottomSheetProps {
  tvSeriesId: number;
}

const BottomSheetUserActivityTvSeriesFollowersRating = React.forwardRef<
	React.ComponentRef<typeof TrueSheet>,
	BottomSheetUserActivityTvSeriesFollowersRatingProps
>(({ id, tvSeriesId, detents = [0.5, 1], ...props }, ref) => {
  const insets = useSafeAreaInsets();
  const t = useTranslations();
  const {
    data: followersRating,
		isLoading,
	} = useMediaTvSeriesFollowersAverageRatingsQuery({
		tvSeriesId: tvSeriesId,
	});
  const loading = followersRating === undefined || isLoading;
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
    <TrueSheet
    ref={ref}
    detents={detents}
    scrollable
    {...props}
    >
      <FlatList
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
          paddingBottom: insets.bottom,
        },
      ]}
      ItemSeparatorComponent={() => <View style={tw.style('h-2')} />}
      keyExtractor={(item) => item.id!.toString()}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      />
    </TrueSheet>
  );
});
BottomSheetUserActivityTvSeriesFollowersRating.displayName = 'BottomSheetUserActivityTvSeriesFollowersRating';

export default BottomSheetUserActivityTvSeriesFollowersRating;