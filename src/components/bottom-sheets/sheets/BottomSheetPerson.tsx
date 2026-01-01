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
import TrueSheet from '@/components/ui/TrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/text';
import BottomSheetSharePerson from './share/BottomSheetSharePerson';
import { FlashList } from '@shopify/flash-list';
import { PADDING_VERTICAL } from '@/theme/globals';

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
  const { colors, mode, isLiquidGlassAvailable } = useTheme();
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  // States
  const items: Item[] = React.useMemo(() => ([
    ...additionalItemsTop,
    {
      icon: Icons.Share,
      onPress: () => openSheet(BottomSheetSharePerson, {
        person: person!,
      }),
      label: upperFirst(t('common.messages.share')),
    },
    {
      icon: Icons.User,
      onPress: () => router.push(person?.url as LinkProps['href']),
      label: upperFirst(t('common.messages.go_to_person')),
      disabled: person?.url ? pathname.startsWith(person.url) : false
    },
    ...additionalItemsBottom,
  ]), [person, additionalItemsTop, additionalItemsBottom, openSheet, router, t, pathname]);
  
  return (
    <TrueSheet
    ref={ref}
    scrollable
    {...props}
    >
      <FlashList
      data={[
        'header',
        ...items,
      ]}
      contentContainerStyle={{ paddingTop: PADDING_VERTICAL }}
      bounces={false}
      keyExtractor={(_, i) => i.toString()}
      stickyHeaderIndices={[0]}
      renderItem={({ item }) => (
        typeof item === 'string' ? (
          <View
          style={[
            { backgroundColor: isLiquidGlassAvailable ? 'transparent' : colors.muted, borderColor: colors.mutedForeground },
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
        ) : (
          <Button
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
        )
      )}
      indicatorStyle={mode === 'dark' ? 'white' : 'black'}
      nestedScrollEnabled
      />
    </TrueSheet>
  );
});
BottomSheetPerson.displayName = 'BottomSheetPerson';

export default BottomSheetPerson;