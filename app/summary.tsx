import { useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { PieChart, buildPieData } from '@/components/PieChart';
import { getTransactions, toCsv } from '@/lib/storage';
import { Transaction } from '@/lib/types';

const monthLabel = new Date().toLocaleString(undefined, { month: 'long', year: 'numeric' });

export default function SummaryScreen() {
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

  const monthlyTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((item) => {
      const date = new Date(item.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  }, [transactions]);

  const summary = useMemo(() => {
    const income = monthlyTransactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const expenseItems = monthlyTransactions.filter((item) => item.type === 'expense');
    const expense = expenseItems.reduce((sum, item) => sum + item.amount, 0);

    const byCategory = expenseItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    return { income, expense, balance: income - expense, byCategory };
  }, [monthlyTransactions]);

  const pieData = useMemo(() => buildPieData(summary.byCategory), [summary.byCategory]);

  const exportCsv = async () => {
    if (!transactions.length) {
      Alert.alert('No data', 'There are no transactions to export.');
      return;
    }

    const csv = toCsv(transactions);
    const fileUri = `${FileSystem.cacheDirectory}pocketwise-transactions.csv`;

    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      return;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export transactions CSV',
      UTI: 'public.comma-separated-values-text',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>{monthLabel}</Text>

        <Text style={styles.metric}>Income: ${summary.income.toFixed(2)}</Text>
        <Text style={styles.metric}>Expense: ${summary.expense.toFixed(2)}</Text>
        <Text style={[styles.metric, styles.balance]}>Balance: ${summary.balance.toFixed(2)}</Text>

        <PieChart data={pieData} />
      </View>

      <Pressable style={styles.exportButton} onPress={() => void exportCsv()}>
        <Text style={styles.exportText}>Export CSV</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  metric: {
    color: '#334155',
    fontSize: 15,
    marginTop: 4,
  },
  balance: {
    marginTop: 8,
    fontWeight: '700',
    color: '#0f172a',
  },
  exportButton: {
    marginTop: 14,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  exportText: {
    color: '#fff',
    fontWeight: '700',
  },
});
