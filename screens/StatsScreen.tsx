import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, GreenTask } from '../lib/constants';
import { loadTasks, getHistory, getStreak, getTotalCO2Saved, getTotalCompletedDays, DayHistory } from '../lib/storage';
import StatCard from '../components/StatCard';
import WeekChart from '../components/WeekChart';

export default function StatsScreen() {
  const [totalCO2, setTotalCO2] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [tasks, setTasks] = useState<GreenTask[]>([]);
  const [weekData, setWeekData] = useState<{ day: string; value: number; max: number }[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<DayHistory[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const loadedTasks = await loadTasks();
    setTasks(loadedTasks);

    const co2 = await getTotalCO2Saved(loadedTasks);
    setTotalCO2(co2);

    const s = await getStreak();
    setStreak(s);

    const days = await getTotalCompletedDays();
    setTotalDays(days);

    const hist = await getHistory();
    setHistory(hist);

    // Build week data
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekArr: { day: string; value: number; max: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayHist = hist.find(h => h.date === dateStr);

      let value = 0;
      if (i === 0) {
        // Today
        value = loadedTasks.filter(t => t.completed).length;
      } else if (dayHist) {
        value = dayHist.completedCount;
      }

      weekArr.push({
        day: dayNames[d.getDay()],
        value,
        max: 6,
      });
    }

    setWeekData(weekArr);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, []);

  const completedToday = tasks.filter(t => t.completed).length;
  const treesEquivalent = (totalCO2 / 21).toFixed(1); // avg tree absorbs ~21kg CO2/year

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.sage}
            colors={[COLORS.sage]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Impact Stats</Text>
          <Text style={styles.subtitle}>Your sustainability journey</Text>
        </View>

        {/* Big CO2 Card */}
        <View style={styles.bigCard}>
          <View style={styles.bigCardIcon}>
            <Ionicons name="earth" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.bigCardValue}>{totalCO2.toFixed(1)} kg</Text>
          <Text style={styles.bigCardLabel}>Total CO₂ Saved</Text>
          <View style={styles.bigCardDivider} />
          <Text style={styles.bigCardEquiv}>
            🌳 Equivalent to {treesEquivalent} trees for a year
          </Text>
        </View>

        {/* Stat Cards Row */}
        <View style={styles.statsRow}>
          <StatCard
            icon="flame"
            iconColor={COLORS.accent}
            iconBg="rgba(224, 122, 95, 0.12)"
            label="Day Streak"
            value={String(streak)}
            index={0}
          />
          <View style={{ width: SPACING.sm + 4 }} />
          <StatCard
            icon="calendar"
            iconColor={COLORS.sage}
            iconBg={COLORS.progressBg}
            label="Active Days"
            value={String(totalDays + (completedToday > 0 ? 1 : 0))}
            index={1}
          />
          <View style={{ width: SPACING.sm + 4 }} />
          <StatCard
            icon="checkmark-circle"
            iconColor={COLORS.charcoal}
            iconBg="rgba(61, 64, 91, 0.08)"
            label="Today"
            value={`${completedToday}/6`}
            index={2}
          />
        </View>

        {/* Week Chart */}
        <View style={styles.chartSection}>
          <WeekChart data={weekData} />
        </View>

        {/* Eco Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={COLORS.accentLight} />
            <Text style={styles.tipsTitle}>Eco Tip of the Day</Text>
          </View>
          <Text style={styles.tipsText}>
            Did you know? Taking a 5-minute shower instead of a 10-minute one saves about 45 liters of water and reduces your carbon footprint by 0.5 kg of CO₂ per day.
          </Text>
        </View>

        {/* Milestones */}
        <View style={styles.milestonesCard}>
          <Text style={styles.milestonesTitle}>Milestones</Text>
          <MilestoneItem
            icon="leaf"
            title="First Step"
            description="Complete your first green task"
            achieved={totalCO2 > 0}
          />
          <MilestoneItem
            icon="water"
            title="Water Saver"
            description="Save 5 kg of CO₂"
            achieved={totalCO2 >= 5}
          />
          <MilestoneItem
            icon="earth"
            title="Earth Guardian"
            description="Save 25 kg of CO₂"
            achieved={totalCO2 >= 25}
          />
          <MilestoneItem
            icon="trophy"
            title="Eco Champion"
            description="Save 100 kg of CO₂"
            achieved={totalCO2 >= 100}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MilestoneItem({ icon, title, description, achieved }: {
  icon: string;
  title: string;
  description: string;
  achieved: boolean;
}) {
  return (
    <View style={[milestoneStyles.item, !achieved && milestoneStyles.itemLocked]}>
      <View style={[
        milestoneStyles.iconWrap,
        { backgroundColor: achieved ? COLORS.progressBg : COLORS.divider },
      ]}>
        <Ionicons
          name={icon as any}
          size={18}
          color={achieved ? COLORS.sage : COLORS.charcoalLight}
        />
      </View>
      <View style={milestoneStyles.textWrap}>
        <Text style={[
          milestoneStyles.title,
          !achieved && milestoneStyles.titleLocked,
        ]}>
          {title}
        </Text>
        <Text style={milestoneStyles.desc}>{description}</Text>
      </View>
      {achieved && (
        <Ionicons name="checkmark-circle" size={22} color={COLORS.sage} />
      )}
      {!achieved && (
        <Ionicons name="lock-closed-outline" size={18} color={COLORS.charcoalLight} />
      )}
    </View>
  );
}

const milestoneStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  itemLocked: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm + 4,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  titleLocked: {
    color: COLORS.charcoalLight,
  },
  desc: {
    fontSize: 12,
    color: COLORS.charcoalLight,
    marginTop: 1,
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
  subtitle: {
    fontSize: 15,
    color: COLORS.charcoalLight,
    marginTop: 4,
    fontWeight: '400',
  },
  bigCard: {
    backgroundColor: COLORS.sage,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.sage,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  bigCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  bigCardValue: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -1,
  },
  bigCardLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginTop: 4,
  },
  bigCardDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    marginVertical: SPACING.md,
  },
  bigCardEquiv: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  chartSection: {
    marginBottom: SPACING.md,
  },
  tipsCard: {
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
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm + 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  tipsText: {
    fontSize: 14,
    color: COLORS.charcoalLight,
    lineHeight: 21,
    fontWeight: '400',
  },
  milestonesCard: {
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
  milestonesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginBottom: SPACING.sm,
  },
});
