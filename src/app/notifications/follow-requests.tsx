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
import { LegendList } from "@legendapp/list";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useToast } from "@/components/Toast";
import { useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FollowRequestsScreen = () => {
	const t = useTranslations();
	const toast = useToast();
	const { session } = useAuth();
	const insets = useSafeAreaInsets();
	const {
		data: requests,
		isLoading,
		isRefetching,
		refetch,
	} = useUserFollowersRequestsQuery({
		userId: session?.user.id,
	});
	const loading = requests === undefined || isLoading;

	// Mutations
	const { mutateAsync: acceptRequest} = useUserAcceptFollowerRequestMutation({
		userId: session?.user.id,
	});
	const { mutateAsync: declineRequest} = useUserDeclineFollowerRequestMutation({
		userId: session?.user.id,
	});

	// Handlers
	const handleAcceptRequest = useCallback(async (requestId: number) => {
		await acceptRequest({
			requestId
		}, {
			onSuccess: () => {
				toast.success(upperFirst(t('common.messages.request_accepted', { count: 1 })));
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [acceptRequest, toast, t]);
	const handleDeclineRequest = useCallback(async (requestId: number) => {
		await declineRequest({
			requestId
		}, {
			onSuccess: () => {
				toast.success(upperFirst(t('common.messages.request_declined', { count: 1 })));
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [declineRequest, toast, t]);

	return (
	<>
		<LegendList
		data={requests || []}
		renderItem={({ item }) => (
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
		)}
		keyExtractor={(item) => item.id.toString()}
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