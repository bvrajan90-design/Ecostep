import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../lib/constants';

interface StatCardProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  index: number;
}

export default function StatCard({ icon, iconColor, iconBg, label, value, index }: StatCardProps) {
  const slideUp = useSharedValue(0);

  useEffect(() => {
    slideUp.value = withDelay(
      index * 100,
      withSpring(1, { damping: 15, stiffness: 120 })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: slideUp.value,
    transform: [{ translateY: (1 - slideUp.value) * 20 }],
  }));

  return (
    <Animated.View style={[styles.card, animStyle]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.charcoal,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 12,
    color: COLORS.charcoalLight,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
});
