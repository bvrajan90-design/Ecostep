import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, GreenTask, MOTIVATIONAL_QUOTES } from '../lib/constants';
import { loadTasks, saveTasks } from '../lib/storage';
import CircularProgress from '../components/CircularProgress';
import TaskCard from '../components/TaskCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [tasks, setTasks] = useState<GreenTask[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    loadInitialData();
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  const loadInitialData = async () => {
    const loaded = await loadTasks();
    setTasks(loaded);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    setRefreshing(false);
  }, []);

  const handleToggle = async (id: string) => {
    const updated = tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    await saveTasks(updated);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? completedCount / tasks.length : 0;
  const co2Today = (completedCount * 0.5).toFixed(1);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color={COLORS.accent} />
          <Text style={styles.streakText}>{completedCount}/{tasks.length}</Text>
        </View>
      </View>

      {/* Progress Circle */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Today's Positive Impact</Text>
        <CircularProgress
          progress={progress}
          completedCount={completedCount}
          totalCount={tasks.length}
        />
        <Text style={styles.quoteText}>{quote}</Text>
      </View>

      {/* CO2 saved today */}
      <View style={styles.co2Row}>
        <View style={styles.co2Card}>
          <View style={styles.co2IconWrap}>
            <Ionicons name="leaf" size={18} color={COLORS.sage} />
          </View>
          <View>
            <Text style={styles.co2Value}>{co2Today} kg</Text>
            <Text style={styles.co2Label}>CO₂ saved today</Text>
          </View>
        </View>
        <View style={styles.co2Card}>
          <View style={[styles.co2IconWrap, { backgroundColor: 'rgba(224, 122, 95, 0.12)' }]}>
            <Ionicons name="checkmark-done" size={18} color={COLORS.accent} />
          </View>
          <View>
            <Text style={styles.co2Value}>{completedCount}</Text>
            <Text style={styles.co2Label}>tasks done</Text>
          </View>
        </View>
      </View>

      {/* Tasks header */}
      <Text style={styles.tasksHeader}>Green Tasks</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.taskPadding}>
            <TaskCard task={item} onToggle={handleToggle} index={index} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View style={{ height: 100 }} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.sage}
            colors={[COLORS.sage]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  headerSection: {
    paddingHorizontal: SPACING.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.charcoal,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.charcoalLight,
    marginTop: 2,
    fontWeight: '400',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(224, 122, 95, 0.1)',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
  },
  progressSection: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.charcoal,
    letterSpacing: -0.3,
  },
  quoteText: {
    fontSize: 14,
    color: COLORS.charcoalLight,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  co2Row: {
    flexDirection: 'row',
    gap: SPACING.sm + 4,
    marginBottom: SPACING.lg,
  },
  co2Card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm + 2,
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  co2IconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.progressBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  co2Value: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.charcoal,
    letterSpacing: -0.3,
  },
  co2Label: {
    fontSize: 11,
    color: COLORS.charcoalLight,
    fontWeight: '500',
  },
  tasksHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginBottom: SPACING.md,
    letterSpacing: -0.3,
  },
  taskPadding: {
    paddingHorizontal: SPACING.lg,
  },
});
