import React from 'react';
import tw from '@/lib/tw';
import { Icons } from '@/constants/Icons';
import { Profile, User } from '@recomendapp/types';
import { usePathname, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { View, ScrollView } from 'react-native';
import TrueSheet from '@/components/ui/TrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/providers/AuthProvider';
import UserAvatar from '@/components/user/UserAvatar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheetShareUser from './share/BottomSheetShareUser';

interface BottomSheetUserProps extends BottomSheetProps {
  user: User | Profile,
  additionalItemsTop?: Item[];
  additionalItemsBottom?: Item[];
};

interface Item {
	icon: LucideIcon;
	label: string;
	onPress: () => void;
	submenu?: Item[];
  closeOnPress?: boolean;
  disabled?: boolean;
}

const BottomSheetUser = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetUserProps
>(({ id, user, additionalItemsTop = [], additionalItemsBottom = [], ...props }, ref) => {
  const openSheet = useBottomSheetStore((state) => state.openSheet);
  const closeSheet = useBottomSheetStore((state) => state.closeSheet);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { session } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  // REFs
  const scrollRef = React.useRef<ScrollView>(null);
  // States
  const items: Item[][] = React.useMemo(() => ([
    [
      ...additionalItemsTop,
    ],
    [
      {
        icon: Icons.Share,
        onPress: () => openSheet(BottomSheetShareUser, {
          user: user,
        }),
        label: upperFirst(t('common.messages.share')),
      },
      {
        icon: Icons.User,
        onPress: () => router.push(`/user/${user.username}`),
        label: upperFirst(t('common.messages.go_to_user')),
        disabled: pathname.startsWith(`/user/${user.username}`)
      },
    ],
    [
      ...additionalItemsBottom,
    ],
  ]), [user, additionalItemsTop, additionalItemsBottom, openSheet, router, t, pathname, session]);
  
  return (
    <TrueSheet
    ref={ref}
    scrollRef={scrollRef as React.RefObject<React.Component<unknown, {}, any>>}
    contentContainerStyle={tw`p-0`}
    {...props}
    >
      <ScrollView
      ref={scrollRef}
      bounces={false}
      contentContainerStyle={{ paddingBottom: insets.bottom }}
      stickyHeaderIndices={[0]}
      >
        <View
        style={[
          { backgroundColor: colors.muted, borderColor: colors.mutedForeground },
          tw`border-b p-4`,
        ]}
        >
          <View style={tw`flex-row items-center gap-2 `}>
            <UserAvatar
            full_name={user.full_name!}
            avatar_url={user.avatar_url}
            style={tw`w-12 h-12`}
            />
            <View style={tw`shrink`}>
              <Text numberOfLines={2} style={tw`shrink`}>{user?.full_name}</Text>
              <Text numberOfLines={1} style={[{ color: colors.mutedForeground }, tw`shrink`]}>
                @{user.username}
              </Text>
            </View>
          </View>
        </View>
        {items.map((group, i) => (
          <React.Fragment key={i}>
            {group.map((item, j) => (
              <Button
              key={j}
              variant='ghost'
              icon={item.icon}
              iconProps={{
                color: colors.mutedForeground,
              }}
              disabled={item.disabled}
              style={tw`justify-start h-auto py-4`}
              onPress={() => {
                (item.closeOnPress || item.closeOnPress === undefined) && closeSheet(id);
                item.onPress();
              }}
              >
                {item.label}
              </Button>
            ))}
          </React.Fragment>
        ))}
      </ScrollView>
    </TrueSheet>
  );
});
BottomSheetUser.displayName = 'BottomSheetUser';

export default BottomSheetUser;