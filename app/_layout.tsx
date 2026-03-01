import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerTintColor: '#111827',
          headerStyle: { backgroundColor: '#fff' },
          contentStyle: { backgroundColor: '#f8fafc' },
        }}>
        <Stack.Screen name="index" options={{ title: 'PocketWise' }} />
        <Stack.Screen name="add" options={{ title: 'Add Transaction' }} />
        <Stack.Screen name="transactions" options={{ title: 'Transactions' }} />
        <Stack.Screen name="categories" options={{ title: 'Categories' }} />
        <Stack.Screen name="summary" options={{ title: 'Monthly Summary' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
