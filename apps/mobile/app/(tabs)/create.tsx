import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft, FadeInDown } from 'react-native-reanimated';
import { supabase } from '../../utils/supabase';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, MapPin, CheckCircle2, ChevronRight, Zap } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';

export default function CreateJobScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [pincode, setPincode] = useState("");
  const [radius, setRadius] = useState("5");
  const [isUrgent, setIsUrgent] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [coordinates, setCoordinates] = useState({ lat: 20.5937, lng: 78.9629 });
  const [mapRegion, setMapRegion] = useState({ latitude: 20.5937, longitude: 78.9629, latitudeDelta: 10, longitudeDelta: 10 });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from('users').select('username').eq('id', user.id).single();
      if (!data || !data.username) {
        Alert.alert("Profile Required", "Please set up your profile and username before posting a gig!");
        router.push('/profile');
      }
    });
  }, []);

  const handlePincodeChange = async (text: string) => {
    setPincode(text);
    if (text.length === 6) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${text}&country=india&format=json`);
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCoordinates({ lat, lng: lon });
          setMapRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        }
      } catch (err) {}
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!title || !description || !budget || !pincode) return Alert.alert("Error", "Please fill all fields.");
    setLoading(true);
    
    const { data: newJob, error } = await supabase.from('jobs').insert({
      requester_id: userId, title, category: 'Physical', description, service_mode: 'Physical',
      radius_km: parseInt(radius), exchange_preference: 'DecideInChat', budget_amount: parseFloat(budget),
      is_urgent: isUrgent, status: 'OPEN', location: `POINT(${coordinates.lng} ${coordinates.lat})`
    }).select('id').single();

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    if (imageUri && newJob) {
      try {
        const ext = imageUri.split('.').pop();
        const fileName = `${Date.now()}.${ext}`;
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        const { error: uploadError } = await supabase.storage.from('gig-images').upload(`public/${newJob.id}/${fileName}`, blob, { contentType: 'image/jpeg' });
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('gig-images').getPublicUrl(`public/${newJob.id}/${fileName}`);
          await supabase.from('jobs').update({ image_urls: [publicUrlData.publicUrl] }).eq('id', newJob.id);
        }
      } catch (err) {}
    }

    setLoading(false);
    Alert.alert("Success", "Gig Posted!");
    router.push('/');
  };

  const StepIndicator = ({ num }: { num: number }) => (
    <View style={[styles.stepCircle, step === num && styles.stepCircleActive, step > num && styles.stepCircleCompleted]}>
      {step > num ? <CheckCircle2 color="#fff" size={16} /> : <Text style={[styles.stepText, step === num && styles.stepTextActive]}>{num}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.Text entering={FadeInDown.delay(100).springify()} style={styles.header}>Post a Gig</Animated.Text>
        
        {/* Stepper */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepperLine} />
          <View style={[styles.stepperProgress, { width: `${((step - 1) / 2) * 100}%` }]} />
          <View style={styles.stepsRow}>
            <StepIndicator num={1} />
            <StepIndicator num={2} />
            <StepIndicator num={3} />
          </View>
        </View>

        <View style={styles.card}>
          {step === 1 && (
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
              <Text style={styles.cardTitle}>What do you need help with?</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gig Title</Text>
                <TextInput style={styles.input} placeholder="e.g. Move 3 boxes" value={title} onChangeText={setTitle} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="Describe the task in detail..." multiline value={description} onChangeText={setDescription} />
              </View>
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
              <Text style={styles.cardTitle}>Where is this happening?</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Pincode</Text>
                <TextInput style={styles.input} placeholder="6-digit pincode" keyboardType="numeric" maxLength={6} value={pincode} onChangeText={handlePincodeChange} />
              </View>
              <View style={styles.mapContainer}>
                <MapView style={styles.map} region={mapRegion} onRegionChangeComplete={(r) => { setMapRegion(r); setCoordinates({ lat: r.latitude, lng: r.longitude }); }}>
                  <Marker coordinate={{ latitude: coordinates.lat, longitude: coordinates.lng }} />
                </MapView>
                <View style={styles.mapOverlay} pointerEvents="none"><MapPin color="#000" size={32} /></View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Radius (km)</Text>
                <TextInput style={styles.input} placeholder="5" keyboardType="numeric" value={radius} onChangeText={setRadius} />
              </View>
            </Animated.View>
          )}

          {step === 3 && (
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
              <Text style={styles.cardTitle}>Budget & Media</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Budget Amount (₹)</Text>
                <TextInput style={styles.input} placeholder="500" keyboardType="numeric" value={budget} onChangeText={setBudget} />
              </View>
              <TouchableOpacity style={[styles.urgentBtn, isUrgent && styles.urgentBtnActive]} onPress={() => setIsUrgent(!isUrgent)}>
                <Zap color={isUrgent ? "#DC2626" : "#6B7280"} size={20} />
                <Text style={[styles.urgentText, isUrgent && styles.urgentTextActive]}>Mark as SOS Emergency</Text>
              </TouchableOpacity>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Attach Image (Optional)</Text>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                  {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} /> : (
                    <View style={styles.imagePlaceholder}>
                      <Camera color="#9CA3AF" size={24} />
                      <Text style={styles.imagePickerText}>Tap to select image</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>

        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          {step < 3 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(step + 1)}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <ChevronRight color="#fff" size={20} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Publish Gig</Text>}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  header: { fontSize: 32, fontWeight: '900', color: '#111827', marginBottom: 24, textAlign: 'center' },
  stepperContainer: { position: 'relative', marginBottom: 32, paddingHorizontal: 20 },
  stepperLine: { position: 'absolute', top: 16, left: 36, right: 36, height: 2, backgroundColor: '#E5E7EB' },
  stepperProgress: { position: 'absolute', top: 16, left: 36, height: 2, backgroundColor: '#111827' },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { borderColor: '#111827', backgroundColor: '#111827' },
  stepCircleCompleted: { borderColor: '#111827', backgroundColor: '#111827' },
  stepText: { fontSize: 12, fontWeight: '800', color: '#9CA3AF' },
  stepTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 5, borderWidth: 1, borderColor: '#F3F4F6' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, fontSize: 16, backgroundColor: '#F9FAFB', fontWeight: '500' },
  textArea: { height: 120, textAlignVertical: 'top' },
  mapContainer: { height: 200, width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  map: { width: '100%', height: '100%' },
  mapOverlay: { position: 'absolute', top: '50%', left: '50%', marginTop: -16, marginLeft: -16 },
  urgentBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, marginBottom: 20, gap: 12 },
  urgentBtnActive: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  urgentText: { fontWeight: '700', color: '#6B7280', fontSize: 16 },
  urgentTextActive: { color: '#DC2626' },
  imagePickerBtn: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, overflow: 'hidden', backgroundColor: '#F9FAFB' },
  imagePlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center', gap: 8 },
  imagePickerText: { color: '#9CA3AF', fontWeight: '600' },
  previewImage: { width: '100%', height: 180, resizeMode: 'cover' },
  footer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  backBtn: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16, justifyContent: 'center' },
  backBtnText: { color: '#6B7280', fontWeight: '800', fontSize: 16 },
  nextBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#111827', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  submitBtn: { flex: 1, backgroundColor: '#111827', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' }
});
