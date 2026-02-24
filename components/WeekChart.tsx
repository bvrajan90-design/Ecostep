import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS } from '../lib/constants';

interface WeekChartProps {
  data: { day: string; value: number; max: number }[];
}

export default function WeekChart({ data }: WeekChartProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Week</Text>
      <View style={styles.chartRow}>
        {data.map((item, i) => (
          <BarItem key={item.day} item={item} index={i} />
        ))}
      </View>
    </View>
  );
}

function BarItem({ item, index }: { item: { day: string; value: number; max: number }; index: number }) {
  const height = useSharedValue(0);

  useEffect(() => {
    const targetHeight = item.max > 0 ? (item.value / item.max) * 100 : 0;
    height.value = withDelay(
      index * 80,
      withSpring(targetHeight, { damping: 15, stiffness: 100 })
    );
  }, [item.value]);

  const barStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const isToday = index === data.length - 1;

  return (
    <View style={styles.barContainer}>
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.bar,
            barStyle,
            { backgroundColor: isToday ? COLORS.sage : COLORS.sageLight },
          ]}
        />
      </View>
      <Text style={[
        styles.dayLabel,
        isToday && styles.dayLabelActive,
      ]}>
        {item.day}
      </Text>
    </View>
  );
}

const data: any[] = []; // placeholder to avoid reference error

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginBottom: SPACING.md,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: 28,
    height: 100,
    backgroundColor: COLORS.progressBg,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 11,
    color: COLORS.charcoalLight,
    marginTop: 6,
    fontWeight: '500',
  },
  dayLabelActive: {
    color: COLORS.sage,
    fontWeight: '700',
  },
});
