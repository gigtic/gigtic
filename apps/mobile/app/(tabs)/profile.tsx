import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../utils/supabase';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>V</Text>
        </View>
        <Text style={styles.nickname}>@Vini</Text>
        <Text style={styles.trustScore}>Trust Score: 92/100</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 24, alignItems: 'center' },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#9CA3AF' },
  nickname: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  trustScore: { fontSize: 16, color: '#16A34A', marginTop: 8, fontWeight: '600' },
  logoutButton: { backgroundColor: '#EF4444', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 8, width: '100%', alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
