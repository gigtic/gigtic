import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function CreateJobScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Basic Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} placeholder="e.g. Need help with React project" />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Describe what you need help with..." multiline />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Budget Amount (INR)</Text>
        <TextInput style={styles.input} placeholder="500" keyboardType="numeric" />
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Continue to Logistics</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F9FAFB' },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#2563EB', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
