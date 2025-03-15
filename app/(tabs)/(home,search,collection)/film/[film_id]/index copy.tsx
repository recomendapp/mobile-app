import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  PanResponder,
  Platform,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  useAnimatedValue,
} from 'react-native';
import Animated, { cancelAnimation, interpolate, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDecay, withTiming } from 'react-native-reanimated';
import {TabView, TabBar} from 'react-native-tab-view';

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
  /**
   * stats
   */
  const [tabIndex, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'tab1', title: 'Tab1'},
    {key: 'tab2', title: 'Tab2'},
  ]);
  const [canScroll, setCanScroll] = useState(true);
  const [tab1Data] = useState(Array(40).fill(0));
  const [tab2Data] = useState(Array(30).fill(0));

  /**
   * ref
   */
  // const scrollY = useRef(new Animated.Value(0)).current;
  const scrollY = useSharedValue(0);
  // const headerScrollY = useRef(new Animated.Value(0)).current;
  const headerScrollY = useSharedValue(0);
  // for capturing header scroll on Android
  // const headerMoveScrollY = useRef(new Animated.Value(0)).current;
  const headerMoveScrollY = useSharedValue(0);
  const listRefArr = useRef([]);
  const listOffset = useRef({});
  const isListGliding = useRef(false);
  const headerScrollStart = useRef(0);
  const _tabIndex = useRef(0);
  const refreshStatusRef = useRef(false);

  /**
   * PanResponder for header
   */
  const headerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // headerScrollY.stopAnimation();
        cancelAnimation(headerScrollY);
        syncScrollOffset();
        return false;
      },

      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // headerScrollY.stopAnimation();
        cancelAnimation(headerScrollY);
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderEnd: (evt, gestureState) => {
        handlePanReleaseOrEnd(evt, gestureState);
      },
      onPanResponderMove: (evt, gestureState) => {
        const curListRef = listRefArr.current.find(
          (ref) => ref.key === routes[_tabIndex.current].key,
        );
        const headerScrollOffset = -gestureState.dy + headerScrollStart.current;
        if (curListRef.value) {
          // scroll up
          if (headerScrollOffset > 0) {
            curListRef.value.scrollToOffset({
              offset: headerScrollOffset,
              animated: false,
            });
            // start pull down
          } else {
            if (Platform.OS === 'ios') {
              curListRef.value.scrollToOffset({
                offset: headerScrollOffset / 3,
                animated: false,
              });
            } else if (Platform.OS === 'android') {
              if (!refreshStatusRef.current) {
                headerMoveScrollY.value = headerScrollOffset / 1.5;
              }
            }
          }
        }
      },
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        headerScrollStart.current = scrollY.get();
      },
    }),
  ).current;

  /**
   * PanResponder for list in tab scene
   */
  const listPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
      onStartShouldSetPanResponder: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // headerScrollY.stopAnimation();
        cancelAnimation(headerScrollY);
        return false;
      },
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        // headerScrollY.stopAnimation();
        cancelAnimation(headerScrollY);
      },
    }),
  ).current;

  /**
   * effect
   */
  // useEffect(() => {
  //   scrollY.addListener(({value}) => {
  //     const curRoute = routes[tabIndex].key;
  //     listOffset.current[curRoute] = value;
  //   });

  //   headerScrollY.addListener(({value}) => {
  //     listRefArr.current.forEach((item) => {
  //       if (item.key !== routes[tabIndex].key) {
  //         return;
  //       }
  //       if (value > HeaderHeight || value < 0) {
  //         headerScrollY.stopAnimation();
  //         syncScrollOffset();
  //       }
  //       if (item.value && value <= HeaderHeight) {
  //         item.value.scrollToOffset({
  //           offset: value,
  //           animated: false,
  //         });
  //       }
  //     });
  //   });
  //   return () => {
  //     scrollY.removeAllListeners();
  //     headerScrollY.removeAllListeners();
  //   };
  // }, [routes, tabIndex]);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
      const curRoute = routes[tabIndex].key;
      listOffset.current[curRoute] = scrollY.get();

      // Logique pour le header
      headerScrollY.value = scrollY.get();
      listRefArr.current.forEach((item) => {
        if (item.key !== routes[tabIndex].key) return;
        
        if (scrollY.get() > HeaderHeight || scrollY.get() < 0) {
          runOnJS(syncScrollOffset)();
        }
        if (item.value && scrollY.get() <= HeaderHeight) {
          item.value.scrollToOffset({
            offset: scrollY.get(),
            animated: false,
          });
        }
      });
    },
  });

  /**
   *  helper functions
   */
  const syncScrollOffset = () => {
    const curRouteKey = routes[_tabIndex.current].key;

    listRefArr.current.forEach((item) => {
      if (item.key !== curRouteKey) {
        if (scrollY.get() < HeaderHeight && scrollY.get() >= 0) {
          if (item.value) {
            item.value.scrollToOffset({
              offset: scrollY.get(),
              animated: false,
            });
            listOffset.current[item.key] = scrollY.get();
          }
        } else if (scrollY.get() >= HeaderHeight) {
          if (
            listOffset.current[item.key] < HeaderHeight ||
            listOffset.current[item.key] == null
          ) {
            if (item.value) {
              item.value.scrollToOffset({
                offset: HeaderHeight,
                animated: false,
              });
              listOffset.current[item.key] = HeaderHeight;
            }
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
        // do not bounce back if user scroll to another position
        if (scrollY.get() < 0) {
          listRefArr.current.forEach((listRef) => {
            listRef.value.scrollToOffset({
              offset: 0,
              animated: true,
            });
          });
        }
      });
    } else if (Platform.OS === 'android') {
      Animated.timing(headerMoveScrollY, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
      refresh().finally(() => {
        Animated.timing(headerMoveScrollY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handlePanReleaseOrEnd = (gestureState: { vy: number; dy: number }) => {
    'worklet'; // Indique que cette fonction peut s'exécuter sur le thread UI
    
    // Synchronisation initiale
    runOnJS(syncScrollOffset)();
    headerScrollY.value = scrollY.value;
  
    if (Platform.OS === 'ios') {
      if (scrollY.value < 0) {
        if (scrollY.value < -PullToRefreshDist && !refreshStatusRef.current) {
          runOnJS(startRefreshAction)();
        } else {
          // Bounce back
          listRefArr.current.forEach((listRef) => {
            listRef.value?.scrollToOffset({
              offset: 0,
              animated: true,
            });
          });
        }
      } else {
        if (Math.abs(gestureState.vy) >= 0.2) {
          // Remplace Animated.decay
          headerScrollY.value = withDecay({
            velocity: -gestureState.vy,
            clamp: [0, HeaderHeight], // Limite les valeurs
          }, () => {
            runOnJS(syncScrollOffset)();
          });
        }
      }
    } else if (Platform.OS === 'android') {
      if (
        headerMoveScrollY.get() < 0 &&
        headerMoveScrollY.get() / 1.5 < -PullToRefreshDist
      ) {
        runOnJS(startRefreshAction)();
      } else {
        // Remplace Animated.timing
        headerMoveScrollY.value = withTiming(0, {
          duration: 300,
        });
      }
    }
  };

  const onMomentumScrollBegin = () => {
    isListGliding.current = true;
  };

  const onMomentumScrollEnd = () => {
    isListGliding.current = false;
    syncScrollOffset();
    // console.log('onMomentumScrollEnd'); 
  };

  const onScrollEndDrag = (e) => {
    syncScrollOffset();

    const offsetY = e.nativeEvent.contentOffset.y;
    // console.log('onScrollEndDrag', offsetY);
    // iOS only
    if (Platform.OS === 'ios') {
      if (offsetY < -PullToRefreshDist && !refreshStatusRef.current) {
        startRefreshAction();
      }
    }

    // check pull to refresh
  };

  const refresh = async () => {
    console.log('-- start refresh');
    refreshStatusRef.current = true;
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('done');
      }, 2000);
    }).then((value) => {
      console.log('-- refresh done!');
      refreshStatusRef.current = false;
    });
  };

  /**
   * render Helper
   */
  const renderHeader = () => {
    const headerAnimStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: interpolate(
              scrollY.get(),
              [0, HeaderHeight],
              [0, -HeaderHeight],
              'clamp',
            ),
          },
        ],
      };
    });
    // const y = scrollY.interpolate({
    //   inputRange: [0, HeaderHeight],
    //   outputRange: [0, -HeaderHeight],
    //   extrapolateRight: 'clamp',
    //   // extrapolate: 'clamp',
    // });
    return (
      <Animated.View
        {...headerPanResponder.panHandlers}
        style={[styles.header, headerAnimStyle]}>
        <TouchableOpacity
          style={{flex: 1, justifyContent: 'center'}}
          activeOpacity={1}
          onPress={() => Alert.alert('header Clicked!')}>
          <Text>Pull to Refresh Header</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const rednerTab1Item = ({item, index}) => {
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

  const rednerTab2Item = ({item, index}) => {
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

  const renderLabel = ({route, focused}) => {
    return (
      <Text style={[styles.label, {opacity: focused ? 1 : 0.5}]}>
        {route.title}
      </Text>
    );
  };

  const renderScene = ({route}) => {
    const focused = route.key === routes[tabIndex].key;
    let numCols;
    let data;
    let renderItem;
    switch (route.key) {
      case 'tab1':
        numCols = 2;
        data = tab1Data;
        renderItem = rednerTab1Item;
        break;
      case 'tab2':
        numCols = 3;
        data = tab2Data;
        renderItem = rednerTab2Item;
        break;
      default:
        return null;
    }
    return (
      <Animated.FlatList
        scrollToOverflowEnabled={true}
        // scrollEnabled={canScroll}
        {...listPanResponder.panHandlers}
        numColumns={numCols}
        ref={(ref) => {
          if (ref) {
            const found = listRefArr.current.find((e) => e.key === route.key);
            if (!found) {
              listRefArr.current.push({
                key: route.key,
                value: ref,
              });
            }
          }
        }}
        scrollEventThrottle={16}
        onScroll={focused ? scrollHandler : undefined}
        // onScroll={
        //   focused
        //     ? Animated.event(
        //         [
        //           {
        //             nativeEvent: {contentOffset: {y: scrollY}},
        //           },
        //         ],
        //         {useNativeDriver: true},
        //       )
        //     : null
        // }
        onMomentumScrollBegin={onMomentumScrollBegin}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        ItemSeparatorComponent={() => <View style={{height: 10}} />}
        ListHeaderComponent={() => <View style={{height: 10}} />}
        contentContainerStyle={{
          paddingTop: HeaderHeight + TabBarHeight,
          paddingHorizontal: 10,
          minHeight: windowHeight - SafeStatusBar + HeaderHeight,
        }}
		onEndReached={() => console.log('end reached')}
        showsHorizontalScrollIndicator={false}
        data={data}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };

  const renderTabBar = (props) => {
    const tabBarAnimStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: interpolate(
              scrollY.get(),
              [0, HeaderHeight],
              [0, -HeaderHeight],
              'clamp',
            )
          },
        ],
      };
    });
    // const y = scrollY.interpolate({
    //   inputRange: [0, HeaderHeight],
    //   outputRange: [HeaderHeight, 0],
    //   // extrapolate: 'clamp',
    //   extrapolateRight: 'clamp',
    // });
    return (
      <Animated.View
        style={[
          {
            top: 0,
            zIndex: 1,
            position: 'absolute',
            // transform: [{translateY: y}],
            width: '100%',
          },
          tabBarAnimStyle,
        ]}>
        <TabBar
          {...props}
          onTabPress={({route, preventDefault}) => {
            if (isListGliding.current) {
              preventDefault();
            }
          }}
          style={styles.tab}
          renderLabel={renderLabel}
          indicatorStyle={styles.indicator}
        />
      </Animated.View>
    );
  };

  const renderTabView = () => {
    return (
      <TabView
        onSwipeStart={() => setCanScroll(false)}
        onSwipeEnd={() => setCanScroll(true)}
        onIndexChange={(id) => {
          _tabIndex.current = id;
          setIndex(id);
        }}
        navigationState={{index: tabIndex, routes}}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        initialLayout={{
          height: 0,
          width: windowWidth,
        }}
      />
    );
  };

  const renderCustomRefresh = () => {
    // headerMoveScrollY
    const iosAnimStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: interpolate(
              scrollY.get(),
              [-100, 0],
              [-120, 0],
              'clamp',
            )
          },
        ],
      };
    });

    const androidAnimStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: interpolate(
              headerMoveScrollY.get(),
              [-300, 0],
              [150, 0],
              'clamp',
            ),
          },
        ],
      };
    });

    return Platform.select({
      ios: (
        <AnimatedIndicator
          style={[
            {
              top: -50,
              position: 'absolute',
              alignSelf: 'center',
              // transform: [
              //   {
              //     translateY: scrollY.interpolate({
              //       inputRange: [-100, 0],
              //       outputRange: [120, 0],
              //       extrapolate: 'clamp',
              //     }),
              //   },
              // ],
            },
            iosAnimStyle,
          ]}
          animating
        />
      ),
      android: (
        <Animated.View
          style={[
            {
              // transform: [
              //   {
              //     translateY: headerMoveScrollY.interpolate({
              //       inputRange: [-300, 0],
              //       outputRange: [150, 0],
              //       extrapolate: 'clamp',
              //     }),
              //   },
              // ],
              backgroundColor: '#eee',
              height: 38,
              width: 38,
              borderRadius: 19,
              borderWidth: 2,
              borderColor: '#ddd',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              top: -50,
              position: 'absolute',
            },
            androidAnimStyle,
          ]}>
          <ActivityIndicator animating />
        </Animated.View>
      ),
    });
  };

  return (
    <View style={styles.container}>
      {renderTabView()}
      {renderHeader()}
      {renderCustomRefresh()}
    </View>
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
  label: {fontSize: 16, color: '#222'},
  tab: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#FFCC80',
    height: TabBarHeight,
  },
  indicator: {backgroundColor: '#222'},
});

export default App;