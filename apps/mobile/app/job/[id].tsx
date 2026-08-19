import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../utils/supabase';
import { ArrowLeft, User, MessageSquare, MapPin } from 'lucide-react-native';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*, requester:requester_id(username, trust_score)')
        .eq('id', id)
        .single();
      setJob(data);
      setLoading(false);
    };
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Job not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{job.status}</Text>
        </View>

        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.budget}>₹{job.budget_amount}</Text>

        {job.location_name && (
          <View style={styles.locationContainer}>
            <MapPin color="#6B7280" size={16} />
            <Text style={styles.locationText}>{job.location_name}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{job.description}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Posted By</Text>
        <View style={styles.creatorCard}>
          <View style={styles.avatar}>
            <User color="#fff" size={20} />
          </View>
          <View>
            <Text style={styles.creatorName}>{job.requester?.username || 'Student'}</Text>
            <Text style={styles.trustScore}>Trust Score: {job.requester?.trust_score || 100}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push(`/chat?job=${job.id}`)}
        >
          <MessageSquare color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.actionText}>Message to Apply</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  iconButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  content: { padding: 24, paddingBottom: 100 },
  statusBadge: { alignSelf: 'flex-start', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 16 },
  statusText: { fontSize: 12, fontWeight: '800', color: '#4B5563', textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: '900', color: '#111827', marginBottom: 8 },
  budget: { fontSize: 24, fontWeight: '800', color: '#059669', marginBottom: 16 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  locationText: { fontSize: 14, color: '#6B7280', fontWeight: '600', marginLeft: 6 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 12 },
  description: { fontSize: 16, color: '#4B5563', lineHeight: 24 },
  creatorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  creatorName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  trustScore: { fontSize: 14, color: '#6B7280', fontWeight: '500', marginTop: 4 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  actionButton: { flexDirection: 'row', backgroundColor: '#111827', paddingVertical: 16, borderRadius: 100, justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  backButton: { padding: 12, backgroundColor: '#111827', borderRadius: 8 },
  backButtonText: { color: '#fff', fontWeight: 'bold' }
});
