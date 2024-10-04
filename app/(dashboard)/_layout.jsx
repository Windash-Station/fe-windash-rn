import { Stack } from "expo-router";

const DashboardLayout = () => {
  return (
        <Stack>
          <Stack.Screen name="M1" options={{ headerShown: false }} />
          <Stack.Screen name="U1_analog" options={{ headerShown: false }} />
          <Stack.Screen name="U2_RS485_2" options={{ headerShown: false }} />
        </Stack>
  );
};

export default DashboardLayout;
