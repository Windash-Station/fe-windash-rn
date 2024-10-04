import "react-native-url-polyfill/auto";
import { Stack } from "expo-router";
import { AppProvider } from './AppContext';
  
const RootLayout = () => {
  return (
        <AppProvider>
        <Stack>
          <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        </AppProvider>
  );
};

export default RootLayout;
