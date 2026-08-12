import { View, Text, StyleSheet } from 'react-native';

export default function ChatListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Chats</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No active chats yet.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#6B7280', fontSize: 16 }
});
