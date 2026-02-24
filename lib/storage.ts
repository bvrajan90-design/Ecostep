import AsyncStorage from '@react-native-async-storage/async-storage';
import { GreenTask, DEFAULT_TASKS } from './constants';

const TASKS_KEY = 'ecostep_tasks';
const HISTORY_KEY = 'ecostep_history';
const LAST_DATE_KEY = 'ecostep_last_date';
const STREAK_KEY = 'ecostep_streak';

export interface DayHistory {
  date: string;
  completedCount: number;
  totalTasks: number;
  co2Saved: number;
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export async function loadTasks(): Promise<GreenTask[]> {
  try {
    const lastDate = await AsyncStorage.getItem(LAST_DATE_KEY);
    const today = getTodayString();

    if (lastDate !== today) {
      // Save yesterday's data to history before resetting
      if (lastDate) {
        const oldTasks = await AsyncStorage.getItem(TASKS_KEY);
        if (oldTasks) {
          const parsed: GreenTask[] = JSON.parse(oldTasks);
          const completedCount = parsed.filter(t => t.completed).length;
          if (completedCount > 0) {
            await addToHistory({
              date: lastDate,
              completedCount,
              totalTasks: parsed.length,
              co2Saved: completedCount * 0.5,
            });
          }
          // Update streak
          if (completedCount > 0) {
            const currentStreak = await getStreak();
            await AsyncStorage.setItem(STREAK_KEY, String(currentStreak + 1));
          } else {
            await AsyncStorage.setItem(STREAK_KEY, '0');
          }
        }
      }

      // Reset tasks for new day
      const freshTasks = DEFAULT_TASKS.map(t => ({ ...t, completed: false }));
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(freshTasks));
      await AsyncStorage.setItem(LAST_DATE_KEY, today);
      return freshTasks;
    }

    const stored = await AsyncStorage.getItem(TASKS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_TASKS.map(t => ({ ...t, completed: false }));
  } catch (e) {
    console.error('Error loading tasks:', e);
    return DEFAULT_TASKS.map(t => ({ ...t, completed: false }));
  }
}

export async function saveTasks(tasks: GreenTask[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    await AsyncStorage.setItem(LAST_DATE_KEY, getTodayString());
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
}

async function addToHistory(day: DayHistory): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(HISTORY_KEY);
    const history: DayHistory[] = stored ? JSON.parse(stored) : [];
    history.push(day);
    // Keep last 90 days
    const trimmed = history.slice(-90);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error saving history:', e);
  }
}

export async function getHistory(): Promise<DayHistory[]> {
  try {
    const stored = await AsyncStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading history:', e);
    return [];
  }
}

export async function getStreak(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(STREAK_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch (e) {
    return 0;
  }
}

export async function getTotalCO2Saved(currentTasks: GreenTask[]): Promise<number> {
  try {
    const history = await getHistory();
    const historyCO2 = history.reduce((sum, day) => sum + day.co2Saved, 0);
    const todayCO2 = currentTasks.filter(t => t.completed).length * 0.5;
    return historyCO2 + todayCO2;
  } catch (e) {
    return 0;
  }
}

export async function getTotalCompletedDays(): Promise<number> {
  try {
    const history = await getHistory();
    return history.filter(d => d.completedCount > 0).length;
  } catch (e) {
    return 0;
  }
}
