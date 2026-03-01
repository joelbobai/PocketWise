import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getTransactions } from '@/lib/storage';
import { Transaction } from '@/lib/types';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const days: Date[] = [];

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    days.push(new Date(year, month, i - firstDay.getDay() + 1));
  }

  const lastDate = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= lastDate; day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    const nextDay = days.length - (firstDay.getDay() + lastDate) + 1;
    days.push(new Date(year, month + 1, nextDay));
  }

  return days;
}

export default function CalendarScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const load = useCallback(async () => {
    const stored = await getTransactions();
    setTransactions(stored);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const transactionByDate = useMemo(() => {
    const grouped = new Map<string, { income: number; expense: number; count: number }>();

    transactions.forEach((item) => {
      const key = new Date(item.date).toISOString().slice(0, 10);
      const current = grouped.get(key) || { income: 0, expense: 0, count: 0 };
      grouped.set(key, {
        income: current.income + (item.type === 'income' ? item.amount : 0),
        expense: current.expense + (item.type === 'expense' ? item.amount : 0),
        count: current.count + 1,
      });
    });

    return grouped;
  }, [transactions]);

  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Calendar Tracker</Text>
      <Text style={styles.subtitle}>Tap into your spending rhythm for this month.</Text>

      <View style={styles.weekRow}>
        {WEEK_DAYS.map((day) => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const iso = day.toISOString().slice(0, 10);
          const isCurrentMonth = day.getMonth() === month;
          const daily = transactionByDate.get(iso);
          const level = daily ? Math.min(daily.count, 3) : 0;

          return (
            <View
              key={iso}
              style={[
                styles.dayCell,
                !isCurrentMonth && styles.dayOutside,
                level === 1 && styles.dayLevel1,
                level === 2 && styles.dayLevel2,
                level >= 3 && styles.dayLevel3,
              ]}>
              <Text style={[styles.dayNumber, !isCurrentMonth && styles.dayNumberOutside]}>{day.getDate()}</Text>
              {daily ? (
                <Text style={styles.dayMeta}>-{daily.expense.toFixed(0)}</Text>
              ) : (
                <Text style={styles.dayMeta}> </Text>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { marginTop: 4, color: '#6b7280', marginBottom: 12 },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekDay: { flex: 1, textAlign: 'center', color: '#6b7280', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayCell: {
    width: '13.2%',
    minHeight: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 4,
    backgroundColor: '#fff',
  },
  dayOutside: { backgroundColor: '#f8fafc' },
  dayLevel1: { backgroundColor: '#dbeafe', borderColor: '#bfdbfe' },
  dayLevel2: { backgroundColor: '#93c5fd', borderColor: '#60a5fa' },
  dayLevel3: { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
  dayNumber: { fontWeight: '600', color: '#111827', fontSize: 12 },
  dayNumberOutside: { color: '#9ca3af' },
  dayMeta: { fontSize: 10, marginTop: 4, color: '#111827' },
});
