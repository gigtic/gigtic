import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../utils/supabase';
import { ShieldCheck } from 'lucide-react-native';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading || !profile) {
    return <View style={styles.center}><ActivityIndicator color="#000" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.nickname?.charAt(1).toUpperCase()}</Text>
          </View>
          
          <Text style={styles.name}>{profile.nickname}</Text>
          <Text style={styles.subtext}>Default Radius: {profile.default_radius_km} km</Text>

          <View style={styles.trustBadge}>
            <ShieldCheck color="#2563EB" size={24} style={{marginRight: 8}} />
            <View>
              <Text style={styles.trustTitle}>TRUST SCORE</Text>
              <Text style={styles.trustScore}>{profile.trust_score}<Text style={styles.trustMax}>/100</Text></Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#111827' },
  content: { padding: 20 },
  card: { backgroundColor: '#fff', padding: 30, borderRadius: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '900' },
  name: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 4 },
  subtext: { fontSize: 14, color: '#6B7280', fontWeight: '500', marginBottom: 24 },
  trustBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 16, borderRadius: 20, width: '100%' },
  trustTitle: { fontSize: 10, fontWeight: '800', color: '#2563EB', letterSpacing: 1 },
  trustScore: { fontSize: 24, fontWeight: '900', color: '#111827' },
  trustMax: { fontSize: 16, color: '#9CA3AF' },
  logoutBtn: { marginTop: 24, padding: 16, borderRadius: 16, backgroundColor: '#FEE2E2', alignItems: 'center' },
  logoutText: { color: '#DC2626', fontSize: 16, fontWeight: '800' }
});
