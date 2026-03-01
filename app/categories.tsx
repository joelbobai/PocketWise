import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CategoryItem } from '@/components/CategoryItem';
import { getCategories, saveCategory } from '@/lib/storage';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const loadData = useCallback(async () => {
    const items = await getCategories();
    setCategories(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const onAdd = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Missing name', 'Please enter a category name.');
      return;
    }

    await saveCategory(newCategory);
    setNewCategory('');
    await loadData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          value={newCategory}
          onChangeText={setNewCategory}
          placeholder="Add a custom category"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />
        <Pressable style={styles.button} onPress={onAdd}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <CategoryItem category={item} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 12,
  },
  form: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    padding: 16,
  },
});
