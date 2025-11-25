import { Text, TextProps } from "@/components/ui/text";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaMovie } from "@recomendapp/types";
import { upperFirst } from "lodash";
import { forwardRef, Fragment, ReactNode, useMemo } from "react";
import { useFormatter, useTranslations } from "use-intl";

interface MovieHeaderInfoProps extends Omit<TextProps, 'children'> {
  movie: MediaMovie;
};

export const MovieHeaderInfo = forwardRef<
  React.ComponentRef<typeof Text>,
  MovieHeaderInfoProps
>(({ movie, ...props }, ref) => {
  const formatter = useFormatter();
  const t = useTranslations();
  const { colors } = useTheme();

  const items = useMemo((): (string | ReactNode)[] => {
    const result: (string | ReactNode)[] = [];
    // Date
    if (movie.release_date) {
      result.push(new Date(movie.release_date).getFullYear());
    }
    // Runtime
    if (movie.runtime) {
      const hours = Math.floor(movie.runtime / 60);
      const minutes = movie.runtime % 60;
      const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;
      result.push(`${hours}h${minutesFormatted}`);
    }
    // Genres
    if (movie.genres?.length) {
      result.push(formatter.list(movie.genres.map((g) => g.name), { style: 'narrow', type: 'conjunction' }));
    }
    return result;
  }, [movie, formatter]);

  return (
    <Text ref={ref} {...props}>
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
});
MovieHeaderInfo.displayName = "MovieHeaderInfo";