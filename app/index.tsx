import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FloatingButton } from '@/components/FloatingButton';
import { TransactionItem } from '@/components/TransactionItem';
import { getSavingsTarget, getTransactions } from '@/lib/storage';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function DashboardScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsTarget, setSavingsTarget] = useState(0);

  const loadTransactions = useCallback(async () => {
    const [storedTransactions, storedTarget] = await Promise.all([
      getTransactions(),
      getSavingsTarget(),
    ]);
    setTransactions(storedTransactions);
    setSavingsTarget(storedTarget);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTransactions();
    }, [loadTransactions])
  );

  const { income, expense, balance } = useMemo(() => {
    const totals = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }

        return acc;
      },
      { income: 0, expense: 0 }
    );

    return {
      income: totals.income,
      expense: totals.expense,
      balance: totals.income - totals.expense,
    };
  }, [transactions]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const monthlyExpenses = useMemo(
    () =>
      transactions.filter((item) => {
        const transactionDate = new Date(item.date);
        return (
          item.type === 'expense' &&
          transactionDate.getFullYear() === currentYear &&
          transactionDate.getMonth() === currentMonth
        );
      }),
    [transactions, currentYear, currentMonth]
  );

  const topCategory = useMemo(() => {
    const grouped = new Map<string, number>();
    monthlyExpenses.forEach((item) => {
      grouped.set(item.category, (grouped.get(item.category) || 0) + item.amount);
    });

    let best: { category: string; amount: number } | null = null;
    grouped.forEach((amount, category) => {
      if (!best || amount > best.amount) {
        best = { category, amount };
      }
    });

    return best;
  }, [monthlyExpenses]);

  const averageDailyExpense = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const total = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);
    return total / Math.max(currentDay, 1);
  }, [monthlyExpenses]);

  const savingsProgress = useMemo(() => {
    if (!savingsTarget) {
      return 0;
    }

    return Math.min((Math.max(balance, 0) / savingsTarget) * 100, 100);
  }, [balance, savingsTarget]);

  const recent = useMemo(() => transactions.slice(0, 5), [transactions]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Total Balance</Text>
          <Text style={styles.balance}>{formatCurrency(balance)}</Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Income</Text>
              <Text style={[styles.value, { color: '#1f9d55' }]}>{formatCurrency(income)}</Text>
            </View>
            <View>
              <Text style={styles.label}>Expense</Text>
              <Text style={[styles.value, { color: '#d93025' }]}>{formatCurrency(expense)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable onPress={() => router.push('/summary')} style={styles.actionButton}>
            <Text style={styles.actionText}>View Summary</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/transactions')} style={styles.actionButton}>
            <Text style={styles.actionText}>All Transactions</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/categories')} style={styles.actionButton}>
            <Text style={styles.actionText}>Categories</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/calendar')} style={styles.actionButton}>
            <Text style={styles.actionText}>Calendar</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Savings Target</Text>
          <Text style={styles.label}>Target: {formatCurrency(savingsTarget || 0)}</Text>
          <Text style={styles.value}>Progress: {savingsProgress.toFixed(0)}%</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${savingsProgress}%` }]} />
          </View>
          <Pressable onPress={() => router.push('/summary')} style={styles.inlineButton}>
            <Text style={styles.inlineButtonText}>Set Target</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Insights (This Month)</Text>
          <Text style={styles.metricRow}>
            Top expense category:{' '}
            <Text style={styles.metricStrong}>
              {topCategory ? `${topCategory.category} (${formatCurrency(topCategory.amount)})` : 'N/A'}
            </Text>
          </Text>
          <Text style={styles.metricRow}>
            Average daily expense:{' '}
            <Text style={styles.metricStrong}>{formatCurrency(averageDailyExpense)}</Text>
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recent.map((transaction) => (
          <TransactionItem key={transaction.id} onDelete={() => {}} transaction={transaction} />
        ))}
        {!recent.length ? <Text style={styles.empty}>No transactions yet.</Text> : null}
      </ScrollView>
      <FloatingButton onPress={() => router.push('/add')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  title: { color: '#6b7280', fontSize: 14 },
  balance: { fontSize: 32, fontWeight: '700', color: '#111827', marginTop: 8 },
  row: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#6b7280', fontSize: 13 },
  value: { fontSize: 18, fontWeight: '600', marginTop: 4 },
  actionsRow: { marginTop: 16, gap: 10 },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  actionText: { color: '#1f6feb', fontWeight: '600', fontSize: 15 },
  sectionTitle: { marginVertical: 16, fontSize: 18, fontWeight: '700', color: '#111827' },
  empty: { color: '#6b7280' },
  progressTrack: {
    marginTop: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  inlineButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  inlineButtonText: { color: '#fff', fontWeight: '600' },
  metricRow: { color: '#374151', fontSize: 15, marginTop: 6 },
  metricStrong: { fontWeight: '700', color: '#111827' },
});
