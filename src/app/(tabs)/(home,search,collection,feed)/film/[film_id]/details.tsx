import { useMediaMovieCreditsQuery } from "@/api/medias/mediaQueries";
import { CardPerson } from "@/components/cards/CardPerson";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { DEPARTMENT_ORDER, JOB_ORDER } from "@/constants/creditsOrder";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useMemo } from "react";
import { useTranslations } from "use-intl";

const FilmDetailsScreen = () => {
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId } = getIdFromSlug(film_id);
	const t = useTranslations();
	const { colors, bottomOffset, tabBarHeight } = useTheme();

	const {
		data,
		isLoading,
	} = useMediaMovieCreditsQuery({
		movieId: movieId,
	});
	const loading = data === undefined || isLoading;
	const credits = useMemo(() => {
		if (!data) return [];

		const map = data.reduce((acc, item) => {
			const { department, job, person } = item;

			if (!acc[department]) acc[department] = {};
			if (!acc[department][job]) acc[department][job] = [];

			acc[department][job].push(person);
			return acc;
		}, {} as Record<string, Record<string, typeof data[0]['person'][]>>);

		return Object.entries(map)
			.sort(([deptA], [deptB]) => {
				const a = DEPARTMENT_ORDER[deptA] ?? 999;
				const b = DEPARTMENT_ORDER[deptB] ?? 999;
				return a - b;
			})
			.map(([department, jobs]) => ({
			department,
			jobs: Object.entries(jobs)
				.sort(([jobA], [jobB]) => {
					const a = JOB_ORDER[jobA] ?? 999;
					const b = JOB_ORDER[jobB] ?? 999;
					return a - b;
				})
				.map(([job, persons]) => ({
					job,
					persons,
				})),
			}));
	}, [data]);
	const flatCredits = useMemo(() => {
		if (!credits) return [];

		type FlatItem =
			| { type: "department"; department: string }
			| { type: "job"; department: string; job: string }
			| { type: "person"; department: string; job: string; person: typeof credits[0]["jobs"][0]["persons"][0] };

		const out: FlatItem[] = [];

		credits.forEach(({ department, jobs }) => {
			out.push({ type: "department", department });
			jobs.forEach(({ job, persons }) => {
			out.push({ type: "job", department, job });
			persons.forEach((person) => {
				out.push({ type: "person", department, job, person });
			});
			});
		});

		return out;
	}, [credits]);
	const stickyHeaderIndices = useMemo(() => (
		flatCredits
			.map((item, index) => (item.type === "department" ? index : null))
			.filter((x): x is number => x !== null)
	), [flatCredits]);

	const renderItem = useCallback(({ item, index }: { item: typeof flatCredits[number], index: number }) => {
		switch (item.type) {
			case 'department':
				return (
				<Text style={[tw`text-2xl font-bold`, { backgroundColor: colors.muted, paddingHorizontal: PADDING_HORIZONTAL }]}>
					{item.department}
				</Text>
				);
			case 'job':
				return (
				<Text textColor="muted" style={[tw`font-semibold`, { paddingHorizontal: PADDING_HORIZONTAL }]}>
					{item.job}
				</Text>
				);
			case 'person':
				return (
				<CardPerson
					variant="list"
					person={item.person}
					hideKnownForDepartment
					style={{ marginHorizontal: PADDING_HORIZONTAL, marginBottom: GAP }}
				/>
				);
			default:
				return null;
		}
	}, [colors.muted]);
	const getItemType = useCallback((item: typeof flatCredits[number]) => {
		if (typeof item === "string") return "department";
		if (item.type === "job") return "job";
		return "person";
	}, []);


	return (
	<>
		<FlashList
		data={flatCredits}
		stickyHeaderIndices={stickyHeaderIndices}
		renderItem={renderItem}
		getItemType={getItemType}
		keyExtractor={useCallback((item: typeof flatCredits[number]) => {
			if (item.type === "department") return `department-${item.department}`;
			if (item.type === "job") return `job-${item.department}-${item.job}`;
			return `person-${item.department}-${item.job}-${item.person.id}`;
		}, [])}
		contentContainerStyle={{
			paddingBottom: bottomOffset + PADDING_VERTICAL
		}}
		scrollIndicatorInsets={{
			bottom: tabBarHeight,
		}}
		ListEmptyComponent={
			loading ? <Icons.Loader />
			: (
				<View style={tw`flex-1 items-center justify-center p-4`}>
					<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
						{upperFirst(t('common.messages.no_results'))}
					</Text>
				</View>
			)
		}
		/>
	</>
	)
};

export default FilmDetailsScreen;