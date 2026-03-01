import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type CategoryItemProps = {
  category: string;
  canDelete: boolean;
  onDelete: (category: string) => void;
};

export function CategoryItem({ category, canDelete, onDelete }: CategoryItemProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{category}</Text>
      {canDelete ? (
        <Pressable onPress={() => onDelete(category)} style={styles.iconButton}>
          <Ionicons color="#ef4444" name="trash-outline" size={20} />
        </Pressable>
      ) : (
        <Text style={styles.defaultTag}>Default</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  iconButton: {
    padding: 4,
  },
  defaultTag: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: 12,
  },
});
