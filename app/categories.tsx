import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CategoryItem } from '@/components/CategoryItem';
import { deleteCategory, getCategories, getDefaultCategories, saveCategory } from '@/lib/storage';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const load = useCallback(async () => {
    const stored = await getCategories();
    setCategories(stored);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onAdd = async () => {
    if (!newCategory.trim()) {
      return;
    }

    await saveCategory(newCategory);
    setNewCategory('');
    await load();
  };

  const onDelete = async (category: string) => {
    await deleteCategory(category);
    await load();
  };

  const defaults = getDefaultCategories();

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          onChangeText={setNewCategory}
          placeholder="Add new category"
          style={styles.input}
          value={newCategory}
        />
        <Pressable onPress={onAdd} style={styles.addButton}>
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <CategoryItem
            canDelete={!defaults.includes(item)}
            category={item}
            onDelete={(category) => {
              Alert.alert('Delete category', `Remove ${category}?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => void onDelete(category) },
              ]);
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#1f6feb',
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addText: { color: '#fff', fontWeight: '700' },
  list: { marginTop: 16, paddingBottom: 20 },
});
