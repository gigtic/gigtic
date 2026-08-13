import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Dimensions } from 'react-native';
import { supabase } from '../../utils/supabase';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, MapPin } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';

export default function CreateJobScreen() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [pincode, setPincode] = useState("");
  const [radius, setRadius] = useState("5");
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [coordinates, setCoordinates] = useState({ lat: 20.5937, lng: 78.9629 }); // Default India
  const [mapRegion, setMapRegion] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
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
          setMapRegion({
            latitude: lat,
            longitude: lon,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      } catch (err) {
        console.log("Geocoding error", err);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !budget || !pincode) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    setLoading(true);
    
    // Ensure the user's profile record exists to prevent foreign key errors
    await supabase.from('users').upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });

    // 1. Insert Job first
    const { data: newJob, error } = await supabase.from('jobs').insert({
      requester_id: userId,
      title,
      category: 'Physical',
      description,
      is_incognito: false,
      service_mode: 'Physical',
      radius_km: parseInt(radius),
      exchange_preference: 'DecideInChat',
      budget_amount: parseFloat(budget),
      is_urgent: false,
      status: 'OPEN',
      location: `POINT(${coordinates.lng} ${coordinates.lat})`
    }).select('id').single();

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    // 2. Upload Image if selected
    if (imageUri && newJob) {
      try {
        const ext = imageUri.split('.').pop();
        const fileName = `${Date.now()}.${ext}`;
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        const { error: uploadError } = await supabase.storage
          .from('gig-images')
          .upload(`public/${newJob.id}/${fileName}`, blob, {
            contentType: 'image/jpeg',
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('gig-images')
            .getPublicUrl(`public/${newJob.id}/${fileName}`);
            
          await supabase.from('jobs')
            .update({ image_urls: [publicUrlData.publicUrl] })
            .eq('id', newJob.id);
        }
      } catch (err) {
        console.log("Image upload failed", err);
      }
    }

    setLoading(false);
    Alert.alert("Success", "Gig Posted!");
    setTitle(""); setDescription(""); setBudget(""); setPincode(""); setImageUri(null);
    router.push('/');
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
          <Text style={styles.label}>Attach Image (Optional)</Text>
          <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera color="#9CA3AF" size={24} />
                <Text style={styles.imagePickerText}>Tap to select image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Pincode</Text>
          <TextInput 
            style={styles.input} 
            placeholder="6-digit pincode" 
            keyboardType="numeric" 
            maxLength={6} 
            value={pincode} 
            onChangeText={handlePincodeChange} 
          />
          <Text style={styles.helpText}>Enter pincode to auto-locate, or drag the map below.</Text>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={(region) => {
              setMapRegion(region);
              setCoordinates({ lat: region.latitude, lng: region.longitude });
            }}
          >
            <Marker coordinate={{ latitude: coordinates.lat, longitude: coordinates.lng }} />
          </MapView>
          <View style={styles.mapOverlay} pointerEvents="none">
             <MapPin color="#000" size={32} />
          </View>
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
  helpText: { fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, fontSize: 16, backgroundColor: '#F9FAFB', fontWeight: '500' },
  textArea: { height: 120, textAlignVertical: 'top' },
  imagePickerBtn: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, overflow: 'hidden', backgroundColor: '#F9FAFB' },
  imagePlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center', gap: 8 },
  imagePickerText: { color: '#9CA3AF', fontWeight: '600' },
  previewImage: { width: '100%', height: 180, resizeMode: 'cover' },
  mapContainer: { height: 200, width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB', position: 'relative' },
  map: { width: '100%', height: '100%' },
  mapOverlay: { position: 'absolute', top: '50%', left: '50%', marginTop: -16, marginLeft: -16 },
  button: { backgroundColor: '#000', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '900' }
});
