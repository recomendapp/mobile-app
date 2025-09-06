import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { LegendList } from "@legendapp/list";
import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback } from "react";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import { useTranslations } from "use-intl";

const UpgradeScreen = () => {
	const t = useTranslations();
	const {
		data,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['products'],
		queryFn: async () => {
			const offerings = await Purchases.getOfferings();
			return offerings;
		}
	});
	const handleUpgrade = useCallback(async (item: PurchasesPackage) => {
		try {
			await Purchases.purchasePackage(item);
		} catch (error: any) {
			if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return;
			console.error(error);
		}
	}, []);
	console.log('data',data?.current?.annual)
	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('common.messages.upgrade_to_plan', { plan: 'Premium' })),
			}}
		/>
		<LegendList
		data={data?.current?.availablePackages || []}
		renderItem={({ item }) => (
			<View>
				<Text>{item.product.title}</Text>
				<Text>{item.product.description}</Text>
				<Button onPress={() => handleUpgrade(item)}>Upgrade</Button>
			</View>
		)}
		/>
	</>
	)
};

export default UpgradeScreen;