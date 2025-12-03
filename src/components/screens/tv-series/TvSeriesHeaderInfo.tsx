import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaTvSeries } from "@recomendapp/types";
import { upperFirst } from "lodash";
import { forwardRef, Fragment, ReactNode, useMemo } from "react";
import { ViewProps } from "react-native";
import { useTranslations } from "use-intl";

type TvSeriesHeaderInfoProps = Omit<ViewProps, 'children'> & {
  tvSeries: MediaTvSeries;
};

export const TvSeriesHeaderInfo = forwardRef<
  React.ComponentRef<typeof View>,
  TvSeriesHeaderInfoProps
>(({ tvSeries, style, ...props }, ref) => {
  const t = useTranslations();
  const { colors } = useTheme();
  
  const items = useMemo((): (string | ReactNode)[] => {
    const result: (string | ReactNode)[] = [];
    // Date
    if (tvSeries.first_air_date) {
      result.push(new Date(tvSeries.first_air_date).getFullYear());
    }
    // Genres
    if (tvSeries.genres?.length) {
      result.push(tvSeries.genres.at(0)!.name);
    }

    if (tvSeries.number_of_seasons) {
      result.push(upperFirst(t("common.messages.tv_season_count", { count: tvSeries.number_of_seasons })));
    }

    if (tvSeries.number_of_episodes) {
      result.push(upperFirst(t("common.messages.tv_episode_count", { count: tvSeries.number_of_episodes })));
    }
    return result;
  }, [tvSeries, t]);

  return (
    <View ref={ref} style={[tw`flex-row flex-wrap items-center justify-center`, style]} {...props}>
      <Text style={[tw`mr-1`, { color: colors.accentYellow }]}>
        {upperFirst(t("common.messages.film", { count: 1 }))}
      </Text>
      {items.length > 0 && <Text style={{ color: colors.mutedForeground }}> • </Text>}
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <Text style={{ color: colors.mutedForeground }}> • </Text>}
          <Text style={{ color: colors.mutedForeground }}>
            {item}
          </Text>
        </Fragment>
      ))}
    </View>
  );
});
TvSeriesHeaderInfo.displayName = "TvSeriesHeaderInfo";