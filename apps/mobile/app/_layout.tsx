import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '../utils/supabase';
import { StatusBar } from 'expo-status-bar';
import { registerForPushNotificationsAsync } from '../utils/push';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Register for push notifications if logged in
        registerForPushNotificationsAsync();
        
        if (segments[0] !== '(tabs)') {
          router.replace('/(tabs)');
        }
      } else {
        router.replace('/login');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        registerForPushNotificationsAsync();
        if (segments[0] !== '(tabs)') {
          router.replace('/(tabs)');
        }
      } else {
        router.replace('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
