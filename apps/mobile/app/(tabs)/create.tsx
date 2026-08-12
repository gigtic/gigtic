import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../utils/supabase';
import { router } from 'expo-router';

export default function CreateJobScreen() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [pincode, setPincode] = useState("");
  const [radius, setRadius] = useState("5");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const handleSubmit = async () => {
    if (!title || !description || !budget || !pincode) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    setLoading(true);
    
    const { error } = await supabase.from('jobs').insert({
      requester_id: userId,
      title,
      category: 'Physical',
      description,
      is_incognito: false,
      is_women_only: false,
      service_mode: 'Physical',
      radius_km: parseInt(radius),
      exchange_preference: 'DecideInChat',
      budget_amount: parseFloat(budget),
      is_urgent: false,
      status: 'OPEN'
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Gig Posted!");
      setTitle(""); setDescription(""); setBudget(""); setPincode("");
      router.push('/');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Post a Gig</Text>
      
      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gig Title</Text>
          <TextInput style={styles.input} placeholder="e.g. Move 3 boxes" value={title} onChangeText={setTitle} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Describe the task..." multiline value={description} onChangeText={setDescription} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Pincode</Text>
          <TextInput style={styles.input} placeholder="6-digit pincode" keyboardType="numeric" maxLength={6} value={pincode} onChangeText={setPincode} />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Radius (km)</Text>
          <TextInput style={styles.input} placeholder="5" keyboardType="numeric" value={radius} onChangeText={setRadius} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Budget Amount (₹)</Text>
          <TextInput style={styles.input} placeholder="500" keyboardType="numeric" value={budget} onChangeText={setBudget} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Publish Gig</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  header: { fontSize: 32, fontWeight: '900', color: '#111827', marginBottom: 24 },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, fontSize: 16, backgroundColor: '#F9FAFB', fontWeight: '500' },
  textArea: { height: 120, textAlignVertical: 'top' },
  button: { backgroundColor: '#000', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '900' }
});
