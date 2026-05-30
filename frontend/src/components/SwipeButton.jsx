import { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const BUTTON_WIDTH = Dimensions.get('window').width - 60;
const BUTTON_HEIGHT = 64;
const PADDING = 5;
const THUMB_SIZE = BUTTON_HEIGHT - 2 * PADDING;
const SWIPE_RANGE = BUTTON_WIDTH - 2 * PADDING - THUMB_SIZE;

export default function SwipeButton({ onSwipeSuccess, label = 'Swipe to get started' }) {
  const x = useSharedValue(0);
  const [done, setDone] = useState(false);

  const onComplete = () => {
    setDone(true);
    onSwipeSuccess?.();
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = Math.max(0, Math.min(e.translationX, SWIPE_RANGE));
    })
    .onEnd(() => {
      if (x.value >= SWIPE_RANGE - 20) {
        x.value = withTiming(SWIPE_RANGE, {}, () => runOnJS(onComplete)());
      } else {
        x.value = withSpring(0);
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: 1 - x.value / SWIPE_RANGE,
  }));

  return (
    <View style={styles.track}>
      <Animated.Text style={[styles.label, textStyle]}>{label}</Animated.Text>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <Ionicons name={done ? 'checkmark' : 'arrow-forward'} size={26} color="#fff" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    backgroundColor: '#D6E4F7',
    borderRadius: BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: PADDING,
  },
  label: {
    position: 'absolute',
    color: '#1a4c8c',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  thumb: {
    position: 'absolute',
    left: PADDING,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE,
    backgroundColor: '#123F7A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#123F7A',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
