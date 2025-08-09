import DraggableFlatList, {
  DraggableFlatListProps,
} from "react-native-draggable-flatlist";
import Animated, { AnimatedProps as ReanimatedProps } from "react-native-reanimated";
import { FlatListProps } from "react-native";

// type BaseProps<T> = Omit<DraggableFlatListProps<T>, 'onScroll'>;
// type AnimatedProps<T> = ReanimatedProps<FlatListProps<T>>;
// export type AnimatedDraggableFlatListProps<T> = BaseProps<T> & AnimatedProps<T>;
const AnimatedFlatListComponent = Animated.createAnimatedComponent(DraggableFlatList);
// export const AnimatedDraggableFlatList = AnimatedFlatListComponent as unknown as <T>(
//   props: AnimatedDraggableFlatListProps<T>
// ) => React.ReactElement;

export default AnimatedFlatListComponent;