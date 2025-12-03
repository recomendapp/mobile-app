import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaMovie } from "@recomendapp/types";
import { upperFirst } from "lodash";
import { forwardRef, Fragment, ReactNode, useMemo } from "react";
import { ViewProps } from "react-native";
import { useTranslations } from "use-intl";

interface MovieHeaderInfoProps extends Omit<ViewProps, 'children'> {
  movie: MediaMovie;
};

export const MovieHeaderInfo = forwardRef<
  React.ComponentRef<typeof View>,
  MovieHeaderInfoProps
>(({ movie, style, ...props }, ref) => {
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
      result.push(movie.genres.at(0)!.name);
    }
    return result;
  }, [movie]);

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
MovieHeaderInfo.displayName = "MovieHeaderInfo";