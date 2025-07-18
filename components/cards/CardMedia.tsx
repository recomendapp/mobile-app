import * as React from "react"
import { Media, UserActivity } from "@/types/type.db";
import { ThemedText } from "../ui/ThemedText";
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "../utils/ImageWithFallback";
import { Href, useRouter } from "expo-router";
import tw from "@/lib/tw";
import { Pressable, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetMedia from "../bottom-sheets/sheets/BottomSheetMedia";
import { IconMediaRating } from "../medias/IconMediaRating";
import MediaActionUserActivityRating from "../medias/actions/MediaActionUserActivityRating";

interface CardMediaProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default" | "poster" | "row";
		media: Media;
		activity?: UserActivity;
		profileActivity?: UserActivity;
		linked?: boolean;
		posterClassName?: string;
		disableActions?: boolean;
		showRating?: boolean;
		showAction?: {
			rating?: boolean;
		}
		hideMediaType?: boolean;
		index?: number;
		children?: React.ReactNode;
	}

const CardMediaDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	Omit<CardMediaProps, "variant">
>(({ style, media, activity, showAction, profileActivity, children, linked, showRating, posterClassName, ...props }, ref) => {
	const { colors } = useTheme();
	return (
		<Animated.View
		ref={ref}
		style={[
			{ backgroundColor: colors.card, borderColor: colors.border },
			tw`flex-row justify-between items-center rounded-xl h-20 p-1 gap-2 border overflow-hidden`,
			style,
		]}
		{...props}
		>
			<View style={tw`flex-1 flex-row items-center gap-2`}>
				<ImageWithFallback
					source={{uri: media.avatar_url ?? ''}}
					alt={media.title ?? ''}
					type={media.media_type}
					style={{
						aspectRatio: 2 / 3,
						width: 'auto',
					}}
				/>
				<View style={tw`shrink px-2 py-1 gap-1`}>
					<ThemedText numberOfLines={2}>{media.title}</ThemedText>
					{children}
				</View>
			</View>
			{showAction || showRating ? (
			<View style={tw`flex-row items-center gap-2`}>
				{showAction?.rating ? (
					<MediaActionUserActivityRating media={media} />
				) : null}
				{showRating ? (
					<IconMediaRating rating={activity?.rating} />
				) : null}
			</View>
 			) : null}
		</Animated.View>
	);
});
CardMediaDefault.displayName = "CardMediaDefault";

const CardMediaPoster = React.forwardRef<
React.ComponentRef<typeof Animated.View>,
	Omit<CardMediaProps, "variant">
>(({ style, media, activity, profileActivity, linked, disableActions, showRating, children, ...props }, ref) => {
	return (
		<Animated.View
			ref={ref}
			style={[
				{ aspectRatio: 2 / 3 },
				tw.style('relative flex gap-4 items-center w-32 shrink-0 rounded-sm border-transparent overflow-hidden'),
				style,
			]}
			{...props}
		>
			<ImageWithFallback
				source={{uri: media.avatar_url ?? ''}}
				alt={media.title ?? ''}
				type={media.media_type}
			/>
			{(media.vote_average
			|| media.tmdb_vote_average
			|| profileActivity?.rating
			|| profileActivity?.is_liked
			|| profileActivity?.review
			) ? (
				<View style={tw`absolute top-1 right-1 flex-col gap-1`}>
					{(media.vote_average || media.tmdb_vote_average) ?
					<IconMediaRating
					rating={media.vote_average ?? media.tmdb_vote_average}
					/> : null}
					{(profileActivity?.is_liked
					|| profileActivity?.rating
					|| profileActivity?.review) ? (
					<IconMediaRating
					rating={profileActivity.rating}
					variant="profile"
					/>) : null}
				</View>
			) : null}
		</Animated.View>
	);
});
CardMediaPoster.displayName = "CardMediaPoster";

