import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { Sparkles, MapPin, ChevronRight, Clock } from 'lucide-react-native';

export default function ExploreScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, requester:requester_id(nickname, trust_score)')
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false });

      if (data) setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const renderJobCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      onPress={() => router.push(`/job/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.budgetBadge}>
          <Text style={styles.budgetText}>₹{item.budget_amount}</Text>
        </View>
        <Text style={styles.timeText}>
          <Clock size={12} color="#9CA3AF" /> {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.requester?.nickname?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{item.requester?.nickname || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.detailsButton} onPress={() => router.push(`/job/${item.id}`)}>
          <Text style={styles.detailsText}>View</Text>
          <ChevronRight size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Gigs</Text>
        <Text style={styles.headerSubtitle}>Find tasks near your campus</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderJobCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Sparkles size={40} color="#9CA3AF" />
              <Text style={styles.emptyText}>No gigs available right now.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#111827' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', fontWeight: '500', marginTop: 4 },
  listContent: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#F3F4F6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  budgetBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#D1FAE5' },
  budgetText: { color: '#059669', fontWeight: '800', fontSize: 14 },
  timeText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#4B5563' },
  userName: { fontSize: 14, fontWeight: '700', color: '#374151' },
  detailsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
  detailsText: { color: '#fff', fontWeight: '700', fontSize: 14, marginRight: 4 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#6B7280', fontWeight: '500' }
});
