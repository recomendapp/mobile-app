import React from 'react';
import tw from '@/lib/tw';
import { Icons } from '@/constants/Icons';
import { MediaPerson } from '@recomendapp/types';
import { LinkProps, usePathname, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { View } from 'react-native';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { ScrollView } from 'react-native-gesture-handler';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/providers/AuthProvider';
import BottomSheetShare from './share/BottomSheetShare';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomSheetPersonProps extends BottomSheetProps {
  person?: MediaPerson,
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

const BottomSheetPerson = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetPersonProps
>(({ id, person, additionalItemsTop = [], additionalItemsBottom = [], ...props }, ref) => {
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
        icon: Icons.User,
        onPress: () => router.push(person?.url as LinkProps['href']),
        label: upperFirst(t('common.messages.go_to_person')),
        disabled: person?.url ? pathname.startsWith(person.url) : false
      },
      {
        icon: Icons.Share,
        onPress: () => openSheet(BottomSheetShare, {
          type: 'person',
          path: person?.url!,
          person: person,
        }),
        label: upperFirst(t('common.messages.share')),
      }
    ],
    [
      ...additionalItemsBottom,
    ],
  ]), [person, additionalItemsTop, additionalItemsBottom, openSheet, router, t, pathname, session]);
  
  return (
    <ThemedTrueSheet
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
            <ImageWithFallback
            alt={person?.name ?? ''}
            source={{ uri: person?.profile_url ?? '' }}
            style={[
              { aspectRatio: 2 / 3, height: 'fit-content' },
              tw.style('rounded-md w-12'),
            ]}
            type={'person'}
            />
            <View style={tw`shrink`}>
              <Text numberOfLines={2} style={tw`shrink`}>{person?.name}</Text>
              {person?.known_for_department && (
                <Text numberOfLines={1} style={[{ color: colors.mutedForeground }, tw`shrink`]}>
                  {person.known_for_department}
                </Text>
              )}
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
    </ThemedTrueSheet>
  );
});
BottomSheetPerson.displayName = 'BottomSheetPerson';

export default BottomSheetPerson;