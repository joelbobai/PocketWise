import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { TransactionItem } from '@/components/TransactionItem';
import { deleteTransaction, getCategories, getTransactions } from '@/lib/storage';
import { Transaction } from '@/lib/types';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | Transaction['type']>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const load = useCallback(async () => {
    const [data, storedCategories] = await Promise.all([getTransactions(), getCategories()]);
    setTransactions(data);
    setCategories(storedCategories);
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

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((item) => {
        const matchesQuery =
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase());
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

        return matchesQuery && matchesType && matchesCategory;
      }),
    [transactions, query, typeFilter, categoryFilter]
  );

  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={setQuery}
        placeholder="Search description or category"
        style={styles.searchInput}
        value={query}
      />

      <View style={styles.filterRow}>
        {(['all', 'income', 'expense'] as const).map((type) => (
          <Pressable
            key={type}
            onPress={() => setTypeFilter(type)}
            style={[styles.filterChip, typeFilter === type && styles.filterChipActive]}>
            <Text style={[styles.filterText, typeFilter === type && styles.filterTextActive]}>{type}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
        data={['all', ...categories]}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setCategoryFilter(item)}
            style={[styles.filterChip, categoryFilter === item && styles.filterChipActive]}>
            <Text style={[styles.filterText, categoryFilter === item && styles.filterTextActive]}>{item}</Text>
          </Pressable>
        )}
      />

      <FlatList
        contentContainerStyle={styles.list}
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem onDelete={handleDelete} transaction={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No transactions available.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  list: { paddingBottom: 20, paddingTop: 8 },
  empty: { color: '#6b7280' },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  filterChip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  filterChipActive: { backgroundColor: '#1f6feb', borderColor: '#1f6feb' },
  filterText: { color: '#374151', textTransform: 'capitalize' },
  filterTextActive: { color: '#fff' },
  categoryList: { maxHeight: 52 },
});
