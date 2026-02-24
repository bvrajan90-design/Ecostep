import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../lib/constants';

interface SparkleEffectProps {
  visible: boolean;
}

const SPARKLE_COUNT = 8;

export default function SparkleEffect({ visible }: SparkleEffectProps) {
  const opacities = Array.from({ length: SPARKLE_COUNT }, () => useSharedValue(0));
  const scales = Array.from({ length: SPARKLE_COUNT }, () => useSharedValue(0));
  const translates = Array.from({ length: SPARKLE_COUNT }, () => useSharedValue(0));

  useEffect(() => {
    if (visible) {
      opacities.forEach((op, i) => {
        op.value = withDelay(
          i * 30,
          withSequence(
            withTiming(1, { duration: 150 }),
            withDelay(200, withTiming(0, { duration: 300 }))
          )
        );
      });
      scales.forEach((sc, i) => {
        sc.value = withDelay(
          i * 30,
          withSequence(
            withTiming(1, { duration: 200 }),
            withTiming(0.3, { duration: 300 })
          )
        );
      });
      translates.forEach((tr, i) => {
        tr.value = withDelay(
          i * 30,
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(40 + Math.random() * 20, { duration: 500 })
          )
        );
      });
    }
  }, [visible]);

  return (
    <View style={styles.container} pointerEvents="none">
      {opacities.map((_, i) => {
        const angle = (360 / SPARKLE_COUNT) * i;
        const animStyle = useAnimatedStyle(() => ({
          opacity: opacities[i].value,
          transform: [
            { rotate: `${angle}deg` },
            { translateY: -translates[i].value },
            { scale: scales[i].value },
          ],
        }));

        return (
          <Animated.View key={i} style={[styles.sparkle, animStyle]}>
            <View style={styles.sparkleDot} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentLight,
  },
});
