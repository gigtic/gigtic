import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../utils/supabase';
import { MapPin, ShieldCheck, Clock } from 'lucide-react-native';

export default function ExploreFeed() {
  const [jobs, setJobs] = useState<any[]>([]);
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

    const { data, error } = await supabase.rpc('get_explore_feed', { p_user_id: user.id });
    if (data) setJobs(data);
    setLoading(false);
  };

  const handleApply = async (jobId: string) => {
    if (!userId) return;
    const { error } = await supabase.from('jobs')
      .update({ provider_id: userId, status: 'ASSIGNED' })
      .eq('id', jobId);
      
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Job Accepted! Check your Chats.');
      fetchJobs();
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Gigs</Text>
        <Text style={styles.headerSubtitle}>Discover students near you</Text>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.is_urgent && (
              <View style={styles.urgentBadge}>
                <Clock color="#B91C1C" size={12} style={{marginRight: 4}} />
                <Text style={styles.urgentText}>SOS URGENT</Text>
              </View>
            )}
            
            <View style={styles.cardHeader}>
              <View style={{flex: 1}}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
              </View>
              <Text style={styles.price}>₹{item.budget_amount}</Text>
            </View>

            <View style={styles.tagsRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.requester_nickname}</Text>
              </View>
              <View style={styles.tag}>
                <ShieldCheck color="#2563EB" size={14} style={{marginRight: 4}} />
                <Text style={[styles.tagText, {color: '#2563EB'}]}>{item.requester_trust_score} Trust</Text>
              </View>
              <View style={styles.tag}>
                <MapPin color="#4B5563" size={14} style={{marginRight: 4}} />
                <Text style={styles.tagText}>
                  {item.service_mode === 'Physical' ? `${item.distance_km.toFixed(1)} km` : 'Digital'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.acceptButton} onPress={() => handleApply(item.id)}>
              <Text style={styles.acceptButtonText}>Accept Job</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No gigs found in your area.</Text>
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
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
  urgentBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  urgentText: { color: '#B91C1C', fontSize: 10, fontWeight: '900' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  price: { fontSize: 24, fontWeight: '900', color: '#111827', marginLeft: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tagText: { color: '#4B5563', fontSize: 12, fontWeight: '700' },
  acceptButton: { backgroundColor: '#000', padding: 16, borderRadius: 16, alignItems: 'center' },
  acceptButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 16, fontWeight: '500', textAlign: 'center' }
});
