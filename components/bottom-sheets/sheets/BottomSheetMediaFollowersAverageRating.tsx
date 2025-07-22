import React from 'react';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { Playlist } from '@/types/type.db';
import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlaylistUpdateMutation } from '@/features/playlist/playlistMutations';
import * as Burnt from 'burnt';
import { Text, TouchableOpacity, View } from 'react-native';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { decode } from 'base64-arraybuffer';
import Switch from '@/components/ui/Switch';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { BetterInput } from '@/components/ui/BetterInput';
import { BottomSheetProps } from '../BottomSheetManager';
import { FlatList, Pressable } from 'react-native-gesture-handler';
import { useUserFollowersRatingQuery } from '@/features/user/userQueries';
import { useAuth } from '@/providers/AuthProvider';
import { CardUser } from '@/components/cards/CardUser';

interface BottomSheetMediaFollowersAverageRatingProps extends BottomSheetProps {
  mediaId: number;
}

const BottomSheetMediaFollowersAverageRating = React.forwardRef<
	React.ComponentRef<typeof TrueSheet>,
	BottomSheetMediaFollowersAverageRatingProps
>(({ id, mediaId, sizes = ['medium', 'large'], ...props }, ref) => {
  const { user } = useAuth();
  const { closeSheet } = useBottomSheetStore();
  const { colors, inset } = useTheme();
  const { t } = useTranslation();
  const {
    data: followersRating,
		isLoading,
		isError,
	} = useUserFollowersRatingQuery({
    userId: user?.id,
		mediaId: mediaId,
	});
  const refFlatList = React.useRef<FlatList<NonNullable<typeof followersRating>[number]>>(null);

  if (followersRating === null) {
    closeSheet(id);
    return null;
	};

  return (
    <ThemedTrueSheet
    ref={ref}
    sizes={sizes}
    scrollRef={refFlatList as React.RefObject<React.Component<unknown, {}, any>>}
    {...props}
    >
      <FlatList
      ref={refFlatList}
      data={followersRating} //  ? [...followersRating, ...followersRating, ...followersRating, ...followersRating, ...followersRating, ...followersRating] : []}
      renderItem={({ item }) => (
        <CardUser
        key={item.id}
        user={item.user!}
        />
      )}
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