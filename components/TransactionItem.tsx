import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { RectButton } from 'react-native-gesture-handler';

import { Transaction } from '@/lib/types';

type TransactionItemProps = {
  transaction: Transaction;
  onDelete: (id: string) => void;
};

function TransactionItemComponent({ transaction, onDelete }: TransactionItemProps) {
  const amountSign = transaction.type === 'income' ? '+' : '-';
  const amountColor = transaction.type === 'income' ? '#16a34a' : '#dc2626';

  return (
    <Swipeable
      friction={2}
      rightThreshold={40}
      renderRightActions={() => (
        <RectButton style={styles.deleteButton} onPress={() => onDelete(transaction.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </RectButton>
      )}>
      <View style={styles.card}>
        <View>
          <Text style={styles.category}>{transaction.category}</Text>
          <Text style={styles.description}>{transaction.description || 'No description'}</Text>
          <Text style={styles.date}>{new Date(transaction.date).toLocaleDateString()}</Text>
        </View>

        <Text style={[styles.amount, { color: amountColor }]}>
          {amountSign}${transaction.amount.toFixed(2)}
        </Text>
      </View>
    </Swipeable>
  );
}

export const TransactionItem = memo(TransactionItemComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  category: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    color: '#4b5563',
  },
  date: {
    marginTop: 4,
    fontSize: 12,
    color: '#9ca3af',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    borderRadius: 14,
    marginBottom: 12,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '700',
  },
});
