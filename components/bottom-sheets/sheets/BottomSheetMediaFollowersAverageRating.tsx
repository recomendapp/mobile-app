import React, { useMemo } from 'react';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { FlatList } from 'react-native-gesture-handler';
import { useUserFollowersRatingQuery } from '@/features/user/userQueries';
import { useAuth } from '@/providers/AuthProvider';
import { CardUser } from '@/components/cards/CardUser';
import { BarChart } from '@/components/charts/bar-chart';
import { IconMediaRating } from '@/components/medias/IconMediaRating';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import { Icons } from '@/constants/Icons';
import { useTranslations } from 'use-intl';

interface BottomSheetMediaFollowersAverageRatingProps extends BottomSheetProps {
  mediaId: number;
}

const BottomSheetMediaFollowersAverageRating = React.forwardRef<
	React.ComponentRef<typeof TrueSheet>,
	BottomSheetMediaFollowersAverageRatingProps
>(({ id, mediaId, sizes = ['medium', 'large'], ...props }, ref) => {
  const { user } = useAuth();
  const { colors, inset } = useTheme();
  const t = useTranslations();
  const {
    data: followersRating,
		isLoading,
	} = useUserFollowersRatingQuery({
    userId: user?.id,
		mediaId: mediaId,
	});
  const loading = followersRating === undefined || isLoading;
  const refFlatList = React.useRef<FlatList<NonNullable<typeof followersRating>[number]>>(null);
  const chartsData = useMemo(() => {
    if (!followersRating) return null;
    return new Array(10).fill(0).map((_, index) => ({
      label: (index + 1).toString(),
      value: followersRating.filter((f) => f.rating === index + 1).length || 0,
      color: colors.accentBlue,
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
            <ThemedText style={tw`text-center font-bold text-lg`}>
            {upperFirst(t('common.messages.ratings_from_followees'))}
            </ThemedText>
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
            <ThemedText style={[tw`text-center`, { color: colors.mutedForeground }]}>
              {upperFirst(t('common.messages.no_results'))}
            </ThemedText>
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
BottomSheetMediaFollowersAverageRating.displayName = 'BottomSheetMediaFollowersAverageRating';

export default BottomSheetMediaFollowersAverageRating;