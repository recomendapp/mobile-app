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
} from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
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

const AnimatedIndicator = Animated.createAnimatedComponent(ActivityIndicator);
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const TabBarHeight = 48;
const HeaderHeight = 300;
const SafeStatusBar = Platform.select({
  ios: 44,
  android: StatusBar.currentHeight,
});
const tab1ItemSize = (windowWidth - 30) / 2;
const tab2ItemSize = (windowWidth - 40) / 3;
const PullToRefreshDist = 150;

const App = () => {
  const [tabIndex, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'tab1', title: 'Tab1' },
    { key: 'tab2', title: 'Tab2' },
  ]);
  const [canScroll, setCanScroll] = useState(true);
  const [tab1Data] = useState(Array(40).fill(0));
  const [tab2Data] = useState(Array(30).fill(0));

  const scrollY = useSharedValue(0);
  const headerScrollY = useSharedValue(0);
  const headerMoveScrollY = useSharedValue(0);

  // Refs
  const listRefArr = useRef(new Map()) // Use Map instead of array for better key management
  const listOffset = useRef({});
  const isListGliding = useRef(false);
  const headerScrollStart = useRef(0);
  const _tabIndex = useRef(0);
  const refreshStatusRef = useRef(false);

  // Animated refs for each tab
  const tab1Ref = useAnimatedRef();
  const tab2Ref = useAnimatedRef();

  // Initialize refs for each route
  useEffect(() => {
    listRefArr.current.set('tab1', {
      key: 'tab1',
      value: {
        scrollToOffset: (options) => tab1Ref.current?.scrollToOffset(options),
      },
    });
    listRefArr.current.set('tab2', {
      key: 'tab2',
      value: {
        scrollToOffset: (options) => tab2Ref.current?.scrollToOffset(options),
      },
    });
  }, []); // Empty dependency array since this only needs to run once

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
    onBeginDrag: () => {
      'worklet';
      isListGliding.current = true;
    },
    onEndDrag: (event) => {
      'worklet';
      runOnJS(syncScrollOffset)();
      if (Platform.OS === 'ios' && event.contentOffset.y < -PullToRefreshDist && !refreshStatusRef.current) {
        runOnJS(startRefreshAction)();
      }
    },
    onMomentumEnd: () => {
      'worklet';
      isListGliding.current = false;
      runOnJS(syncScrollOffset)();
    },
  });

  const headerGesture = Gesture.Pan()
    .onBegin(() => {
      headerScrollStart.current = scrollY.value;
    })
    .onUpdate((event) => {
      const headerScrollOffset = -event.translationY + headerScrollStart.current;
      headerScrollY.value = headerScrollOffset;

      const curListRef = listRefArr.current.get(routes[_tabIndex.current].key);

      if (curListRef?.value) {
        if (headerScrollOffset > 0) {
          curListRef.value.scrollToOffset({
            offset: headerScrollOffset,
            animated: false,
          });
        } else {
          if (Platform.OS === 'ios') {
            curListRef.value.scrollToOffset({
              offset: headerScrollOffset / 3,
              animated: false,
            });
          } else if (!refreshStatusRef.current) {
            headerMoveScrollY.value = headerScrollOffset / 1.5;
          }
        }
      }
    })
    .onEnd(() => {
      runOnJS(handlePanReleaseOrEnd)();
    });

  const syncScrollOffset = () => {
    const curRouteKey = routes[_tabIndex.current].key;
    listRefArr.current.forEach((item, key) => {
      if (key !== curRouteKey) {
        if (scrollY.value < HeaderHeight && scrollY.value >= 0) {
          item.value?.scrollToOffset({
            offset: scrollY.value,
            animated: false,
          });
          listOffset.current[key] = scrollY.value;
        } else if (scrollY.value >= HeaderHeight) {
          if (
            listOffset.current[key] < HeaderHeight ||
            listOffset.current[key] == null
          ) {
            item.value?.scrollToOffset({
              offset: HeaderHeight,
              animated: false,
            });
            listOffset.current[key] = HeaderHeight;
          }
        }
      }
    });
  };

  const startRefreshAction = () => {
    if (Platform.OS === 'ios') {
      listRefArr.current.forEach((listRef) => {
        listRef.value.scrollToOffset({
          offset: -50,
          animated: true,
        });
      });
      refresh().finally(() => {
        syncScrollOffset();
        if (scrollY.value < 0) {
          listRefArr.current.forEach((listRef) => {
            listRef.value.scrollToOffset({
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
        if (scrollY.value < -PullToRefreshDist && !refreshStatusRef.current) {
          startRefreshAction();
        } else {
          listRefArr.current.forEach((listRef) => {
            listRef.value.scrollToOffset({
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

  const refresh = async () => {
    refreshStatusRef.current = true;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    refreshStatusRef.current = false;
  };

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: interpolate(
        scrollY.value,
        [0, HeaderHeight],
        [0, -HeaderHeight],
        Extrapolation.CLAMP
      ),
    }],
  }));

  const tabBarStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: interpolate(
        scrollY.value,
        [0, HeaderHeight],
        [HeaderHeight, 0],
        Extrapolation.CLAMP
      ),
    }],
  }));

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

  const renderHeader = () => (
    <GestureDetector gesture={headerGesture}>
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity
          style={{ flex: 1, justifyContent: 'center' }}
          activeOpacity={1}
          onPress={() => Alert.alert('header Clicked!')}
        >
          <Text>Pull to Refresh Header</Text>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );

  const renderScene = ({ route }) => {
    const focused = route.key === routes[tabIndex].key;
    let numCols, data, renderItem, listRef;
    switch (route.key) {
      case 'tab1':
        numCols = 2;
        data = tab1Data;
        renderItem = rednerTab1Item;
        listRef = tab1Ref;
        break;
      case 'tab2':
        numCols = 3;
        data = tab2Data;
        renderItem = rednerTab2Item;
        listRef = tab2Ref;
        break;
      default:
        return null;
    }

    return (
      <Animated.FlatList
        scrollEventThrottle={16}
        onScroll={focused ? scrollHandler : undefined}
        numColumns={numCols}
        ref={listRef}
        contentContainerStyle={{
          paddingTop: HeaderHeight + TabBarHeight,
          paddingHorizontal: 10,
          minHeight: windowHeight - SafeStatusBar + HeaderHeight,
        }}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={() => <View style={{ height: 10 }} />}
      />
    );
  };

  const renderTabBar = (props) => (
    <Animated.View
      style={[{
        top: 0,
        zIndex: 1,
        position: 'absolute',
        width: '100%',
      }, tabBarStyle]}
    >
      <TabBar
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

  const renderCustomRefresh = () => (
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

  return (
    <View style={styles.container}>
      <TabView
        onSwipeStart={() => setCanScroll(false)}
        onSwipeEnd={() => setCanScroll(true)}
        onIndexChange={(id) => {
          _tabIndex.current = id;
          setIndex(id);
        }}
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        initialLayout={{ height: 0, width: windowWidth }}
      />
      {renderHeader()}
      {renderCustomRefresh()}
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
  header: {
    height: HeaderHeight,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: '#FFA088',
  },
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