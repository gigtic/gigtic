import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../utils/supabase';

export default function ChatListScreen() {
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data } = await supabase.from('jobs')
      .select('*')
      .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)
      .in('status', ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'])
      .order('created_at', { ascending: false });
    
    if (data) setActiveJobs(data);
    setLoading(false);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#000" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>

      <FlatList
        data={activeJobs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.price}>₹{item.budget_amount}</Text>
            </View>
            <View style={styles.tagsRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.requester_id === userId ? 'Hiring' : 'Working'}</Text>
              </View>
              <View style={[styles.tag, item.status === 'COMPLETED' ? styles.tagCompleted : styles.tagProgress]}>
                <Text style={[styles.tagText, item.status === 'COMPLETED' ? styles.textCompleted : styles.textProgress]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.subtext}>Tap to open chat and complete handshake</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No active chats.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#111827' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827', flex: 1, marginRight: 10 },
  price: { fontSize: 18, fontWeight: '900', color: '#111827' },
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, fontWeight: '800', color: '#4B5563' },
  tagCompleted: { backgroundColor: '#DCFCE7' },
  textCompleted: { color: '#15803D' },
  tagProgress: { backgroundColor: '#FEF9C3' },
  textProgress: { color: '#A16207' },
  subtext: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 16, fontWeight: '500' }
});
