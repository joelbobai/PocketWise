import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { TransactionItem } from '@/components/TransactionItem';
import { deleteTransaction, getTransactions } from '@/lib/storage';
import { Transaction } from '@/lib/types';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const load = useCallback(async () => {
    const data = await getTransactions();
    setTransactions(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    await load();
  };

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.list}
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem onDelete={handleDelete} transaction={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No transactions available.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  list: { paddingBottom: 20 },
  empty: { color: '#6b7280' },
});
