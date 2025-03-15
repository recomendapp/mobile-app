import React, { useCallback, useMemo, useState } from 'react';
import {
  Linking,
  SectionListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  FadingView,
  Header,
  LargeHeader,
  SectionListWithHeaders,
} from '@codeherence/react-native-header';
import type { ScrollHeaderProps, ScrollLargeHeaderProps } from '@codeherence/react-native-header';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
// import TwitterVerifiedSvg from '../../../assets/twitter-verified.svg';
// import type { TwitterProfileScreenNavigationProps } from '../../navigation';
import { Image } from 'expo-image';
import { useMediaMovieDetailsQuery, useMediaPlaylistsInfiniteQuery, useMediaReviewsInfiniteQuery } from '@/features/media/mediaQueries';
import { getIdFromSlug } from '@/hooks/getIdFromSlug';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
const AVATAR_SIZE_MAP: Record<AvatarSize, number> = {
	xs: 24,
	sm: 36,
	md: 64,
	lg: 96,
	xl: 128,
  };

// From reading comments online, the BlurView does not work properly for Android <= 11.
// We will have a boolean to check if we can use the BlurView.
// Note that Android 12 begins at SDK version 31
const canUseBlurView =
  Platform.OS === 'ios' || (Platform.OS === 'android' && Number(Platform.Version) >= 31);

const VERTICAL_SPACING = 12;
const ROOT_HORIZONTAL_PADDING = 12;
const TWITTER_PRIMARY_COLOR = '#1d9bf0';
const DISABLED_COLOR = 'rgba(255, 255, 255, 0.6)';
const AVATAR_SIZE = 'md';
const AVATAR_START_SCALE = 1;
const AVATAR_END_SCALE = 0.5;
const AVATAR_SIZE_VALUE = AVATAR_SIZE_MAP[AVATAR_SIZE];
const BANNER_BOTTOM_HEIGHT_ADDITION = AVATAR_SIZE_VALUE;

