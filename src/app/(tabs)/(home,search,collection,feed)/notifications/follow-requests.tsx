import { CardUser } from "@/components/cards/CardUser";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { useUserAcceptFollowerRequestMutation, useUserDeclineFollowerRequestMutation } from "@/features/user/userMutations";
import { useUserFollowersRequestsQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { UserFollower } from "@recomendapp/types";
import { LegendList } from "@legendapp/list";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback } from "react";
import { useToast } from "@/components/Toast";

const FollowRequestsScreen = () => {
	const t = useTranslations();
	const insets = useSafeAreaInsets();
	const toast = useToast();
	const { session } = useAuth();
	const {
		data: requests,
		isLoading,
		isError,
		isRefetching,
		refetch,
	} = useUserFollowersRequestsQuery({
		userId: session?.user.id,
	});
	const loading = requests === undefined || isLoading;

	// Mutations
	const acceptRequest = useUserAcceptFollowerRequestMutation({
		userId: session?.user.id,
	});
	const declineRequest = useUserDeclineFollowerRequestMutation({
		userId: session?.user.id,
	});

	// Handlers
	const handleAcceptRequest = useCallback(async (requestId: number) => {
		await acceptRequest.mutateAsync({
			requestId
		}, {
			onSuccess: () => {
				toast.success(upperFirst(t('common.messages.request_accepted', { count: 1 })));
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [acceptRequest, t, toast]);
	const handleDeclineRequest = useCallback(async (requestId: number) => {
		await declineRequest.mutateAsync({
			requestId
		}, {
			onSuccess: () => {
				toast.success(upperFirst(t('common.messages.request_declined', { count: 1 })));
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [declineRequest, t, toast]);

	// Renders
	const renderItems = useCallback(({ item } : { item: UserFollower }) => {
		return (
			<CardUser user={item.user} style={tw`bg-transparent border-0 p-0 h-auto`}>
				<View style={tw`flex-row items-center justify-between gap-2`}>
					<Button icon={Icons.Check} size="fit" variant="accent-blue" onPress={() => handleAcceptRequest(item.id)} style={tw`py-1 px-2`}>
						{upperFirst(t('common.messages.accept'))}
					</Button>
					<Button icon={Icons.X} size="fit" variant="outline" onPress={() => handleDeclineRequest(item.id)} style={tw`py-1 px-2`}>
						{upperFirst(t('common.messages.decline'))}
					</Button>
				</View>
			</CardUser>
		)
	}, [handleAcceptRequest, handleDeclineRequest, t]);


	return (
	<>
		<LegendList
		data={requests || []}
		renderItem={renderItems}
		keyExtractor={useCallback((item: UserFollower) => item.id.toString(), [])}
		refreshing={isRefetching}
		onRefresh={refetch}
		ListEmptyComponent={
			loading ? <Icons.Loader />
			: (
				<View>
					<Text textColor="muted" style={tw`text-center`}>
						{upperFirst(t('common.messages.no_follow_requests'))}
					</Text>
				</View>
			)
		}
		contentContainerStyle={[
			{
				gap: GAP,
				paddingHorizontal: PADDING_HORIZONTAL,
				paddingTop: PADDING_VERTICAL,
				paddingBottom: insets.bottom + PADDING_VERTICAL,
			}
		]}
		/>
	</>
	)
};

export default FollowRequestsScreen;