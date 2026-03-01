import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { getTransactions } from '@/lib/storage';
import { Transaction } from '@/lib/types';

export default function DashboardScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadData = useCallback(async () => {
    const items = await getTransactions();
    setTransactions(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    const expense = transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Your Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Total Balance</Text>
        <Text style={styles.balance}>${totals.balance.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.label}>Income</Text>
          <Text style={[styles.value, { color: '#16a34a' }]}>${totals.income.toFixed(2)}</Text>
        </View>

        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.label}>Expense</Text>
          <Text style={[styles.value, { color: '#dc2626' }]}>${totals.expense.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => router.push('/transactions')}>
          <Text style={styles.buttonText}>View Transactions</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => router.push('/summary')}>
          <Text style={styles.buttonText}>View Summary</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => router.push('/categories')}>
          <Text style={styles.buttonText}>Manage Categories</Text>
        </Pressable>
      </View>

      <Pressable style={styles.fab} onPress={() => router.push('/add')}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  halfCard: {
    flex: 1,
  },
  label: {
    color: '#64748b',
    fontSize: 13,
  },
  balance: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: '700',
    color: '#0f172a',
  },
  value: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '700',
  },
  actions: {
    marginTop: 6,
    gap: 10,
  },
  button: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    marginTop: -2,
  },
});
