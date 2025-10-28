import { Text } from "@/components/ui/text";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaTvSeries } from "@recomendapp/types";
import { upperFirst } from "lodash";
import { Fragment, ReactNode, useMemo } from "react";
import { useFormatter, useTranslations } from "use-intl";

type TvSeriesHeaderInfoProps = {
  tvSeries: MediaTvSeries;
};

export const TvSeriesHeaderInfo = ({ tvSeries }: TvSeriesHeaderInfoProps) => {
  const formatter = useFormatter();
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
      result.push(formatter.list(tvSeries.genres.map((g) => g.name), { style: 'narrow', type: 'conjunction' }));
    }
    return result;
  }, [tvSeries, formatter]);

  return (
    <Text>
      <Text style={{ color: colors.accentYellow }}>
        {upperFirst(t("common.messages.film", { count: 1 }))}
      </Text>
      {items.length > 0 && " | "}
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && " • "}
          {item}
        </Fragment>
      ))}
    </Text>
  );
};