const HeaderComponent: React.FC<ScrollHeaderProps> = ({ showNavBar, scrollY }) => {
  const navigation = useNavigation();
  const { left, right } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const bannerHeight = useSharedValue(48 + BANNER_BOTTOM_HEIGHT_ADDITION);

  const blurStyle = useAnimatedStyle(() => {
    const blurOpacity = interpolate(Math.abs(scrollY.value), [0, 40], [0, 1], Extrapolate.CLAMP);

    return { opacity: blurOpacity };
  });

  const profileImageScale = useDerivedValue(() => {
    return interpolate(
      scrollY.value,
      [0, BANNER_BOTTOM_HEIGHT_ADDITION],
      [AVATAR_START_SCALE, AVATAR_END_SCALE],
      Extrapolate.CLAMP
    );
  });

  const bannerTranslationStyle = useAnimatedStyle(() => {
    const bannerTranslation = interpolate(
      scrollY.value,
      [0, BANNER_BOTTOM_HEIGHT_ADDITION],
      [0, -BANNER_BOTTOM_HEIGHT_ADDITION],
      Extrapolate.CLAMP
    );

    return { transform: [{ translateY: bannerTranslation }] };
  });

  // This allows the profile container to translate as the user scrolls.
  const profileContainerTranslationStyle = useAnimatedStyle(() => {
    const translateY = -scrollY.value + BANNER_BOTTOM_HEIGHT_ADDITION / 2;

    return { transform: [{ translateY }] };
  });

  // Once the profile image has been scaled down, we allow the profile container to be
  // hidden behind the banner. This is done by setting the zIndex to -1.
  const rootProfileRowZIndexStyle = useAnimatedStyle(() => {
    return { zIndex: profileImageScale.value <= AVATAR_END_SCALE ? -1 : 1 };
  });

  // Slow down the avatar's translation to allow it to scale down and
  // still stay at its position.
  const profileImageScaleStyle = useAnimatedStyle(() => {
    const profileImageTranslationY = interpolate(
      profileImageScale.value,
      [AVATAR_START_SCALE, AVATAR_END_SCALE],
      [0, AVATAR_SIZE_VALUE / 2],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale: profileImageScale.value }, { translateY: profileImageTranslationY }],
    };
  });

  const animatedScaleStyle = useAnimatedStyle(() => {
    const bannerHeightRatio = height / bannerHeight.value;

    const scaleY = interpolate(
      scrollY.value,
      [0, -(height + bannerHeight.value)],
      [1, bannerHeightRatio],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scaleY }, { scaleX: scaleY }],
    };
  }, [height]);

  return (
    <View
      // onLayout={(e) => {
      //   bannerHeight
      // }}
      style={styles.smallHeaderContainer}
    >
      <Animated.View style={[StyleSheet.absoluteFill, bannerTranslationStyle]}>
        <Animated.View
          onLayout={(e) => (bannerHeight.value = e.nativeEvent.layout.height)}
          style={animatedScaleStyle}
        >
          <View style={{ marginBottom: -BANNER_BOTTOM_HEIGHT_ADDITION }}>
            {canUseBlurView ? (
              <Animated.View style={[StyleSheet.absoluteFill, styles.blurView, blurStyle]}>
                <BlurView style={[StyleSheet.absoluteFill]} intensity={50} tint="dark" />
              </Animated.View>
            ) : (
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  styles.blurView,
                  styles.androidBlurViewBg,
                  blurStyle,
                ]}
              />
            )}

            <Image
              source={{ uri: 'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }}
              contentFit="cover"
              contentPosition="center"
              style={[
                styles.imageStyle,
                { width },
                Platform.OS === 'web' && { height: bannerHeight.value },
              ]}
            />
          </View>
        </Animated.View>
      </Animated.View>

      <Header
        showNavBar={showNavBar}
        headerCenterFadesIn={false}
        headerStyle={styles.headerStyle}
        noBottomBorder
        headerRight={
          <>
            <TouchableOpacity style={styles.backButtonContainer}>
              <Feather color="white" name="more-horizontal" size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButtonContainer}>
              <Feather color="white" name="search" size={18} />
            </TouchableOpacity>
          </>
        }
        headerRightStyle={[
          styles.headerRightStyle,
          { paddingLeft: Math.max(right, ROOT_HORIZONTAL_PADDING) },
        ]}
        headerLeft={
          <>
            <TouchableOpacity
              onPress={() => navigation.canGoBack() && navigation.goBack()}
              style={styles.backButtonContainer}
            >
              <Feather color="white" name={'arrow-left'} size={18} />
            </TouchableOpacity>
            {/* Fade the name + tweets on the left header once the navBar should be shown. */}
            <FadingView opacity={showNavBar}>
              <Text style={styles.navBarTitle}>Evan Younan</Text>
              <Text style={styles.disabledSmallText}>19.4k Tweets</Text>
            </FadingView>
          </>
        }
        headerLeftStyle={[
          styles.headerLeftStyle,
          { paddingLeft: Math.max(left, ROOT_HORIZONTAL_PADDING) },
        ]}
      />

      <Animated.View style={[styles.profileContainer, rootProfileRowZIndexStyle]}>
        <Animated.View
          style={[
            styles.profileFollowContainer,
            {
              left: Math.max(left, ROOT_HORIZONTAL_PADDING),
              right: Math.max(right, ROOT_HORIZONTAL_PADDING),
            },
            profileContainerTranslationStyle,
          ]}
        >
          <Animated.View style={profileImageScaleStyle}>
            <TouchableOpacity>
              {/* <Avatar size={AVATAR_SIZE} source={require('../../../assets/circle-pic.png')} /> */}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.pillButton}>
            <Text style={styles.followText}>Follow</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const LargeHeaderComponent: React.FC<ScrollLargeHeaderProps> = () => {
  const { left, right } = useSafeAreaInsets();

  const onPressLink = useCallback(async () => {
    try {
      const supported = await Linking.canOpenURL('https://codeherence.com');

      if (supported) {
        await Linking.openURL('https://codeherence.com');
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <LargeHeader
      headerStyle={[
        styles.largeHeaderStyle,
        {
          paddingLeft: Math.max(left, ROOT_HORIZONTAL_PADDING),
          paddingRight: Math.max(right, ROOT_HORIZONTAL_PADDING),
        },
      ]}
    >
      <View style={styles.profileHandleContainer}>
        <View style={styles.profileHeaderRow}>
          <Text style={styles.title}>Evan Younan</Text>
          {/* <Image
            source={require('../../../assets/twitter-verified.svg')}
            contentFit="contain"
            contentPosition="center"
            style={styles.twitterVerifiedIcon}
          /> */}
        </View>

        <Text style={styles.disabledText}>@e_younan</Text>
      </View>

      <Text style={styles.text}>
        Founder of <Text style={styles.primaryText}>@codeherence</Text> • Helping companies develop
        and enhance their React Native apps
      </Text>

      <View style={styles.dataRow}>
        <Feather name="calendar" color={DISABLED_COLOR} size={12} />
        <Text style={styles.disabledText}>Joined March 2023</Text>
      </View>

      <View style={styles.locationAndWebContainer}>
        <View style={styles.dataRow}>
          <Feather name="map-pin" color={DISABLED_COLOR} size={12} />
          <Text style={styles.disabledText}>Toronto, Ontario</Text>
        </View>

        <View style={styles.dataRow}>
          <Feather name="link" color={DISABLED_COLOR} size={12} />
          <Text onPress={onPressLink} style={styles.primaryText}>
            codeherence.com
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.dataRow}>
          <Text style={styles.mediumText}>186</Text>
          <Text style={styles.disabledText}>Following</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dataRow}>
          <Text style={styles.mediumText}>132.8M</Text>
          <Text style={styles.disabledText}>Followers</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.whoFollowsThemContainer}>
        <View style={styles.followerPreviewContainer}>
          {/* {[4, 5, 2].map((num, index) => {
            return (
              <Avatar
                key={`avatar-${num}`}
                size="sm"
                source={{ uri: `https://i.pravatar.cc/128?img=${num}` }}
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  top: 0,
                  zIndex: 3 - index,
                  position: index !== 0 ? 'absolute' : undefined,
                  left: (AVATAR_SIZE_MAP.sm / 1.5) * index,
                  borderWidth: 1,
                }}
              />
            );
          })} */}
        </View>

        <Text style={[styles.disabledText, styles.followerText]}>
          Followed by Jane, John Wick, Miley Cyrus, and 23 others
        </Text>
      </View>
    </LargeHeader>
  );
};

