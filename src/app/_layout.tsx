import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0d2d6e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'CidadeAlerta' }} />
      <Stack.Screen name="register" options={{ title: 'Nova Ocorrência' }} />
      <Stack.Screen name="list" options={{ title: 'Ocorrências' }} />
      <Stack.Screen name="detail" options={{ title: 'Detalhe' }} />
      <Stack.Screen name="map" options={{ title: 'Mapa de Ocorrências' }} />
    </Stack>
  );
}