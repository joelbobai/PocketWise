import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FloatingButton } from '@/components/FloatingButton';
import { TransactionItem } from '@/components/TransactionItem';
import { getTransactions } from '@/lib/storage';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function DashboardScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadTransactions = useCallback(async () => {
    const stored = await getTransactions();
    setTransactions(stored);
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
});
