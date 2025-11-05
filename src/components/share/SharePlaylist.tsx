import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { View } from "@/components/ui/view";
import { Playlist, Profile, User } from "@recomendapp/types";
import tw from "@/lib/tw";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import ViewShot from "react-native-view-shot";
import { Text } from "@/components/ui/text";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/Button";
import { BORDER_RADIUS, GAP, HEIGHT, PADDING, PADDING_HORIZONTAL, PADDING_VERTICAL, SOCIAL_CARD_WIDTH } from "@/theme/globals";
import WheelSelector from "@/components/ui/WheelSelector";
import { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { CaptureResult, ShareViewRef } from "@/components/share/type";
import { LucideIcon } from "lucide-react-native";
import { router } from "expo-router";
import { ScaledCapture } from "@/components/ui/ScaledCapture";
import { useWindowDimensions } from "react-native";
import { clamp } from "lodash";
import { useImagePalette } from "@/hooks/useImagePalette";
import Color from "color";
import { useTranslations } from "use-intl";
import { ShapeVerticalRoundedBackground } from "@/lib/icons";

interface SharePlaylistProps extends React.ComponentProps<typeof ViewShot> {
	playlist: Playlist;
	variant?: 'default';
	isPremium?: boolean;
};

type EditType = 'poster' | 'background';

type EditOption = {
	value: EditType;
	icon: LucideIcon;
}

const ITEM_WIDTH = 64;
const ITEM_SPACING = 8;

const EditOptionsSelector = ({
	editOptions,
	activeEditingOption,
	setActiveEditingOption
}: {
	editOptions: EditOption[];
	activeEditingOption: EditType;
	setActiveEditingOption: (value: EditType) => void;
}) => {
	const { colors } = useTheme();
	const renderEditItem = useCallback((item: EditOption, isActive: boolean) => {
		return (
		<View
		style={[
			tw`rounded-full items-center justify-center w-full aspect-square border`,
			{
				backgroundColor: colors.muted,
				borderColor: isActive ? colors.foreground : colors.border,
			}
		]}
		>
			<item.icon size={20} color={colors.foreground} />
		</View>
		);
	}, []);

	const handleSelectionChange = useCallback((item: EditOption) => {
		setActiveEditingOption(item.value);
	}, [setActiveEditingOption]);

	const initialIndex = useMemo(() => {
		const isFind = editOptions.findIndex(e => e.value === activeEditingOption);
		return isFind === -1 ? 0 : isFind;
	}, [editOptions, activeEditingOption]);

	const keyExtractor = useCallback((item: EditOption) => item.value, []);

	return (
		<WheelSelector
		data={editOptions}
		extraData={activeEditingOption}
		entering={FadeInDown}
		exiting={FadeOutDown}
		renderItem={renderEditItem}
		keyExtractor={keyExtractor}
		onSelectionChange={handleSelectionChange}
		initialIndex={initialIndex}
		enableHaptics={true}
		itemWidth={HEIGHT}
		style={{
			marginVertical: PADDING_VERTICAL,
		}}
		/>
	);
};

/* -------------------------------- VARIANTS -------------------------------- */
const SharePlaylistDefault = ({ playlist, poster, scale = 1 } : { playlist: Playlist, poster: string | undefined, scale?: number }) => {
	const t = useTranslations();
	const { colors } = useTheme();
	return (
		<View
		style={{
			borderRadius: BORDER_RADIUS * scale,
			backgroundColor: Color(colors.muted).alpha(0.95).string(),
			gap: GAP * scale,
			padding: PADDING / 2 * scale
		}}
		>
			<ImageWithFallback
			source={{uri: poster ?? '' }}
			alt={playlist.title ?? ''}
			type={'playlist'}
			style={[
				{
					aspectRatio: 1 / 1,
					borderRadius: BORDER_RADIUS * scale
				},
				tw`w-full h-auto`
			]}
			/>
			<View>
				<Text style={[tw`font-bold`, { fontSize: 16 * scale }]}>{playlist.title}</Text>
				{/* {playlist.user && (
					<View style={[tw`flex-row items-center`, { gap: 4 * scale }]}>
						<UserAvatar style={{ width: 20 * scale }} full_name={playlist.user.full_name!} avatar_url={playlist.user.avatar_url} />
						<Text style={{ fontSize: 12 * scale }}>{playlist.user.full_name}</Text>
					</View>
				)} */}
				{playlist.user && <Text textColor="muted" style={{ fontSize: 12 * scale }}>{t('common.messages.by_name', { name: `@${playlist.user?.username}` })}</Text>}
			</View>
			<Icons.app.logo color={colors.accentYellow} height={10 * scale}/>
		</View>
	)
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- CUSTOM --------------------------------- */
const ColorSelector = ({
	colors,
	bgColor,
	setBgColor,
}: {
	colors: string[];
	bgColor: { index: number, color: string } | null;
	setBgColor: (color: { index: number, color: string } | null) => void;
}) => {
	const { colors: colorsTheme } = useTheme();

	const renderColorItem = useCallback((item: string, isActive: boolean) => (
		<View
		style={[
			{
				backgroundColor: item,
				borderColor: colorsTheme.border,
			},
			tw`w-full aspect-square rounded-full overflow-hidden border-2`,
		]}
		/>
	), [colorsTheme.border]);
	
	const handleColorSelection = useCallback((item: string, index: number) => {
		setBgColor({ index, color: item });
	}, [setBgColor]);

	const keyExtractor = useCallback((item: string, index: number) => index.toString(), []);
	return (
		<WheelSelector
		entering={FadeInDown}
		exiting={FadeOutDown}
		data={colors}
		renderItem={renderColorItem}
		keyExtractor={keyExtractor}
		onSelectionChange={handleColorSelection}
		initialIndex={bgColor?.index ?? 0}
		enableHaptics={true}
		itemWidth={ITEM_WIDTH}
		itemSpacing={ITEM_SPACING}
		wheelAngle={0}
		wheelIntensity={0.2}
		/>
	);
};

/* -------------------------------------------------------------------------- */

export const SharePlaylist = forwardRef<
	ShareViewRef,
	SharePlaylistProps
>(({ playlist, variant = 'default', isPremium, ...props }, ref) => {
	const viewShotRef = useRef<ViewShot>(null);
	const { height: screenHeight } = useWindowDimensions();
	const { colors } = useTheme();
	// States
	const [poster, setPoster] = useState(playlist.poster_url || undefined);
	const { palette } = useImagePalette(poster);
	const [bgColor, setBgColor] = useState<{index: number, color: string } | null>(palette ? { index: 0, color: palette[0] } : null);
	const [bgType, setBgType] = useState<'color' | 'image'>('color');
	const [editing, setEditing] = useState(false);
	const editOptions = useMemo((): EditOption[] => {
		return [{ value: 'background', icon: ShapeVerticalRoundedBackground }];
	}, []);
	const [activeEditingOption, setActiveEditingOption] = useState(editOptions[0].value);

	useImperativeHandle(ref, () => ({
      	capture: async (options): Promise<CaptureResult> => {
			if (!viewShotRef.current) throw new Error('ViewShot ref is not available');	
			const uri = await viewShotRef.current.capture?.();

			return {
				sticker: uri,
				...(bgType === 'color' && bgColor ? {
					backgroundTopColor: bgColor.color,
					backgroundBottomColor: bgColor.color,
				} : {}),
			};
		}
	}));

	const renderSticker = useCallback((scale: number) => (
		<SharePlaylistDefault playlist={playlist} poster={poster} scale={scale} />
	), [playlist, poster]);

	const handleEnableEditing = useCallback(() => {
		if (isPremium) {
			setEditing((v) => !v);
		} else {
			router.push('/upgrade');
		}
	}, [isPremium]);

	const EditSelectors = useMemo(() => {
		if (!editing) return null;
		return (
			<EditOptionsSelector
			editOptions={editOptions}
			activeEditingOption={activeEditingOption}
			setActiveEditingOption={setActiveEditingOption}
			/>
		);
	}, [editing]);
	
	const EditButtons = useMemo(() => (
		<View style={[tw`absolute top-2 right-2 flex-row items-center`, { gap: GAP }]}>
			<Button
			variant="muted"
			icon={editing ? Icons.Check : Icons.Edit}
			size="icon"
			style={tw`rounded-full`}
			onPress={handleEnableEditing}
			/>
		</View>
	), [editing, activeEditingOption, bgType, bgColor]);
	
	const EditOptions = useMemo(() => {
		if (!editing) return null;
		const content = (() => {
			switch (activeEditingOption) {
				case 'background':
					if (palette) {
						return (
							<ColorSelector
							colors={palette}
							bgColor={bgColor}
							setBgColor={setBgColor}
							/>
						);
					}
				default:
					return null;
			}
		})();
		return (
			<View style={[tw`absolute w-full`, { bottom: PADDING_VERTICAL }]}>
				{content}
			</View>
		)
	}, [editing, activeEditingOption]);

	// useEffects
	useEffect(() => {
		if (palette) {
			setBgColor({ index: 0, color: palette[0] });
		} else {
			setBgColor(null);
		};
	}, [palette]);

	return (
		<View style={{ gap: GAP }} {...props}>
			<View style={tw`items-center`}>
				<View
					style={[
						{ aspectRatio: 9/16, paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL, borderRadius: BORDER_RADIUS, height: clamp(400, screenHeight * 0.7), backgroundColor: colors.background },
						tw`relative items-center justify-center overflow-hidden`
					]}
				>
					{bgColor && (
						<View style={[tw`absolute inset-0`, { backgroundColor: bgColor.color }]} />
					)}
					
					<ScaledCapture
					ref={viewShotRef}
					targetWidth={SOCIAL_CARD_WIDTH}
					renderContent={renderSticker}
					/>
					{EditButtons}
				</View>
				{EditOptions}
			</View>
			{EditSelectors}
		</View>
	);
});
SharePlaylist.displayName = 'SharePlaylist';