import { StyleSheet, Text, View } from 'react-native';

type CategoryItemProps = {
  category: string;
};

export function CategoryItem({ category }: CategoryItemProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{category}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  text: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '600',
  },
});
