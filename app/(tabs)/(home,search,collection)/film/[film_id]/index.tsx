import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Platform,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { TabView, TabBar as TabBarView } from 'react-native-tab-view';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
  runOnJS,
  useAnimatedRef,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import FilmHeader from '@/components/screens/film/FilmHeader';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { getIdFromSlug } from '@/hooks/getIdFromSlug';
import { useMediaMovieDetailsQuery } from '@/features/media/mediaQueries';
import FilmHeaderOverlay from '@/components/screens/film/FilmHeaderOverlay';

const AnimatedIndicator = Animated.createAnimatedComponent(ActivityIndicator);
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const TabBarHeight = 48;
// const headerHeight = 300;
const SafeStatusBar = Platform.select({
  ios: 44,
  android: StatusBar.currentHeight,
});
const tab1ItemSize = (windowWidth - 30) / 2;
const tab2ItemSize = (windowWidth - 40) / 3;
const PullToRefreshDist = 150;

const App = () => {
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
  const loading = isLoading || movie === undefined;
  const [tabIndex, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'tab1', title: 'Tab1' },
    { key: 'tab2', title: 'Tab2' },
  ]);
  const [canScroll, setCanScroll] = useState(true);
  const [tab1Data] = useState(Array(40).fill(0));
  const [tab2Data] = useState(Array(30).fill(0));

  const headerHeight = useSharedValue(300);
  const headerOverlayHeight = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const headerScrollY = useSharedValue(0);
  const headerMoveScrollY = useSharedValue(0);

  // Refs
  const listRefArr = useRef<Map<string, { key: string, value: FlatList<number> | null | null }>>(
    new Map(routes.map((route) => [route.key, { key: route.key, value: null }]))
  );
  const listOffset = useRef({});
  const isListGliding = useRef(false);
  const headerScrollStart = useSharedValue(0);
  const _tabIndex = useSharedValue(0);
  const refreshStatus = useSharedValue(false);

  const syncScrollOffset = () => {
    const curRouteKey = routes[_tabIndex.value].key;
    listRefArr.current.forEach((item, key) => {
      if (key !== curRouteKey) {
        if (scrollY.value < headerHeight.value && scrollY.value >= 0) {
          item.value?.scrollToOffset({
            offset: scrollY.value,
            animated: false,
          });
          listOffset.current[key] = scrollY.value;
        } else if (scrollY.value >= headerHeight.value) {
          if (
            listOffset.current[key] < headerHeight.value ||
            listOffset.current[key] == null
          ) {
            item.value?.scrollToOffset({
              offset: headerHeight.value,
              animated: false,
            });
            listOffset.current[key] = headerHeight.value;
          }
        }
      }
    });
  };

  const startRefreshAction = () => {
    if (Platform.OS === 'ios') {
      listRefArr.current.forEach((listRef) => {
        listRef.value?.scrollToOffset({
          offset: -50,
          animated: true,
        });
      });
      refresh().finally(() => {
        syncScrollOffset();
        if (scrollY.value < 0) {
          listRefArr.current.forEach((listRef) => {
            listRef.value?.scrollToOffset({
              offset: 0,
              animated: true,
            });
          });
        }
      });
    } else {
      headerMoveScrollY.value = withTiming(-150, { duration: 300 });
      refresh().finally(() => {
        headerMoveScrollY.value = withTiming(0, { duration: 300 });
      });
    }
  };

  const handlePanReleaseOrEnd = () => {
    syncScrollOffset();
    headerScrollY.value = scrollY.value;

    if (Platform.OS === 'ios') {
      if (scrollY.value < 0) {
        if (scrollY.value < -PullToRefreshDist && !refreshStatus.value) {
          startRefreshAction();
        } else {
          listRefArr.current.forEach((listRef) => {
            listRef.value?.scrollToOffset({
              offset: 0,
              animated: true,
            });
          });
        }
      }
    } else if (Platform.OS === 'android') {
      if (
        headerMoveScrollY.value < 0 &&
        headerMoveScrollY.value / 1.5 < -PullToRefreshDist
      ) {
        startRefreshAction();
      } else {
        headerMoveScrollY.value = withTiming(0, { duration: 300 });
      }
    }
  };

  const handleHeaderOffset = (headerScrollOffset: number) => {
    const curListRef = listRefArr.current.get(routes[_tabIndex.value].key);

    if (curListRef?.value) {
      if (headerScrollOffset > 0) {
        console.log('scroll');
        curListRef.value.scrollToOffset({
          offset: headerScrollOffset,
          animated: false,
        });
      } else {
        if (Platform.OS === 'ios') {
          console.log('pull to refresh ios', headerScrollOffset);
          curListRef.value.scrollToOffset({
            offset: headerScrollOffset / 3,
            animated: false,
          });
        } else if (Platform.OS === 'android') {
          console.log('pull to refresh  android');
          if (!refreshStatus.value) {
           headerMoveScrollY.value = headerScrollY.value / 1.5;
          }
        }
      }
    }
  }

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
    onBeginDrag: () => {
      isListGliding.current = true;
    },
    onEndDrag: (event) => {
      runOnJS(syncScrollOffset)();
      if (Platform.OS === 'ios' && event.contentOffset.y < -PullToRefreshDist && !refreshStatus.value) {
        runOnJS(startRefreshAction)();
      }
    },
    onMomentumEnd: () => {
      isListGliding.current = false;
      runOnJS(syncScrollOffset)();
    },
  });

  const headerGesture = Gesture.Pan()
    .onBegin(() => {
      headerScrollStart.value = scrollY.value;
    })
    .onUpdate((event) => {
      const headerScrollOffset = -event.translationY + headerScrollStart.value;
      // headerScroll.value = -event.translationY + headerScrollStart.value;
      runOnJS(handleHeaderOffset)(headerScrollOffset);
    })
    .onEnd(() => {
      runOnJS(handlePanReleaseOrEnd)();
    });

  const refresh = async () => {
    refreshStatus.value = true;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    refreshStatus.value = false;
  };

  const Header = () => {
    const headerAnimStyle = useAnimatedStyle(() => ({
      transform: [{
        translateY: interpolate(
          scrollY.value,
          [0, headerHeight.value],
          [0, -headerHeight.value],
          Extrapolation.CLAMP
        ),
      }],
    }));
    return (
      // <GestureDetector gesture={headerGesture}>
        <Animated.View
        style={[
          {
            height: headerHeight.value,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            backgroundColor: '#FFA088',
          },
          headerAnimStyle
        ]}
        >
          <TouchableOpacity
            style={{ flex: 1, justifyContent: 'center' }}
            activeOpacity={1}
            onPress={() => Alert.alert('header Clicked!')}
          >
            <Text>Pull to Refresh Header</Text>
          </TouchableOpacity>
        </Animated.View>
      // </GestureDetector>
    );
  }

  const renderScene = ({ route }) => {
    const focused = route.key === routes[tabIndex].key;
    let numCols, data, renderItem, listRef;
    switch (route.key) {
      case 'tab1':
        numCols = 2;
        data = tab1Data;
        renderItem = rednerTab1Item;
        // listRef = tab1Ref;
        break;
      case 'tab2':
        numCols = 3;
        data = tab2Data;
        renderItem = rednerTab2Item;
        // listRef = tab2Ref;
        break;
      default:
        return null;
    }

    return (
      <Animated.FlatList
        scrollEventThrottle={16}
        numColumns={numCols}
        ref={(ref) => {
          listRefArr.current.set(route.key, {
            key: route.key,
            value: ref,
          });
        }}
        onScroll={focused ? scrollHandler : undefined}
        contentContainerStyle={{
          paddingTop: headerHeight.value + TabBarHeight,
          paddingHorizontal: 10,
          minHeight: windowHeight - SafeStatusBar + headerHeight.value,
        }}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={() => <View style={{ height: 10 }} />}
      />
    );
  };

  const TabBar = (props) => {
    const tabBarAnimStyle = useAnimatedStyle(() => ({
      transform: [{
        translateY: interpolate(
          scrollY.value,
          [0, headerHeight.value],
          [headerHeight.value, 0],
          Extrapolation.CLAMP
        ),
      }],
    }));

    return (
    <Animated.View
      style={[
        {
          top: 0,
          zIndex: 1,
          position: 'absolute',
          width: '100%',
        },
        tabBarAnimStyle
      ]}
    >
      <TabBarView as TabBarView
        {...props}
        onTabPress={({ route, preventDefault }) => {
          if (isListGliding.current) preventDefault();
        }}
        style={styles.tab}
        renderLabel={renderLabel}
        indicatorStyle={styles.indicator}
      />
    </Animated.View>
    );
  }

  const CustomRefresh = () => {
    const refreshStyle = useAnimatedStyle(() => {
      return Platform.OS === 'ios'
        ? {
            transform: [{
              translateY: interpolate(
                scrollY.value,
                [-100, 0],
                [120, 0],
                Extrapolation.CLAMP
              ),
            }],
          }
        : {
            transform: [{
              translateY: interpolate(
                headerMoveScrollY.value,
                [-300, 0],
                [150, 0],
                Extrapolation.CLAMP
              ),
            }],
          };
    });
    return (
    <Animated.View
      style={[
        {
          top: -50,
          position: 'absolute',
          alignSelf: 'center',
        },
        Platform.OS === 'android' && {
          backgroundColor: '#eee',
          height: 38,
          width: 38,
          borderRadius: 19,
          borderWidth: 2,
          borderColor: '#ddd',
          justifyContent: 'center',
          alignItems: 'center',
        },
        refreshStyle,
      ]}
    >
      <ActivityIndicator animating />
    </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <TabView
        onSwipeStart={() => setCanScroll(false)}
        onSwipeEnd={() => setCanScroll(true)}
        onIndexChange={(id) => {
          _tabIndex.value = id;
          setIndex(id);
        }}
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        renderTabBar={(props) => null}
        // renderTabBar={(props) => <TabBar {...props} />}
        initialLayout={{ height: 0, width: windowWidth }}
      />
      {/* <Header /> */}
      <FilmHeaderOverlay
      filmHeaderHeight={headerHeight}
      headerHeight={headerOverlayHeight}
      onHeaderHeight={(height) => {
        'worklet';
        headerOverlayHeight.value = height;
      }}
      sv={scrollY}
      title={movie?.title ?? ''}
      />
      <GestureDetector gesture={headerGesture}>
        <FilmHeader
        filmHeaderHeight={headerHeight}
        onHeaderHeight={(height) => {
          'worklet';
          headerHeight.value = height;
        }}
        headerHeight={headerOverlayHeight}
        sv={scrollY}
        movie={movie}
        loading={loading}
        pullToRefreshDist={PullToRefreshDist}
        />
      </GestureDetector>
      <CustomRefresh />
    </View>
  );
};

const rednerTab1Item = ({ item, index }) => {
  return (
    <View
      style={{
        borderRadius: 16,
        marginLeft: index % 2 === 0 ? 0 : 10,
        width: tab1ItemSize,
        height: tab1ItemSize,
        backgroundColor: '#aaa',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text>{index}</Text>
    </View>
  );
};

const rednerTab2Item = ({ item, index }) => {
  return (
    <View
      style={{
        marginLeft: index % 3 === 0 ? 0 : 10,
        borderRadius: 16,
        width: tab2ItemSize,
        height: tab2ItemSize,
        backgroundColor: '#aaa',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text>{index}</Text>
    </View>
  );
};

const renderLabel = ({ route, focused }) => {
  return (
    <Text style={[styles.label, { opacity: focused ? 1 : 0.5 }]}>
      {route.title}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // header: {
  //   height: headerHeight.value,
  //   width: '100%',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   position: 'absolute',
  //   backgroundColor: '#FFA088',
  // },
  label: { fontSize: 16, color: '#222' },
  tab: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#FFCC80',
    height: TabBarHeight,
  },
  indicator: { backgroundColor: '#222' },
});

export default App;