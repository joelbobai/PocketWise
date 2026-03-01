import * as FileSystem from 'expo-file-system/legacy';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PieChart } from '@/components/PieChart';
import { getSavingsTarget, getTransactions, saveSavingsTarget } from '@/lib/storage';
import { Transaction } from '@/lib/types';
import { formatCurrency, getMonthKey, toExcel } from '@/lib/utils';

const COLORS = ['#1f6feb', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

export default function SummaryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [targetInput, setTargetInput] = useState('');

  const load = useCallback(async () => {
    const [storedTransactions, target] = await Promise.all([getTransactions(), getSavingsTarget()]);
    setTransactions(storedTransactions);
    setTargetInput(target ? `${target}` : '');
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const currentMonth = getMonthKey(new Date().toISOString());

  const monthly = useMemo(
    () => transactions.filter((item) => getMonthKey(item.date) === currentMonth),
    [transactions, currentMonth]
  );

  const income = useMemo(
    () => monthly.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0),
    [monthly]
  );

  const expense = useMemo(
    () => monthly.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0),
    [monthly]
  );

  const noSpendDays = useMemo(() => {
    const today = new Date();
    const daysInMonthSoFar = today.getDate();
    const activeDays = new Set(
      monthly
        .filter((item) => item.type === 'expense')
        .map((item) => new Date(item.date).toISOString().slice(0, 10))
    );

    return Math.max(daysInMonthSoFar - activeDays.size, 0);
  }, [monthly]);

  const slices = useMemo(() => {
    const grouped = new Map<string, number>();

    monthly
      .filter((item) => item.type === 'expense')
      .forEach((item) => grouped.set(item.category, (grouped.get(item.category) || 0) + item.amount));

    return [...grouped.entries()].map(([category, amount], index) => ({
      category,
      amount,
      color: COLORS[index % COLORS.length],
    }));
  }, [monthly]);

  const exportExcel = async () => {
    try {
      const excelData = toExcel(transactions);
      const path = `${FileSystem.cacheDirectory}pocketwise-transactions.xls`;
      await FileSystem.writeAsStringAsync(path, excelData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Share.share({
        title: 'PocketWise Transactions',
        message: `Excel file saved at: ${path}`,
        url: path,
      });
    } catch {
      Alert.alert('Export failed', 'Unable to export Excel right now.');
    }
  };

  const handleSaveTarget = async () => {
    const parsed = Number(targetInput);
    if (!Number.isFinite(parsed) || parsed < 0) {
      Alert.alert('Invalid target', 'Enter a valid amount greater than or equal to 0.');
      return;
    }

    try {
      await saveSavingsTarget(parsed);
      Alert.alert('Saved', 'Savings target updated.');
    } catch {
      Alert.alert('Save failed', 'Unable to save savings target right now.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>This Month</Text>
        <Text style={styles.metric}>Income: {formatCurrency(income)}</Text>
        <Text style={styles.metric}>Expense: {formatCurrency(expense)}</Text>
        <Text style={styles.metric}>Net: {formatCurrency(income - expense)}</Text>
        <Text style={styles.metric}>No-spend days: {noSpendDays}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Savings Target</Text>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setTargetInput}
          placeholder="0.00"
          style={styles.input}
          value={targetInput}
        />
        <Pressable onPress={handleSaveTarget} style={styles.targetButton}>
          <Text style={styles.targetButtonText}>Save Target</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Expenses by Category</Text>
        <PieChart slices={slices} />
      </View>

      <Pressable onPress={exportExcel} style={styles.exportButton}>
        <Text style={styles.exportText}>Export All Transactions as Excel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  metric: { fontSize: 15, color: '#374151', marginTop: 4 },
  exportButton: {
    marginTop: 8,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exportText: { color: '#fff', fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  targetButton: {
    marginTop: 12,
    backgroundColor: '#1f6feb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  targetButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
