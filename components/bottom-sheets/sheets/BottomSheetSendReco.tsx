import React from 'react';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/constants/Icons';
import { Media, User } from '@/types/type.db';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { Text, View } from 'react-native';
import { useUserRecosSendQuery } from '@/features/user/userQueries';
import { useUserRecosInsertMutation } from '@/features/user/userMutations';
import { useAuth } from '@/providers/AuthProvider';
import Fuse from "fuse.js";
import UserAvatar from '@/components/user/UserAvatar';
import { Button } from '@/components/ui/Button';
import * as Burnt from 'burnt';
import { Badge } from '@/components/ui/Badge';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { FlashList } from '@shopify/flash-list';
import { FlatList, Pressable } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { BetterInput } from '@/components/ui/BetterInput';
import { BottomSheetProps } from '../BottomSheetManager';

interface BottomSheetSendRecoProps extends BottomSheetProps {
  media: Media,
};

const COMMENT_MAX_LENGTH = 180;

const BottomSheetSendReco = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetSendRecoProps
>(({ id, media, sizes = ["medium", "large"], ...props }, ref) => {
  const { colors, inset } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { closeSheet } = useBottomSheetStore();
  const {
		data: friends,
    isRefetching,
    refetch,
	} = useUserRecosSendQuery({
		userId: user?.id,
		mediaId: media.media_id!,
	});
	const sendMovie = useUserRecosInsertMutation();
  // REFs
  const refFlatList = React.useRef<FlatList<NonNullable<typeof friends>[number]>>(null);
  // SharedValues
  const footerHeight = useSharedValue(0);

  const [search, setSearch] = React.useState('');
  const fuse = React.useMemo(() => {
    return new Fuse(friends || [], {
      keys: ['friend.username', 'friend.full_name'],
      threshold: 0.5,
    });
	}, [friends]);
  const [results, setResults] = React.useState<typeof friends>([]);
  const [selected, setSelected] = React.useState<User[]>([]);
  const [comment, setComment] = React.useState('');

  const submit = async () => {
    if (!user || !media.media_id) return;
		sendMovie.mutate({
			senderId: user.id,
			mediaId: media.media_id,
			receivers: selected,
			comment: comment,
		}, {
			onSuccess: () => {
        Burnt.toast({
          title: upperFirst(t('common.messages.sent')),
          preset: 'done',
        })
				closeSheet(id);
			},
			onError: (error: any) => {
				if (error instanceof Error) {
          Burnt.toast({
            title: error.message,
            preset: 'error',
          })
				} else {
					switch (error.code) {
						case '23505':
              Burnt.toast({
							  title: `Vous avez déjà envoyé ce film à ${selected.length === 1 ? 'cet ami(e)' : 'un ou plusieurs de ces amis'}`,
                preset: 'error',
              })
							break;
						case '23514':
              Burnt.toast({
							  title: `Le commentaire est trop long (max ${COMMENT_MAX_LENGTH} caractère${COMMENT_MAX_LENGTH > 1 ? 's' : ''})`,
                preset: 'error',
              })
							break;
						default:
							Burnt.toast({
                title: upperFirst(t('common.errors.an_error_occurred')),
                preset: 'error',
              })
							break;
					}
				}
			}
		});
  };

  React.useEffect(() => {
    if (!friends?.length) return;
    if (search === '') {
      setResults(friends);
      return;
    }
    setResults(fuse?.search(search).map(({ item }) => item));
	}, [search, friends, fuse]);

  return (
    <ThemedTrueSheet
    ref={ref}
    sizes={sizes}
    FooterComponent={
      <View
      onLayout={(e) => {
        footerHeight.value = e.nativeEvent.layout.height;
      }}
      style={[{ paddingBottom: inset.bottom, backgroundColor: colors.muted }, tw`gap-2 pt-2 px-2`]}
      >
        <BetterInput
        variant='outline'
        defaultValue={comment}
        onChangeText={setComment}
        placeholder={upperFirst(t('common.messages.add_comment'))}
        maxLength={COMMENT_MAX_LENGTH}
        autoCapitalize='sentences'
        />
        <Button disabled={!selected.length} onPress={submit}>
          {upperFirst(t('common.messages.send'))}
        </Button>
      </View>
    }
    scrollRef={refFlatList as React.RefObject<React.Component<unknown, {}, any>>}
    {...props}
    >
      <FlatList
      ref={refFlatList}
      contentContainerStyle={{
        ...tw`px-2`,
        paddingBottom: footerHeight.get(),
      }}
      ListHeaderComponent={
        <View style={[tw`gap-2 pb-2`, {paddingTop: 16, backgroundColor: colors.muted }]}>
          <View style={tw`gap-2 p-2`}>
            <ThemedText style={tw`font-bold text-center`}>{upperFirst(t('common.messages.send_to_friend'))}</ThemedText>
            <FlashList
            data={selected}
            renderItem={({ item }) => (
              <Pressable
              key={item.id}
              onPress={() => setSelected((prev) => prev.filter(
                (selectedUser) => selectedUser?.id !== item.id
              ))}
              >
                <UserAvatar avatar_url={item.avatar_url} full_name={item.full_name} />
              </Pressable>
            )}
            style={tw`h-12`}
            contentContainerStyle={tw`w-full items-center justify-center gap-2`}
            ListEmptyComponent={() => (
              <Text style={[{ color: colors.mutedForeground }, tw`text-center`]}>
                Recomender <Text style={tw`font-bold`}>{media?.title}</Text> à un ami pour lui faire découvrir.
              </Text>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={tw`w-1`} />}
            />
          </View>
          <BetterInput
          variant='outline'
          defaultValue={search}
          onChangeText={setSearch}
          placeholder={upperFirst(t('common.messages.search_friend'))}
          autoCapitalize='none'
          autoCorrect={false}
          leftIcon='search'
          clearable
          />
        </View>
      }
      stickyHeaderIndices={[0]}
      data={results}
      renderItem={({ item: { friend, already_sent, as_watched } }) => (
        <Pressable
        key={friend.id}
        onPress={() => {
          if (selected.some((selectedUser) => selectedUser?.id === friend?.id)) {
            return setSelected((prev) => prev.filter(
              (selectedUser) => selectedUser?.id !== friend?.id
            ))
          }
          return setSelected((prev) => [...prev, friend]);
        }}
        >
          <View style={tw`flex-row items-center justify-between gap-2 p-2 py-2`}>
            <View style={tw` shrink flex-row items-center gap-2`}>
              <UserAvatar avatar_url={friend.avatar_url} full_name={friend.full_name} />
              <View>
                <ThemedText>{friend.full_name}</ThemedText>
                <Text style={{ color: colors.mutedForeground }}>@{friend.username}</Text>
              </View>
            </View>
            <View style={tw`flex-row items-center gap-2 shrink-0`}>
              {already_sent && (
                <Badge variant="accent-yellow">
                  Déjà envoyé
                </Badge>
              )}
              {as_watched && (
                <Badge variant="destructive">
                  Déjà vu
                </Badge>
              )}
              <Icons.Check size={20} style={[{ color: colors.foreground }, tw`${!selected.some((selectedUser) => selectedUser?.id === friend?.id) ? 'opacity-0' : ''}`]} />
            </View>
          </View>
        </Pressable>
      )}
      keyExtractor={(item) => item.friend.id}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      refreshing={isRefetching}
      />
    </ThemedTrueSheet>
  );
});
BottomSheetSendReco.displayName = 'BottomSheetSendReco';

export default BottomSheetSendReco;