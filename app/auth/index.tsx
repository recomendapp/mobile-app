import { Button } from "@/components/ui/Button";
import { Onboarding } from "@/components/ui/onboarding";
import { Text } from "@/components/ui/text";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { Href, Link, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const OnboardingPresets = {
  welcome: [
    {
      id: 'welcome',
      title: 'Welcome to Our App',
      description:
        'Discover amazing features and get started with your journey.',
      icon: <Text style={{ fontSize: 80 }}>👋</Text>,
    },
    {
      id: 'features',
      title: 'Powerful Features',
      description:
        'Experience cutting-edge functionality designed to make your life easier.',
      icon: <Text style={{ fontSize: 80 }}>⚡</Text>,
    },
    {
      id: 'personalize',
      title: 'Personalize Your Experience',
      description: 'Customize the app to match your preferences and workflow.',
      icon: <Text style={{ fontSize: 80 }}>🎨</Text>,
    },
    {
      id: 'ready',
      title: "You're All Set!",
      description:
        "Everything is ready. Let's start exploring what you can achieve.",
      icon: <Text style={{ fontSize: 80 }}>🚀</Text>,
    },
  ],
  features: [
    {
      id: 'organize',
      title: 'Stay Organized',
      description: 'Keep all your important information in one secure place.',
      icon: <Text style={{ fontSize: 80 }}>📋</Text>,
    },
    {
      id: 'collaborate',
      title: 'Collaborate Seamlessly',
      description: 'Work together with your team in real-time, anywhere.',
      icon: <Text style={{ fontSize: 80 }}>🤝</Text>,
    },
    {
      id: 'automate',
      title: 'Automate Your Workflow',
      description: 'Set up smart automations to save time and reduce errors.',
      icon: <Text style={{ fontSize: 80 }}>🤖</Text>,
    },
  ],
  security: [
    {
      id: 'secure',
      title: 'Your Data is Secure',
      description:
        'We use end-to-end encryption to keep your information safe.',
      icon: <Text style={{ fontSize: 80 }}>🔒</Text>,
    },
    {
      id: 'privacy',
      title: 'Privacy First',
      description: 'We never share your personal data with third parties.',
      icon: <Text style={{ fontSize: 80 }}>🛡️</Text>,
    },
    {
      id: 'control',
      title: "You're in Control",
      description: 'Manage your privacy settings and data preferences anytime.',
      icon: <Text style={{ fontSize: 80 }}>⚙️</Text>,
    },
  ],
};

const AuthScreen = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const { inset } = useTheme();
	const routes = useMemo<{
		label: string;
		href: Href;
	}[]>(() => ([
		{
			label: 'login',
			href: '/auth/login',
		},
		{
			label: 'signup',
			href: '/auth/signup',
		},
	]), []);

	return (
    <Onboarding
      onComplete={() => {}}
	  onCancel={router.canGoBack() ? router.back : () => router.replace('/')}
      steps={OnboardingPresets.welcome}
      showSkip={false}
	  showNavigation={false}
	  footer={
		<ThemedSafeAreaView style={tw`flex-row justify-between items-center gap-2 px-4`}>
			<Link href="/auth/signup" asChild>
				<Button variant="accent-yellow" style={{ flex: 1 }} textStyle={tw`font-semibold`}>
					{upperFirst(t('common.word.signup'))}
				</Button>
			</Link>
			<Link href="/auth/login" asChild>
				<Button variant="default" style={{ flex: 1 }} textStyle={tw`font-semibold`}>
					{upperFirst(t('common.word.login'))}
				</Button>
			</Link>
		</ThemedSafeAreaView>
	  }
    />
  	);
};

export default AuthScreen;