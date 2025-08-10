import { forwardRef } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

const AnimatedContentContainer = forwardRef<ScrollView, ScrollViewProps>(
    ({ children, contentContainerStyle, ...rest }, ref) => {
        return (
            <ScrollView {...rest} ref={ref}>
                <Animated.View style={contentContainerStyle}>
                    {children}
                </Animated.View>
            </ScrollView>
        );
    }
);
AnimatedContentContainer.displayName = 'AnimatedContentContainer';

export default AnimatedContentContainer;