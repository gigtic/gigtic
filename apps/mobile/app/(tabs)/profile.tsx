import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../utils/supabase';
import { ShieldCheck } from 'lucide-react-native';

export default function ProfileScreen() {
  const [profile, setProfile] = useState({
    real_name: '',
    nickname: '',
    bio: '',
    trust_score: 100
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    
    const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();
    if (data) {
      setProfile({
        real_name: data.real_name || '',
        nickname: data.nickname || '',
        bio: data.bio || '',
        trust_score: data.trust_score || 100
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from('users').upsert({
      id: userId,
      real_name: profile.real_name,
      nickname: profile.nickname,
      bio: profile.bio,
      updated_at: new Date().toISOString()
    });

    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Profile saved securely!');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#000" /></View>;
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </Animated.View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200).springify().damping(14)} style={styles.card}>
          <View style={styles.trustBadge}>
            <ShieldCheck color="#2563EB" size={24} style={{marginRight: 8}} />
            <View>
              <Text style={styles.trustTitle}>TRUST SCORE</Text>
              <Text style={styles.trustScore}>{profile.trust_score}<Text style={styles.trustMax}>/100</Text></Text>
            </View>
          </View>
          
          <View style={styles.form}>
            <Text style={styles.label}>Real Name (Private)</Text>
            <TextInput 
              style={styles.input} 
              value={profile.real_name}
              onChangeText={(txt) => setProfile({...profile, real_name: txt})}
              placeholder="John Doe"
            />

            <Text style={styles.label}>Nickname (Public)</Text>
            <TextInput 
              style={styles.input} 
              value={profile.nickname}
              onChangeText={(txt) => setProfile({...profile, nickname: txt})}
              placeholder="JohnnyD"
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={profile.bio}
              onChangeText={(txt) => setProfile({...profile, bio: txt})}
              placeholder="I can fix your laptop..."
              multiline
            />

            <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Profile</Text>}
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#111827' },
  content: { padding: 20, paddingBottom: 60 },
  card: { backgroundColor: '#fff', padding: 28, borderRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.08, shadowRadius: 32, elevation: 5, borderWidth: 1, borderColor: '#F3F4F6' },
  trustBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 20, borderRadius: 20, width: '100%', marginBottom: 24 },
  trustTitle: { fontSize: 10, fontWeight: '800', color: '#2563EB', letterSpacing: 1 },
  trustScore: { fontSize: 24, fontWeight: '900', color: '#111827' },
  trustMax: { fontSize: 16, color: '#9CA3AF' },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, fontSize: 16, backgroundColor: '#F9FAFB', fontWeight: '500', marginBottom: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: { marginTop: 8, padding: 18, borderRadius: 16, backgroundColor: '#111827', alignItems: 'center', shadowColor: '#111827', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  logoutBtn: { marginTop: 24, padding: 18, borderRadius: 16, backgroundColor: '#FEF2F2', alignItems: 'center', borderWidth: 1, borderColor: '#FEE2E2' },
  logoutText: { color: '#DC2626', fontSize: 16, fontWeight: '800' }
});
