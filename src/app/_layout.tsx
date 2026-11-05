import { Stack } from 'expo-router/stack';
import '../db/database';
import { colors } from '../theme/colors';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="add-trip" options={{ title: 'Add Trip' }} />
      <Stack.Screen name="trip/[id]" options={{ title: 'Trip Details' }} />
      <Stack.Screen name="cards" options={{ title: 'My Cards' }} />
      <Stack.Screen name="add-card" options={{ title: 'Add Card' }} />
      <Stack.Screen name="card/[id]" options={{ title: 'Card' }} />
    </Stack>
  );
}
