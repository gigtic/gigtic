import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../utils/supabase';
import { router } from 'expo-router';
import { User } from 'lucide-react-native';

export default function ChatListScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data, error } = await supabase
      .from("conversations")
      .select("*, job:job_id(title, status), requester:requester_id(id, nickname), worker:worker_id(id, nickname)")
      .or(`requester_id.eq.${user.id},worker_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
      
    if (data) setConversations(data);
    setLoading(false);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#000" size="large" /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Chats</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isCreator = userId === item.requester_id;
          const otherPerson = isCreator ? item.worker : item.requester;
          
          return (
            <TouchableOpacity 
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(item.is_dm ? `/chat/dm_${otherPerson?.id}` : `/chat/${item.id}?jobId=${item.job_id}`)}
            >
              <View style={styles.avatar}>
                <User size={24} color="#fff" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.is_dm ? `DM with ${otherPerson?.nickname}` : item.job?.title}
                </Text>
                <Text style={styles.subtext}>
                  {item.is_dm ? "Friends" : (isCreator ? "Chatting with" : "Job by")} {otherPerson?.nickname || 'User'}
                </Text>
              </View>
              {!item.is_dm && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.job?.status}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>You have no active chats.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#111827' },
  list: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 24, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1, marginRight: 8 },
  title: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subtext: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  statusBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusText: { fontSize: 10, fontWeight: '800', color: '#4B5563', textTransform: 'uppercase' },
  empty: { padding: 40, alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#9CA3AF', fontSize: 16, fontWeight: '600' }
});
