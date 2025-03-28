import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { BottomSheetModal, BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/constants/Icons';
import { Media, User } from '@/types/type.db';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { FlatList, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useUserRecosSendQuery } from '@/features/user/userQueries';
import { useUserRecosInsertMutation } from '@/features/user/userMutations';
import { useAuth } from '@/context/AuthProvider';
import Fuse from "fuse.js";
import { InputBottomSheet } from '@/components/ui/Input';
import UserAvatar from '@/components/user/UserAvatar';
import { Button, ButtonText } from '@/components/ui/Button';
import * as Burnt from 'burnt';
import { Badge } from '@/components/ui/Badge';

interface BottomSheetSendRecoProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
  id: string;
  media: Media,
};

const COMMENT_MAX_LENGTH = 180;

const BottomSheetSendReco = forwardRef<
  React.ElementRef<typeof BottomSheetModal>,
  BottomSheetSendRecoProps
>(({ id, media, snapPoints, ...props }, ref) => {
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

  const [search, setSearch] = useState('');
  const fuse = useMemo(() => {
    if (!friends) return null;
    return new Fuse(friends, {
      keys: ['friend.username', 'friend.full_name'],
      threshold: 0.3,
    });
	}, [friends]);
  const [results, setResults] = useState<typeof friends>([]);
  const [selected, setSelected] = useState<User[]>([]);
  const [comment, setComment] = useState('');

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

  useEffect(() => {
    if (!friends?.length) return;
    if (search === '') {
      setResults(friends);
      return;
    }
    setResults(fuse?.search(search).map(({ item }) => item));
	}, [search, friends, fuse]);

  return (
    <BottomSheetModal
    ref={ref}
    {...props}
    >
      <BottomSheetView
      style={[
        { paddingBottom: inset.bottom },
        tw`flex-1 gap-2 mx-2`,
      ]}
      >
        <View style={tw`gap-2 p-2`}>
          <ThemedText style={tw`font-bold text-center`}>Envoyer à un(e) ami(e)</ThemedText>
          <View style={tw`h-12 flex-row items-center justify-center overflow-hidden -gap-2`}>
            {selected.length ? selected.map((friend) => (
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
            )}
          </View>
        </View>
        <InputBottomSheet
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
          onRefresh={refetch}
          />
        </View>
        <InputBottomSheet
        defaultValue={comment}
        onChangeText={setComment}
        placeholder={upperFirst(t('common.messages.add_comment'))}
        maxLength={COMMENT_MAX_LENGTH}
        />
        <Button disabled={!selected.length} onPress={submit}>
          <ButtonText>{upperFirst(t('common.messages.send'))}</ButtonText>
        </Button>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
BottomSheetSendReco.displayName = 'BottomSheetSendReco';

export default BottomSheetSendReco;