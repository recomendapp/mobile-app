import { Pager } from "@/components/pager/Pager"
import { TabBar } from "@/components/pager/TabBar"
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useCallback, useMemo, useState } from "react"
import { ScrollView } from "react-native";

let lastActiveTab = 0

const TestScreen = () => {
	const [isLoadingAll, setIsLoadingAll] = useState(false)
	const [isLoadingMentions, setIsLoadingMentions] = useState(false)
	const initialActiveTab = lastActiveTab
	const [activeTab, setActiveTab] = useState(initialActiveTab)
	const isLoading = activeTab === 0 ? isLoadingAll : isLoadingMentions
	const onPageSelected = useCallback(
		(index: number) => {
		setActiveTab(index)
		lastActiveTab = index
		},
		[setActiveTab],
	);
	const sections = useMemo(() => {
		return [
		{
			title: 'Tab 1',
			component: (
			<ScrollView>
				{Array.from({ length: 100 }).map((_, i) => (
				<View key={i} style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
					<Text>Item {i + 1}</Text>
				</View>
				))}
			</ScrollView>
			),
		},
		{
			title: 'Tab 2',
			component: (
			<ScrollView>
				{Array.from({ length: 50 }).map((_, i) => (
				<View key={i} style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
					<Text>Another Item {i + 1}</Text>
				</View>
				))}
			</ScrollView>
			),
		},
		]
	}, [
		activeTab,
		isLoadingAll,
		isLoadingMentions,
	])
	return (
		<Pager
        onPageSelected={onPageSelected}
        renderTabBar={props => (
        //   <Layout.Center style={[a., web([a.sticky, {top: 0}])]}>
            <TabBar
              {...props}
              items={sections.map(section => section.title)}
            //   onPressSelected={() => emitSoftReset()}
            />
        //   </Layout.Center>
        )}
        initialPage={initialActiveTab}>
        {sections.map((section, i) => (
          <View key={i}>{section.component}</View>
        ))}
      	</Pager>
	)
};

export default TestScreen