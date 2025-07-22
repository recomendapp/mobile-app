import { useTheme } from '@/providers/ThemeProvider';
import { View, ViewStyle } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import tw from '@/lib/tw';

type Props = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  style?: ViewStyle;
};

export const ChartContainer = ({
  title,
  description,
  children,
  style,
}: Props) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          padding: 16,
          width: '100%', // Full container width
        },
        tw`rounded-lg`,
        style,
      ]}
    >
      {title && (
        <ThemedText style={[tw`text-lg font-semibold`, { marginBottom: 4 }]}>
          {title}
        </ThemedText>
      )}
      {description && (
        <ThemedText style={[{ color: colors.mutedForeground, marginBottom: 16 }]}>
          {description}
        </ThemedText>
      )}
      {children}
    </View>
  );
};
