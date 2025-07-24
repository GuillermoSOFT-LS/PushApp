import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
      <Stack screenOptions={{headerShadowVisible: false}}>
           <Stack.Screen
               name='index'
               options={{
                   title: 'Push App',
               }} />
      </Stack>
  );
}
