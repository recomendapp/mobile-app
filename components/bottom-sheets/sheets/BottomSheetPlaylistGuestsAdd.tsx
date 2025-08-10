import React from 'react';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { User } from '@/types/type.db';
import { Text, TouchableOpacity, View } from 'react-native';
import { upperCase, upperFirst } from 'lodash';
import { usePlaylistGuestsQuerySearchInfiniteQuery } from '@/features/playlist/playlistQueries';
import { Icons } from '@/constants/Icons';
import { CardUser } from '@/components/cards/CardUser';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import useDebounce from '@/hooks/useDebounce';
import { FlashList } from '@shopify/flash-list';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { BetterInput } from '@/components/ui/BetterInput';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';

interface BottomSheetPlaylistGuestsAddProps extends BottomSheetProps {
  playlistId: number;
  guests: { user: User, edit: boolean }[] | undefined;
  onAdd: (user: User) => void;
  onRemove: (userId: string) => void;
}

const BottomSheetPlaylistGuestsAdd = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetPlaylistGuestsAddProps
>(({ id, playlistId, guests: guestsParent, onAdd, onRemove, sizes, ...props }, ref) => {
  const { colors } = useTheme();
  const closeSheet = useBottomSheetStore((state) => state.closeSheet);
  const t = useTranslations();
  const [search, setSearch] = React.useState('');
  const searchQuery = useDebounce(search, 500);
  const [guests, setGuests] = React.useState(guestsParent);

  const {
		data: users,
		isLoading,
		isError,
		fetchNextPage,
		isFetchingNextPage,
		hasNextPage,
    refetch,
    isRefetching,
	} = usePlaylistGuestsQuerySearchInfiniteQuery({
    playlistId,
    filters: {
      search: searchQuery,
      alreadyAdded: guestsParent?.map((guest) => guest.user.id),
    }
  });
  const loading = isLoading || users === undefined;

  return (
    <ThemedTrueSheet
    ref={ref}
    sizes={['large']}
    contentContainerStyle={tw`gap-4 items-center justify-center mx-2`}
    {...props}
    >
      <View style={tw`flex-row items-center justify-between w-full`}>
        <View style={tw`flex-1`}/>
        <ThemedText style={tw`flex-1 text-center font-bold`}>
          {upperFirst(t('common.messages.add_guest', { count: 2 }))}
        </ThemedText>
        <TouchableOpacity
        style={tw`flex-1`}
        onPress={() => closeSheet(id)}
        >
          <ThemedText style={tw`text-right`}>{upperCase(t('common.messages.ok'))}</ThemedText>
        </TouchableOpacity>
      </View>
      {/* <ThemedText style={tw`font-bold`}>
        {upperFirst(t('common.playlist.actions.add_guests'))}
      </ThemedText> */}
      <View style={tw`flex-1 w-full gap-2`}>
        <BetterInput
        variant='outline'
        defaultValue={search}
        onChangeText={setSearch}
        placeholder={upperFirst(t('common.messages.search_user'))}
        leftIcon='search'
        clearable
        />
        <View style={tw`flex-1`}>
          <FlashList
          data={users?.pages.flat()}
          renderItem={({ item }) => (
            <TouchableOpacity
            key={item.id}
            style={tw`flex-row items-center justify-between gap-4 py-2`}
            onPress={() => {
              if (guests?.some((guest) => guest.user.id === item.id)) {
                setGuests((prev) => {
                  if (!prev) return [];
                  const newGuests = prev.filter((guest) => guest.user.id !== item.id);
                  return newGuests;
                });
                onRemove(item.id);
              } else {
                setGuests((prev) => {
                  if (!prev) return [];
                  const newGuests = [...prev, { user: item, edit: false }];
                  return newGuests;
                });
                onAdd(item);
              }
            }}
            >
              <CardUser
              user={item}
              style={tw`border-0 bg-transparent h-auto`}
              containerStyle={tw`flex-1`}
              linked={false}
              />
              <Icons.Check size={20} color={colors.foreground} style={{ opacity: guests?.some((guest) => guest.user.id === item.id) ? 1 : 0 }} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            loading ? (
              <Icons.Loader />
            ) : (
              <View style={tw`flex-1 items-center justify-center`}>
                <Text style={{ color: colors.mutedForeground }}>{upperFirst(t('common.messages.no_results'))}</Text>
              </View>
            )
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          // onRefresh={refetch}
          onEndReached={hasNextPage ? fetchNextPage : undefined}
          onEndReachedThreshold={0.3}
          />
        </View>
      </View>
    </ThemedTrueSheet>
  );
});
BottomSheetPlaylistGuestsAdd.displayName = 'BottomSheetPlaylistGuestsAdd';

export default BottomSheetPlaylistGuestsAdd;