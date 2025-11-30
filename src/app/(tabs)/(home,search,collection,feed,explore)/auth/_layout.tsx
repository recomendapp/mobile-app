import { useUIBackgroundsOptions } from "@/api/options";
import { CustomStack } from "@/components/CustomStack";
import { LoopCarousel } from "@/components/ui/LoopCarousel";
import { View } from "@/components/ui/view";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { HeaderStyleInterpolators } from "@react-navigation/stack";
import { useQuery } from "@tanstack/react-query";
import Color from "color";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { upperFirst } from "lodash";
import Animated from "react-native-reanimated";
import { useTranslations } from "use-intl";


const AuthLayout = () => {
  const t = useTranslations();
  const { colors } = useTheme();

  const {
    data,
  } = useQuery(useUIBackgroundsOptions());

  const bgColor = Color(colors.background).rgb().object();
  
  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <Animated.View style={tw`absolute inset-0`}>
        {data && (
          <LoopCarousel
          items={data}
          containerStyle={tw`flex-1`}
          renderItem={(item) => (
            <Image source={item.localUri} contentFit="cover" style={tw`absolute inset-0`} />
          )}
          />
        )}
        <LinearGradient
          style={tw`absolute inset-0`}
          colors={[
            `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.3)`,
            `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.4)`,
            `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.5)`,
            `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.6)`,
            `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.6)`,
            `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.8)`,
            `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 1)`,
          ]}
        />
      </Animated.View>

      <CustomStack
        initialRouteName="index"
        screenOptions={{
          animation: 'slide_from_right',
          headerTintColor: colors.foreground,
          headerStyle: {
            backgroundColor: 'transparent',
            height: 56,
          },
          headerStatusBarHeight: 0,
          headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
          cardStyle: {
            backgroundColor: 'transparent',
          },
          cardStyleInterpolator: ({ current, next, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                  ...(next ? [{
                    translateX: next.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -layouts.screen.width],
                    }),
                  }] : []),
                ],
              },
              overlayStyle: {
                opacity: 0,
              },
            };
          },
          
        }}
      >
        <CustomStack.Screen name="index" options={{ title: upperFirst(t('common.messages.welcome')) }} />
        <CustomStack.Screen name="login/index" options={{ headerTitle: upperFirst(t('common.messages.login')) }} />
        <CustomStack.Screen name="login/otp" options={{ headerTitle: upperFirst(t('common.messages.otp')) }} />
        <CustomStack.Screen name="signup" options={{ headerTitle: upperFirst(t('common.messages.signup')) }} />
        <CustomStack.Screen name="forgot-password" options={{ headerTitle: upperFirst(t('pages.auth.forgot_password.label')) }} />
        {/* CALLBACKs */}
        <CustomStack.Screen name="callback" options={{ headerShown: false }} />
        <CustomStack.Screen name="reset-password" options={{ headerShown: false }} />
      </CustomStack>

      {/* Attribution (optionnel) */}
      {/* <View style={{ paddingHorizontal: PADDING_HORIZONTAL, position: 'absolute', bottom: 20, left: 0, right: 0 }}>
        {activeDetails && (
          <Animated.Text key={active.id} entering={FadeIn} exiting={FadeOut} style={[tw`text-center`, { color: colors.mutedForeground }]}>
            {t.rich('common.messages.artwork_from', {
              source: activeDetails.title!,
              important: (chunk) => <Text textColor='default' style={tw`font-semibold`}>{chunk}</Text>
            })}
          </Animated.Text>
        )}
      </View> */}
    </View>
  );
};

export default AuthLayout;