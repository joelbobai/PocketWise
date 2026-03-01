import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

type FloatingButtonProps = {
  onPress: () => void;
};

export function FloatingButton({ onPress }: FloatingButtonProps) {
  return (
    <Pressable accessibilityLabel="Add transaction" onPress={onPress} style={styles.button}>
      <Ionicons color="#fff" name="add" size={28} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1f6feb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
});
