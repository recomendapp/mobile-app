import React from 'react';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/constants/Icons';
import { Media, User } from '@/types/type.db';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { FlatList, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useUserRecosSendQuery } from '@/features/user/userQueries';
import { useUserRecosInsertMutation } from '@/features/user/userMutations';
import { useAuth } from '@/providers/AuthProvider';
import Fuse from "fuse.js";
import UserAvatar from '@/components/user/UserAvatar';
import { Button, ButtonText } from '@/components/ui/Button';
import * as Burnt from 'burnt';
import { Badge } from '@/components/ui/Badge';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Input } from '@/components/ui/Input';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { FlashList } from '@shopify/flash-list';
import { Pressable } from 'react-native-gesture-handler';

interface BottomSheetSendRecoProps extends Omit<React.ComponentPropsWithoutRef<typeof TrueSheet>, 'children'> {
  id: string;
  media: Media,
};

const COMMENT_MAX_LENGTH = 180;

const BottomSheetSendReco = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetSendRecoProps
>(({ id, media, ...props }, ref) => {
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

  const [search, setSearch] = React.useState('');
  const fuse = React.useMemo(() => {
    if (!friends) return null;
    return new Fuse(friends, {
      keys: ['friend.username', 'friend.full_name'],
      threshold: 0.3,
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
    contentContainerStyle={tw`gap-2 mx-2`}
    {...props}
    >
      <View style={tw`gap-2 p-2 justify-center items-center`}>
        <ThemedText style={tw`font-bold text-center`}>Envoyer à un(e) ami(e)</ThemedText>
        {/* <View style={tw`h-12 flex-row items-center justify-center overflow-hidden -gap-2`}> */}
          {/* {selected.length ? selected.map((friend) => (
            <TouchableOpacity
            key={friend.id}
            onPress={() => setSelected((prev) => prev.filter(
              (selectedUser) => selectedUser?.id !== friend.id
            ))}
            >
              <UserAvatar avatar_url={friend.avatar_url} full_name={friend.full_name} />
            </TouchableOpacity>
          )) : (
            <Text style={[{ color: colors.mutedForeground }, tw`text-center`]}>
              Recomender <Text style={tw`font-bold`}>{media?.title}</Text> à un ami pour lui faire découvrir.
            </Text>
          )} */}
        {/* </View> */}
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
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tw`h-12`}
        contentContainerStyle={tw`items-center justify-center gap-2`}
        ListEmptyComponent={
          <Text style={[{ color: colors.mutedForeground }, tw`text-center`]}>
            Recomender <Text style={tw`font-bold`}>{media?.title}</Text> à un ami pour lui faire découvrir.
          </Text>
        }
        />
      </View>
      <Input
      variant='outline'
      defaultValue={search}
      onChangeText={setSearch}
      placeholder={upperFirst(t('common.messages.search_friend'))}
      />
      <View style={tw`h-64`}>
        <FlatList
        data={results}
        renderItem={({ item: { friend, already_sent, as_watched } }) => (
          <TouchableWithoutFeedback
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
          </TouchableWithoutFeedback>
        )}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        // onRefresh={refetch}
        />
      </View>
      <Input
      variant='outline'
      defaultValue={comment}
      onChangeText={setComment}
      placeholder={upperFirst(t('common.messages.add_comment'))}
      maxLength={COMMENT_MAX_LENGTH}
      />
      <Button disabled={!selected.length} onPress={submit}>
        <ButtonText>{upperFirst(t('common.messages.send'))}</ButtonText>
      </Button>
    </ThemedTrueSheet>
  );
});
BottomSheetSendReco.displayName = 'BottomSheetSendReco';

export default BottomSheetSendReco;