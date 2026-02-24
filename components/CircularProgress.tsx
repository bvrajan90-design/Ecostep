import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, SPACING } from '../lib/constants';

interface CircularProgressProps {
  progress: number; // 0 to 1
  completedCount: number;
  totalCount: number;
}

export default function CircularProgress({ progress, completedCount, totalCount }: CircularProgressProps) {
  const animProgress = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    animProgress.value = withTiming(progress, {
      duration: 800,
      easing: Easing.bezierFn(0.25, 0.1, 0.25, 1),
    });
    // Bounce effect
    scale.value = withSpring(1.03, { damping: 4, stiffness: 200 }, () => {
      scale.value = withSpring(1, { damping: 8, stiffness: 200 });
    });
  }, [progress]);

  const SIZE = 200;
  const STROKE_WIDTH = 14;
  const RADIUS = (SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // We'll use a visual representation with View-based segments
  const fillStyle = useAnimatedStyle(() => {
    const degrees = interpolate(animProgress.value, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${degrees}deg` }],
    };
  });

  const percentage = Math.round(progress * 100);

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.outerCircle}>
        {/* Background track */}
        <View style={[styles.track, { width: SIZE, height: SIZE, borderRadius: SIZE / 2 }]}>
          {/* Progress segments */}
          {Array.from({ length: totalCount }).map((_, i) => {
            const segmentAngle = (360 / totalCount) * i - 90;
            const isCompleted = i < completedCount;
            const segmentSize = (360 / totalCount) - 4; // gap between segments
            return (
              <View
                key={i}
                style={[
                  styles.segment,
                  {
                    width: SIZE,
                    height: SIZE,
                    borderRadius: SIZE / 2,
                    borderWidth: STROKE_WIDTH,
                    borderColor: 'transparent',
                    borderTopColor: isCompleted ? COLORS.sage : COLORS.progressBg,
                    transform: [
                      { rotate: `${segmentAngle + (segmentSize / 2)}deg` },
                    ],
                  },
                ]}
              />
            );
          })}
          {/* Inner circle */}
          <View style={[
            styles.innerCircle,
            {
              width: SIZE - STROKE_WIDTH * 2 - 8,
              height: SIZE - STROKE_WIDTH * 2 - 8,
              borderRadius: (SIZE - STROKE_WIDTH * 2 - 8) / 2,
            },
          ]}>
            <Text style={styles.percentText}>{percentage}%</Text>
            <Text style={styles.labelText}>completed</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  outerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  segment: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  innerCircle: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  percentText: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.charcoal,
    letterSpacing: -1,
  },
  labelText: {
    fontSize: 14,
    color: COLORS.charcoalLight,
    marginTop: 2,
    fontWeight: '500',
  },
});