const SomeComponent: SectionListRenderItem<
  number,
  {
    data: number[];
  }
> = ({ index }) => {
  return (
    <View style={styles.children}>
      <Text style={styles.text}>{index}</Text>
    </View>
  );
};

const MemoizedComponent = React.memo(SomeComponent, () => true);
const TABS_DATA = {
	Tweets: Array.from({ length: 50 }, (_, i) => ({ id: i, content: `Tweet ${i + 1}` })),
	Replies: Array.from({ length: 30 }, (_, i) => ({ id: i, content: `Reply ${i + 1}` })),
	Media: Array.from({ length: 20 }, (_, i) => ({ id: i, content: `Media ${i + 1}` })),
	Likes: Array.from({ length: 40 }, (_, i) => ({ id: i, content: `Like ${i + 1}` })),
  };
  
  const TwitterProfile: React.FC<any> = () => {
	const { i18n, t } = useTranslation();
	const { film_id } = useLocalSearchParams();
	const { id: movieId} = getIdFromSlug(film_id as string);
	const {
		data: movie,
		isLoading,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: i18n.language,
	});
	const { bottom } = useSafeAreaInsets();
	const [activeTab, setActiveTab] = useState(0);
  
	// Liste des onglets
	const tabs = ['Tweets', 'Replies', 'Media'];
  
	// Données statiques pour Tweets
	const staticTweetsData = useMemo(() => [{ id: 1 }, { id: 2 }], []);
  
	// Query pour Replies (Playlists)
	const {
	  data: playlists,
	  isLoading: isPlaylistsLoading,
	  isFetching: isPlaylistsFetching,
	  fetchNextPage: fetchNextPlaylists,
	  hasNextPage: hasNextPlaylists,
	} = useMediaPlaylistsInfiniteQuery({
	  id: movie?.media_id,
	  filters: {
		sortBy: 'updated_at', // À adapter selon tes besoins
		sortOrder: 'asc',
		perPage: 20,
	  },
	});
  
	// Query pour Media (Reviews)
	const {
	  data: reviews,
	  isLoading: isReviewsLoading,
	  isFetching: isReviewsFetching,
	  fetchNextPage: fetchNextReviews,
	  hasNextPage: hasNextReviews,
	} = useMediaReviewsInfiniteQuery({
	  id: movie?.media_id,
	  filters: {
		sortBy: 'updated_at', // À adapter selon tes besoins
		sortOrder: 'asc',
		perPage: 10,
	  },
	});
  
	// Préparer les données pour SectionList en fonction de l'onglet actif
	const sections = useMemo(() => {
	  switch (activeTab) {
		case 0: // Tweets
		  return [{ title: 'Tweets', data: staticTweetsData }];
		case 1: // Replies (Playlists)
		  return [
			{
			  title: 'Replies',
			  data: playlists?.pages.flatMap((page) => page || []) || [],
			},
		  ];
		case 2: // Media (Reviews)
		  return [
			{
			  title: 'Media',
			  data: reviews?.pages.flatMap((page) => page || []) || [],
			},
		  ];
		default:
		  return [];
	  }
	}, [activeTab, staticTweetsData, playlists, reviews]);
  
	// Rendu personnalisé pour chaque élément
	const renderItem = useCallback(
	  ({ item, section }) => {
		switch (section.title) {
		  case 'Tweets':
			return (
			  <View style={styles.children}>
				<View style={styles.staticBox}>
				  <Text style={styles.text}>Static Box {item.id}</Text>
				</View>
			  </View>
			);
		  case 'Replies':
			return (
			  <View style={styles.children}>
				<Text style={styles.text}>Playlist: {item.title || 'Unnamed'}</Text>
			  </View>
			);
		  case 'Media':
			return (
			  <View style={styles.children}>
				<Text style={styles.text}>Review: {item.content || 'No content'}</Text>
			  </View>
			);
		  default:
			return null;
		}
	  },
	  []
	);
  
	// Gérer le chargement au bas de la liste pour la pagination
	const renderFooter = useCallback(() => {
	  if (activeTab === 1 && (isPlaylistsLoading || isPlaylistsFetching)) {
		return <ActivityIndicator size="small" color="#fff" />;
	  }
	  if (activeTab === 2 && (isReviewsLoading || isReviewsFetching)) {
		return <ActivityIndicator size="small" color="#fff" />;
	  }
	  return null;
	}, [
	  activeTab,
	  isPlaylistsLoading,
	  isPlaylistsFetching,
	  isReviewsLoading,
	  isReviewsFetching,
	]);
  
	// Charger la page suivante lors du scroll
	const onEndReached = useCallback(() => {
	  if (activeTab === 1 && hasNextPlaylists && !isPlaylistsFetching) {
		console.log('fetchNextPlaylists');
		fetchNextPlaylists();
	  }
	  if (activeTab === 2 && hasNextReviews && !isReviewsFetching) {
		console.log('fetchNextReviews');
		fetchNextReviews();
	  }
	}, [
	  activeTab,
	  hasNextPlaylists,
	  isPlaylistsFetching,
	  fetchNextPlaylists,
	  hasNextReviews,
	  isReviewsFetching,
	  fetchNextReviews,
	]);
  
	return (
	<SectionListWithHeaders
		HeaderComponent={HeaderComponent} // Ton composant d'en-tête
		LargeHeaderComponent={LargeHeaderComponent} // Ton grand en-tête
		sections={sections} // Données dynamiques basées sur l'onglet actif
		disableAutoFixScroll
		ignoreLeftSafeArea
		ignoreRightSafeArea
		headerFadeInThreshold={0.2}
		disableLargeHeaderFadeAnim
		style={styles.container}
		contentContainerStyle={[styles.contentContainer, { paddingBottom: bottom }]}
		containerStyle={styles.rootContainer}
		renderItem={renderItem} // Rendu personnalisé
		ListFooterComponent={renderFooter} // Indicateur de chargement
		onEndReached={onEndReached} // Pagination infinie
		onEndReachedThreshold={0.5} // Déclencher le chargement à 50% de la fin
		stickySectionHeadersEnabled
		renderSectionHeader={() => (
		<View style={styles.tabBarContainer}>
			{tabs.map((tab, index) => (
			<TouchableOpacity
				key={`option-${index}`}
				style={styles.tabButton}
				onPress={() => setActiveTab(index)}
			>
				<Text style={styles.tabText}>{tab}</Text>
				{activeTab === index && <View style={styles.blueUnderline} />}
			</TouchableOpacity>
			))}
		</View>
		)}
	/>
	);
  };

