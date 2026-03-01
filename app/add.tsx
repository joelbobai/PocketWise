import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getCategories, saveTransaction } from '@/lib/storage';
import { Transaction } from '@/lib/types';

const getToday = () => new Date().toISOString().slice(0, 10);

export default function AddTransactionScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [type, setType] = useState<Transaction['type']>('expense');
  const [date, setDate] = useState(getToday());

  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      const stored = await getCategories();
      if (!mounted) {
        return;
      }
      setCategories(stored);
      setCategory((current) => current || stored[0] || 'Food');
    };

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const parsedAmount = useMemo(() => Number(amount), [amount]);

  const onSave = async () => {
    if (!parsedAmount || parsedAmount <= 0 || !description.trim() || !category.trim()) {
      Alert.alert('Invalid transaction', 'Please fill in all fields with valid values.');
      return;
    }

    const isoDate = new Date(date);
    if (Number.isNaN(isoDate.getTime())) {
      Alert.alert('Invalid date', 'Please use YYYY-MM-DD format.');
      return;
    }

    const transaction: Transaction = {
      id: `${Date.now()}`,
      amount: parsedAmount,
      description: description.trim(),
      category,
      type,
      date: isoDate.toISOString(),
    };

    try {
      await saveTransaction(transaction);
      router.back();
    } catch {
      Alert.alert('Save failed', 'Unable to save transaction locally.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setAmount}
          placeholder="0.00"
          style={styles.input}
          value={amount}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          onChangeText={setDescription}
          placeholder="e.g. Grocery shopping"
          style={styles.input}
          value={description}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryWrap}>
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[styles.chip, item === category && styles.chipActive]}>
              <Text style={[styles.chipText, item === category && styles.chipTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          {(['income', 'expense'] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setType(item)}
              style={[styles.toggle, type === item && styles.toggleActive]}>
              <Text style={[styles.toggleText, type === item && styles.toggleTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Date</Text>
        <TextInput onChangeText={setDate} placeholder="YYYY-MM-DD" style={styles.input} value={date} />

        <Pressable onPress={onSave} style={styles.saveButton}>
          <Text style={styles.saveText}>Save Transaction</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
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
  label: { color: '#6b7280', marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: '#1f6feb', borderColor: '#1f6feb' },
  chipText: { color: '#374151' },
  chipTextActive: { color: '#fff' },
  typeRow: { flexDirection: 'row', gap: 10 },
  toggle: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleActive: { backgroundColor: '#111827', borderColor: '#111827' },
  toggleText: { textTransform: 'capitalize', color: '#374151' },
  toggleTextActive: { color: '#fff' },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#1f6feb',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  saveText: { color: '#fff', fontWeight: '700' },
});
