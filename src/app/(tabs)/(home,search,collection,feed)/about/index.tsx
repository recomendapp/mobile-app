import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { Icons } from '@/constants/Icons';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { GAP, GAP_LG, GAP_XL, GAP_XS, PADDING_VERTICAL } from '@/theme/globals';
import { ExternalPathString, Link } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { useTranslations } from 'use-intl';

const AboutScreen = () => {
  const { colors, bottomOffset, tabBarHeight } = useTheme();
  const t = useTranslations('pages.about');

	const resources = useMemo<{ name: string; link: ExternalPathString }[]>(() => [
		{
			name: 'Eyecandy',
			link: 'https://eycndy.co',
		},
		{
			name: 'Are.na',
			link: 'https://www.are.na',
		},
		{
			name: 'Savee',
			link: 'https://savee.it',
		},
		{
			name: 'Flimgrab',
			link: 'https://film-grab.com/',
		},
		{
			name: 'Flim',
			link: 'https://flim.ai/',
		},
		{
			name: 'Directors Library',
			link: 'https://directorslibrary.com/',
		},
		{
			name: 'Shotdeck',
			link: 'https://shotdeck.com/',
		},
		{
			name: 'Kive',
			link: 'https://www.kive.ai',
		},
		{
			name: 'Mymind',
			link: 'https://mymind.com/',
		},
		{
			name: 'My 2000s TV',
			link: 'https://www.my00stv.com/',
		},
		{
			name: 'Art of the title',
			link: 'https://www.artofthetitle.com/',
		},
		{
			name: 'Short of the Week',
			link: 'https://www.shortoftheweek.com',
		},
		{
			name: 'Frame Set',
			link: 'https://frameset.app',
		},
		{
			name: 'Infomaniak',
			link: 'https://www.infomaniak.com',
		},
		{
			name: 'Pousse ta fonte',
			link: 'https://www.poussetafonte.com/',
		},
		{
			name: 'FontBrief',
			link: 'https://www.fontbrief.com',
		},
	], []);

  const sections = useMemo<{ title?: string; content: React.ReactNode }[]>(() => [
    {
      title: t('about.label'),
      content: (
        <View style={{ gap: GAP_LG }}>
          <Text>
            {t.rich('about.intro', {
              strong: (chunks) => <Text style={tw`font-semibold`}>{chunks}</Text>,
            })}
          </Text>
          <View style={[tw`items-center`, { gap: GAP_XS }]}>
            <Text>{t('about.slogan.1')}</Text>
            <Text>{t('about.slogan.2')}</Text>
            <Text>{t('about.slogan.3')}</Text>
            <Text>{t('about.slogan.4')}</Text>
          </View>
          <Text>{t('about.last')}</Text>
        </View>
      ),
    },
    {
      title: t('team.label'),
      content: (
        <View style={{ gap: GAP }}>
          <Text>{t('team.intro')}</Text>
          <View style={{ gap: GAP }}>
            <View style={[{ backgroundColor: colors.muted },tw`rounded-md p-4`]}>
              <Text style={tw`text-lg font-semibold`}>
                {t('team.members.loup.name')}
              </Text>
              <Text>{t('team.members.loup.description')}</Text>
            </View>
            <View style={[{ backgroundColor: colors.muted },tw`rounded-md p-4`]}>
              <Text style={tw`text-lg font-semibold`}>
                {t('team.members.yoann.name')}
              </Text>
              <Text>{t('team.members.yoann.description')}</Text>
            </View>
          </View>
          <Text>
            {t.rich('team.last', {
              link: (chunks) => (
                <Link
                href="https://discord.gg/z4fXr39xPr"
                target="_blank"
                style={{ color: colors.accentPink }}
                >
                  {chunks}
                </Link>
              ),
            })}
          </Text>
        </View>
      ),
    },
    {
      title: t('pricing.label'),
      content: (
        <View style={{ gap: GAP }}>
          <Text>{t('pricing.intro')}</Text>
          {/* <Pricing
            session={session}
            products={products}
            title={false}
            className="!p-0"
          /> */}
          <Text style={[tw`text-xs italic`, { color: colors.mutedForeground }]}>
            {t('pricing.subdescription')}
          </Text>
        </View>
      ),
    },
    {
      title: t('businessmodel.label'),
      content: (
        <View style={{ gap: GAP }}>
          <Text>{t('businessmodel.paragraph.1')}</Text>
          <Text>{t('businessmodel.paragraph.2')}</Text>
          <Text>{t('businessmodel.paragraph.3')}</Text>
        </View>
      ),
    },
    {
      title: t('roadmap.label'),
      content: (
        <View style={{ gap: GAP }}>
          <View style={[{ backgroundColor: colors.muted },tw`p-4 rounded-md`, tw`items-center`]}>
            <Text style={{ color: colors.mutedForeground }}>Coming soon...</Text>
          </View>
        </View>
      ),
    },
    {
      title: t('data.label'),
      content: (
        <View style={{ gap: GAP }}>
          <Text>
            {t.rich('data.paragraph.1', {
              link: (chunks) => (
                <Link
                href="https://www.themoviedb.org/"
                target="_blank"
                style={{ color: colors.accentPink }}
                >
                  {chunks}
                </Link>
              ),
            })}
          </Text>
        </View>
      ),
    },
    {
      title: t('resources.label'),
      content: (
        <View style={{ gap: GAP }}>
          <Text>{t('resources.intro')}</Text>
          <View style={{ gap: GAP_XS }}>
            {resources.map((resource, index) => (
              <Link
                key={index}
                href={resource.link}
                target="_blank"
                style={{ paddingLeft: GAP, color: colors.foreground }}
              >
                • <Text style={{ color: colors.accentPink }}>{resource.name}</Text>
              </Link>
            ))}
          </View>
        </View>
      ),
    },
    {
      title: t('contact-support.label'),
      content: (
        <View style={{ gap: GAP }}>
          <Text>
            {t.rich('contact-support.help-center', {
              link: (chunks) => (
                <Link
                href="https://help.recomend.app/"
                target="_blank"
                style={{ color: colors.accentPink }}
                >
                  {chunks}
                </Link>
              ),
            })}
          </Text>
          <Text>
            {t.rich('contact-support.technical-support', {
              email: (chunks) => (
                <Link
                href="mailto:help@recomend.app"
                style={{ color: colors.accentPink }}
                >
                  help@recomend.app
                </Link>
              ),
            })}
          </Text>
          <Text>
            {t.rich('contact-support.suggest-a-feature', {
              email: (chunks) => (
                <Link
                href="mailto:ideas@recomend.app"
                style={{ color: colors.accentPink }}
                >
                  ideas@recomend.app
                </Link>
              ),
            })}
          </Text>
          <Text>
            {t.rich('contact-support.contact-us', {
              email: (chunks) => (
                <Link
                href="mailto:hello@recomend.app"
                style={{ color: colors.accentPink }}
                >
                  hello@recomend.app
                </Link>
              ),
            })}
          </Text>
        </View>
      ),
    },
    {
      content: (
        <View style={{ gap: GAP, marginTop: GAP_LG }}>
          <Icons.Quote
            size={40}
            color={colors.muted}
            style={tw`absolute left-0 -top-6`}
          />
          <Text style={tw`italic text-center`}>
            {t('quote.quote')}
          </Text>
          <Text style={[tw`text-center`, { color: colors.accentYellow }]}>
            — {t('quote.author')}, {t('quote.date')}
          </Text>
          <Text style={[tw`text-xs italic`, { color: colors.mutedForeground }]}>
            {t('quote.subdescription')}
          </Text>
        </View>
      ),
    }
  ], [t, resources, colors.accentPink, colors.foreground, colors.muted, colors.mutedForeground, colors.accentYellow]);

  return (
    <ScrollView
    contentContainerStyle={{
      paddingBottom: bottomOffset + PADDING_VERTICAL,
      paddingTop: PADDING_VERTICAL,
      gap: GAP_XL,
      justifyContent: 'center',
      alignItems: 'center'
    }}
    scrollIndicatorInsets={{
      bottom: tabBarHeight
    }}
    >
      {sections.map((section, index) => (
        <View key={index} style={[tw`px-4 flex flex-col max-w-xl`, { gap: GAP }]}>
          {section.title && (
            <Text variant='title' style={[tw`text-center`, { color: colors.accentYellow }]}>
              {section.title}
            </Text>
          )}
          {section.content}
        </View>
      ))}

    </ScrollView>
  );
};

export default AboutScreen;