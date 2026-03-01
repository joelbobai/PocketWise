import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

type TransactionItemProps = {
  transaction: Transaction;
  onDelete: (id: string) => void;
};

export function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const color = transaction.type === 'income' ? '#1f9d55' : '#d93025';

  return (
    <Swipeable
      renderRightActions={() => (
        <Pressable onPress={() => onDelete(transaction.id)} style={styles.deleteAction}>
          <Ionicons color="#fff" name="trash-outline" size={22} />
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      )}>
      <View style={styles.card}>
        <View>
          <Text style={styles.description}>{transaction.description}</Text>
          <Text style={styles.meta}>{transaction.category}</Text>
          <Text style={styles.meta}>{formatDate(transaction.date)}</Text>
        </View>
        <Text style={[styles.amount, { color }]}>
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  meta: {
    marginTop: 2,
    color: '#6b7280',
    fontSize: 13,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteAction: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    borderRadius: 16,
    marginBottom: 12,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    marginTop: 4,
  },
});