// const CardMediaRow = React.forwardRef<
// 	HTMLDivElement,
// 	Omit<CardMediaProps, "variant">
// >(({ className, posterClassName, media, activity, profileActivity, hideMediaType, linked, showRating, children, ...props }, ref) => {
// 	const mediaUrlPrefix = getMediaUrlPrefix(media.media_type!);
// 	return (
// 		<Card
// 			ref={ref}
// 			className={cn(
// 				"group flex gap-4 items-center p-1",
// 				linked ? "hover:bg-muted-hover" : "",
// 				className
// 			)}
// 			{...props}
// 		>
// 			<div className={cn("relative w-24 aspect-[2/3] rounded-md overflow-hidden", posterClassName)}>
// 				<ImageWithFallback
// 					src={media.avatar_url ?? ''}
// 					alt={media.title ?? ''}
// 					fill
// 					className="object-cover"
// 					type={media.media_type}
// 					sizes={`
// 					(max-width: 640px) 96px,
// 					(max-width: 1024px) 120px,
// 					150px
// 					`}
// 				/>
// 			</div>
// 			<div className="flex items-center gap-4 justify-between w-full">
// 				<div className='space-y-1'>
// 					<div className="flex items-center gap-2">
// 						<WithLink
// 						href={linked ? (media.url ?? '') : undefined}
// 						className='line-clamp-2 break-words'
// 						onClick={linked ? (e) => e.stopPropagation() : undefined}
// 						>
// 							{media.title}
// 						</WithLink>
// 						{profileActivity?.rating ? (
// 							<WithLink
// 							href={linked ? `/@${profileActivity?.user?.username}${mediaUrlPrefix}/${media.slug ?? media.id}` : undefined}
// 							className="pointer-events-auto"
// 							onClick={linked ? (e) => e.stopPropagation() : undefined}
// 							>
// 								<IconMediaRating
// 								rating={profileActivity.rating}
// 								className="inline-flex"
// 								/>
// 							</WithLink>
// 						) : null}
// 						{profileActivity?.is_liked && (
// 							<Link
// 							href={`/@${profileActivity?.user?.username}${mediaUrlPrefix}/${media.slug ?? media.id}`}
// 							className="pointer-events-auto"
// 							onClick={linked ? (e) => e.stopPropagation() : undefined}
// 							>
// 								<Icons.like
// 								size={24}
// 								className="text-accent-pink fill-accent-pink inline-flex"
// 								/>
// 							</Link>
// 						)}
// 						{profileActivity?.review ? (
// 							<Link
// 							href={`/review/${profileActivity.review.id}`}
// 							className="pointer-events-auto"
// 							onClick={linked ? (e) => e.stopPropagation() : undefined}
// 							>
// 								<Icons.comment
// 								size={24}
// 								className="text-foreground inline-flex"
// 								/>
// 							</Link>
// 						) : null}
// 					</div>
// 					{media.main_credit ? <Credits credits={media.main_credit} linked={linked} className="line-clamp-2"/> : null}
// 					{media.extra_data.known_for_department ? <div className="text-xs text-muted-foreground">{media.extra_data.known_for_department}</div> : null}
// 					{!hideMediaType ? <BadgeMedia type={media.media_type} /> : null}
// 				</div>
// 				{media.date ? (
// 					<DateOnlyYearTooltip date={media.date} className="text-xs text-muted-foreground"/>
// 				) : null}
// 			</div>
// 		</Card>
// 	);
// });
// CardMediaRow.displayName = "CardMediaRow";

const CardMedia = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardMediaProps
>(({ hideMediaType = true, showRating = true, linked = true, variant = "default", ...props }, ref) => {
	const router = useRouter();
	const { openSheet } = useBottomSheetStore();
	const onPress = () => {
		if (linked && props.media.url) {
			router.push(props.media.url as Href);
		}
	};
	const onLongPress = () => {
		openSheet(BottomSheetMedia, {
			media: props.media,
		});
	};
	return (
	<Pressable
	onPress={onPress}
	onLongPress={onLongPress}
	>
		{variant === "default" ? (
			<CardMediaDefault ref={ref} linked={linked} showRating={showRating} {...props} />
		) : variant == "poster" ? (
			<CardMediaPoster ref={ref} linked={linked} showRating={showRating} {...props} />
		// ) : variant == "row" ? (
			// <CardMediaRow ref={ref} className={cn(linked ? 'cursor-pointer' : '', className)} media={media} linked={linked} onClick={customOnClick} showRating={showRating} hideMediaType={hideMediaType} {...props} />
		) : null}
	</Pressable>
	);
});
CardMedia.displayName = "CardMedia";

export {
	type CardMediaProps,
	CardMedia,
	CardMediaDefault,
	CardMediaPoster,
	// CardMediaRow,
}
  

// const Credits = ({
// 	credits,
// 	linked,
// 	className,
// } : {
// 	credits: MediaPerson[];
// 	linked?: boolean;
// 	className?: string;
// }) => {
// 	if (!credits || credits.length === 0) return null;
// 	return (
// 	  <p className={cn('line-clamp-1', className)}>
// 		{credits?.map((credit, index) => (
// 		  <span key={index}>
// 			<Button
// 			  variant={'link'}
// 			  className={`
// 				p-0 h-full italic text-muted-foreground transition
// 				${linked ? 'hover:text-accent-1' : 'hover:text-muted-foreground hover:no-underline'}
// 			`}
// 			  asChild
// 			>
// 			  <WithLink
// 			  href={linked ? (credit.url ?? '') : undefined}
// 			  onClick={linked ? (e) => e.stopPropagation() : undefined}
// 			  >
// 				{credit.title}
// 			  </WithLink>
// 			</Button>
// 			{index !== credits.length - 1 && (
// 			  <span className='text-muted-foreground'>, </span>
// 			)}
// 		  </span>
// 		))}
// 	  </p>
// 	)
// }