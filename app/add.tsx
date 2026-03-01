import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getCategories, saveTransaction } from '@/lib/storage';
import { TransactionType } from '@/lib/types';

export default function AddTransactionScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadCategories = async () => {
        const items = await getCategories();
        setCategories(items);
        if (!category && items.length) {
          setCategory(items[0]);
        }
      };

      void loadCategories();
    }, [category]),
  );

  const parsedAmount = useMemo(() => Number.parseFloat(amount), [amount]);

  const handleSave = async () => {
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter an amount greater than 0.');
      return;
    }

    if (!category) {
      Alert.alert('Missing category', 'Please select a category.');
      return;
    }

    const dateValue = new Date(date);
    if (Number.isNaN(dateValue.getTime())) {
      Alert.alert('Invalid date', 'Please use YYYY-MM-DD format.');
      return;
    }

    await saveTransaction({
      id: `${Date.now()}`,
      amount: parsedAmount,
      description: description.trim(),
      category,
      type,
      date: dateValue.toISOString(),
    });

    Alert.alert('Saved', 'Transaction saved successfully.');
    router.replace('/transactions');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Lunch, Salary, etc."
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2026-03-01"
          autoCapitalize="none"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Type</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.option, type === 'expense' && styles.optionActive]}
            onPress={() => setType('expense')}>
            <Text style={[styles.optionText, type === 'expense' && styles.optionTextActive]}>Expense</Text>
          </Pressable>
          <Pressable
            style={[styles.option, type === 'income' && styles.optionActive]}
            onPress={() => setType('income')}>
            <Text style={[styles.optionText, type === 'income' && styles.optionTextActive]}>Income</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryWrap}>
          {categories.map((item) => (
            <Pressable
              key={item}
              style={[styles.categoryChip, category === item && styles.categoryChipActive]}
              onPress={() => setCategory(item)}>
              <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Transaction</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    marginBottom: 8,
    marginTop: 8,
    color: '#334155',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  optionText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#fff',
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  categoryText: {
    color: '#111827',
  },
  categoryTextActive: {
    color: '#fff',
  },
  saveButton: {
    marginTop: 22,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