export default TwitterProfile;

const styles = StyleSheet.create({
  children: { marginTop: 16, paddingHorizontal: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  navBarTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  largeHeaderStyle: {
    flexDirection: 'column',
    gap: 12,
    marginTop: AVATAR_SIZE_VALUE / 2 + VERTICAL_SPACING + BANNER_BOTTOM_HEIGHT_ADDITION,
  },
  backButtonContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 100,
    padding: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerStyle: { backgroundColor: 'transparent' },
  smallHeaderContainer: { position: 'relative', zIndex: 1 },
  headerRightStyle: { gap: 6, paddingLeft: 12 },
  headerLeftStyle: { gap: 12, paddingLeft: 12 },
  blurView: { zIndex: 1 },
  imageStyle: { height: '100%' },
  container: { flex: 1, backgroundColor: '#000' },
  contentContainer: { backgroundColor: '#000', flexGrow: 1 },
  text: { color: '#fff' },
  primaryText: { color: TWITTER_PRIMARY_COLOR },
  mediumText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  rootContainer: { backgroundColor: '#000' },
  profileFollowContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  followText: { fontSize: 12, fontWeight: '600' },
  pillButton: {
    paddingVertical: 6,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
    borderRadius: 200,
  },
  disabledSmallText: { color: DISABLED_COLOR, fontSize: 12 },
  disabledText: { color: DISABLED_COLOR, fontSize: 14 },
  profileHeaderRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  profileContainer: { paddingHorizontal: 12 },
  profileHandleContainer: { gap: 4 },
  statsContainer: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  whoFollowsThemContainer: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  followerPreviewContainer: { position: 'relative', width: AVATAR_SIZE_MAP.sm * (7 / 3) },
  followerText: { flex: 1 },
  tabBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000' },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabText: { color: 'white', fontSize: 14, fontWeight: '600', paddingVertical: 12 },
  blueUnderline: {
    height: 2,
    width: '50%',
    backgroundColor: TWITTER_PRIMARY_COLOR,
    borderRadius: 4,
  },
  locationAndWebContainer: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  dataRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  androidBlurViewBg: { backgroundColor: 'rgba(0,0,0,0.5)' },
  twitterVerifiedIcon: { height: 18, width: 18 },
});
