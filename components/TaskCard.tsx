import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, GreenTask } from '../lib/constants';

interface TaskCardProps {
  task: GreenTask;
  onToggle: (id: string) => void;
  index: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TaskCard({ task, onToggle, index }: TaskCardProps) {
  const checkScale = useSharedValue(task.completed ? 1 : 0);
  const cardScale = useSharedValue(1);
  const sparkleOpacity = useSharedValue(0);
  const sparkleScale = useSharedValue(0.5);
  const slideIn = useSharedValue(0);

  useEffect(() => {
    slideIn.value = withDelay(
      index * 80,
      withSpring(1, { damping: 15, stiffness: 120 })
    );
  }, []);

  useEffect(() => {
    checkScale.value = withSpring(task.completed ? 1 : 0, {
      damping: 12,
      stiffness: 200,
    });
  }, [task.completed]);

  const handlePress = () => {
    cardScale.value = withSequence(
      withTiming(0.97, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );

    if (!task.completed) {
      // Sparkle animation
      sparkleOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(400, withTiming(0, { duration: 300 }))
      );
      sparkleScale.value = withSequence(
        withTiming(0.5, { duration: 0 }),
        withSpring(1.3, { damping: 6, stiffness: 150 }),
        withTiming(0.5, { duration: 200 })
      );
    }

    onToggle(task.id);
  };

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value },
      { translateY: (1 - slideIn.value) * 30 },
    ],
    opacity: slideIn.value,
  }));

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const sparkleAnimStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
    transform: [{ scale: sparkleScale.value }],
  }));

  return (
    <AnimatedPressable onPress={handlePress} style={[styles.card, cardAnimStyle]}>
      <View style={styles.cardContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: task.completed ? COLORS.sage : COLORS.progressBg },
        ]}>
          <Ionicons
            name={task.icon as any}
            size={22}
            color={task.completed ? COLORS.white : COLORS.sage}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            task.completed && styles.titleCompleted,
          ]}>
            {task.title}
          </Text>
          <Text style={styles.subtitle}>{task.subtitle}</Text>
        </View>

        <View style={styles.checkArea}>
          {/* Sparkle effect */}
          <Animated.View style={[styles.sparkleContainer, sparkleAnimStyle]}>
            <Ionicons name="sparkles" size={24} color={COLORS.accentLight} />
          </Animated.View>

          <View style={[
            styles.checkbox,
            task.completed && styles.checkboxCompleted,
          ]}>
            <Animated.View style={checkAnimStyle}>
              <Ionicons name="checkmark" size={18} color={COLORS.white} />
            </Animated.View>
          </View>
        </View>
      </View>

      {task.completed && (
        <View style={styles.co2Badge}>
          <Ionicons name="leaf" size={11} color={COLORS.sage} />
          <Text style={styles.co2Text}>-{task.co2Saved}kg CO₂</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm + 4,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 4,
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.charcoal,
    letterSpacing: -0.2,
  },
  titleCompleted: {
    color: COLORS.sage,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.charcoalLight,
    marginTop: 2,
    fontWeight: '400',
  },
  checkArea: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  sparkleContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: COLORS.progressBg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxCompleted: {
    backgroundColor: COLORS.sage,
    borderColor: COLORS.sage,
  },
  co2Badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginLeft: 60,
    backgroundColor: COLORS.progressBg,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  co2Text: {
    fontSize: 11,
    color: COLORS.sageDark,
    fontWeight: '600',
    marginLeft: 4,
  },
});
