import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
          // A simple circle icon as a placeholder
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Post Job',
          tabBarLabel: 'Post',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: color, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color, fontSize: 16, fontWeight: 'bold' }}>+</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chats',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 16, borderRadius: 4, borderWidth: 2, borderColor: color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: color }} />
          ),
        }}
      />
    </Tabs>
  );
}
