import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../utils/supabase';
import { ShieldCheck, User, LogOut, Camera, Save, MapPin } from 'lucide-react-native';

export default function ProfileScreen() {
  const [profile, setProfile] = useState({
    real_name: '', nickname: '', bio: '', age: '', phone_number: '',
    status: 'Student', gender: 'Unspecified', default_radius_km: '5', trust_score: 100
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
    
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
    if (data) {
      setProfile({
        real_name: data.real_name || '', nickname: data.nickname || '', bio: data.bio || '',
        age: data.age ? data.age.toString() : '', phone_number: data.phone_number || '',
        status: data.status || 'Student', gender: data.gender || 'Unspecified',
        default_radius_km: data.default_radius_km ? data.default_radius_km.toString() : '5',
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
      real_name: profile.real_name, nickname: profile.nickname, bio: profile.bio,
      age: profile.age ? parseInt(profile.age) : null,
      phone_number: profile.phone_number, status: profile.status, gender: profile.gender,
      default_radius_km: profile.default_radius_km ? parseInt(profile.default_radius_km) : 5,
      updated_at: new Date().toISOString()
    });

    setSaving(false);
    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Success', 'Profile saved securely!');
  };

  const handleLogout = async () => await supabase.auth.signOut();

  if (loading) return <View style={styles.center}><ActivityIndicator color="#000" /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {/* Header Banner */}
        <View style={styles.banner}>
          <TouchableOpacity style={styles.logoutBtnSm} onPress={handleLogout}>
            <LogOut color="#DC2626" size={16} />
            <Text style={styles.logoutTextSm}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarBg}>
            <View style={styles.avatarInner}>
              <User color="#9CA3AF" size={48} />
              <View style={styles.cameraIcon}><Camera color="#fff" size={16} /></View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).springify().damping(14)} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Public Profile</Text>
                <Text style={styles.cardSub}>How other students see you.</Text>
              </View>
              <View style={styles.trustBadge}>
                <ShieldCheck color="#16A34A" size={24} />
              </View>
            </View>
            
            <View style={styles.form}>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Real Name</Text>
                  <TextInput style={styles.input} value={profile.real_name} onChangeText={(txt) => setProfile({...profile, real_name: txt})} placeholder="John Doe" />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Nickname</Text>
                  <TextInput style={styles.input} value={profile.nickname} onChangeText={(txt) => setProfile({...profile, nickname: txt})} placeholder="JohnnyD" />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput style={styles.input} value={profile.phone_number} onChangeText={(txt) => setProfile({...profile, phone_number: txt})} placeholder="99999 00000" keyboardType="phone-pad" />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput style={styles.input} value={profile.age} onChangeText={(txt) => setProfile({...profile, age: txt})} placeholder="18" keyboardType="numeric" />
                </View>
              </View>

              <Text style={styles.label}>Bio</Text>
              <TextInput style={[styles.input, styles.textArea]} value={profile.bio} onChangeText={(txt) => setProfile({...profile, bio: txt})} placeholder="I am a CS major, I can fix your laptop..." multiline />

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Preferences</Text>
              
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Radius (km)</Text>
                  <TextInput style={styles.input} value={profile.default_radius_km} onChangeText={(txt) => setProfile({...profile, default_radius_km: txt})} placeholder="5" keyboardType="numeric" />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Save color="#fff" size={20} />
                    <Text style={styles.saveText}>Save Profile</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  banner: { height: 160, backgroundColor: '#111827', width: '100%', position: 'relative' },
  logoutBtnSm: { position: 'absolute', top: 60, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  logoutTextSm: { color: '#DC2626', fontWeight: '800', fontSize: 14 },
  avatarContainer: { alignItems: 'center', marginTop: -60, marginBottom: 20, zIndex: 10 },
  avatarBg: { backgroundColor: '#fff', padding: 6, borderRadius: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  avatarInner: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cameraIcon: { position: 'absolute', bottom: 0, backgroundColor: '#111827', padding: 8, borderRadius: 20 },
  content: { padding: 20, paddingBottom: 60 },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 5, borderWidth: 1, borderColor: '#F3F4F6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  cardTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  cardSub: { fontSize: 14, color: '#6B7280', fontWeight: '500', marginTop: 2 },
  trustBadge: { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: '#DCFCE7' },
  form: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  halfWidth: { flex: 1 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, fontSize: 15, backgroundColor: '#F9FAFB', fontWeight: '500', marginBottom: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 16 },
  saveBtn: { marginTop: 8, padding: 18, borderRadius: 16, backgroundColor: '#111827', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: '#111827', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
