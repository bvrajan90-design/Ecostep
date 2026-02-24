import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS } from '../lib/constants';
import { getTotalCO2Saved, getStreak, getTotalCompletedDays, loadTasks } from '../lib/storage';

export default function ProfileScreen() {
  const [totalCO2, setTotalCO2] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const tasks = await loadTasks();
    const co2 = await getTotalCO2Saved(tasks);
    setTotalCO2(co2);
    const s = await getStreak();
    setStreak(s);
    const d = await getTotalCompletedDays();
    setTotalDays(d);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your progress. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            setTotalCO2(0);
            setStreak(0);
            setTotalDays(0);
          },
        },
      ]
    );
  };

  const level = totalCO2 < 5 ? 'Seedling' : totalCO2 < 25 ? 'Sapling' : totalCO2 < 100 ? 'Tree' : 'Forest';
  const levelEmoji = totalCO2 < 5 ? '🌱' : totalCO2 < 25 ? '🌿' : totalCO2 < 100 ? '🌳' : '🌲';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{levelEmoji}</Text>
          </View>
          <Text style={styles.levelTitle}>{level}</Text>
          <Text style={styles.levelSubtitle}>Eco Level</Text>

          {/* Level Progress */}
          <View style={styles.levelProgressBg}>
            <View
              style={[
                styles.levelProgressFill,
                {
                  width: `${Math.min(
                    (totalCO2 / (totalCO2 < 5 ? 5 : totalCO2 < 25 ? 25 : totalCO2 < 100 ? 100 : 500)) * 100,
                    100
                  )}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.levelProgressText}>
            {totalCO2.toFixed(1)} / {totalCO2 < 5 ? 5 : totalCO2 < 25 ? 25 : totalCO2 < 100 ? 100 : 500} kg CO₂ to next level
          </Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.summaryCard}>
          <SummaryRow icon="leaf" label="Total CO₂ Saved" value={`${totalCO2.toFixed(1)} kg`} />
          <SummaryRow icon="flame" label="Current Streak" value={`${streak} days`} />
          <SummaryRow icon="calendar" label="Active Days" value={`${totalDays}`} />
          <SummaryRow icon="earth" label="Trees Equivalent" value={`${(totalCO2 / 21).toFixed(1)}`} last />
        </View>

        {/* About Section */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>About EcoStep</Text>
          <Text style={styles.aboutText}>
            EcoStep helps you build sustainable daily habits. Each completed task saves an estimated 0.5 kg of CO₂. Track your progress and watch your positive impact grow!
          </Text>
          <View style={styles.aboutVersion}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.charcoalLight} />
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Reset Button */}
        <Pressable style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="trash-outline" size={18} color={COLORS.accent} />
          <Text style={styles.resetText}>Reset All Data</Text>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ icon, label, value, last = false }: {
  icon: string;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[
      summaryStyles.row,
      !last && summaryStyles.rowBorder,
    ]}>
      <View style={summaryStyles.iconWrap}>
        <Ionicons name={icon as any} size={18} color={COLORS.sage} />
      </View>
      <Text style={summaryStyles.label}>{label}</Text>
      <Text style={summaryStyles.value}>{value}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.progressBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm + 4,
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: COLORS.charcoal,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  header: {
    paddingTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.charcoal,
    letterSpacing: -0.5,
  },
  avatarCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.progressBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.charcoal,
    letterSpacing: -0.3,
  },
  levelSubtitle: {
    fontSize: 14,
    color: COLORS.charcoalLight,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  levelProgressBg: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.progressBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: COLORS.sage,
    borderRadius: 4,
  },
  levelProgressText: {
    fontSize: 12,
    color: COLORS.charcoalLight,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  aboutCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginBottom: SPACING.sm,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.charcoalLight,
    lineHeight: 21,
    fontWeight: '400',
  },
  aboutVersion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  versionText: {
    fontSize: 13,
    color: COLORS.charcoalLight,
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(224, 122, 95, 0.08)',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },
});
