import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(800).springify().damping(16)} style={styles.content}>
        <View style={styles.iconContainer}>
          <Sparkles color="#2563EB" size={32} />
        </View>
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.subtitle}>
          We're brewing up something amazing for the Explore tab. Get ready to discover new gigs like never before!
        </Text>
        
        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Notify Me</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' },
  content: { 
    alignItems: 'center', 
    padding: 32, 
    backgroundColor: '#fff', 
    borderRadius: 36, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 24 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 48, 
    elevation: 8, 
    borderWidth: 1, 
    borderColor: '#F3F4F6', 
    width: '85%' 
  },
  iconContainer: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 24,
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '900', color: '#111827', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24, fontWeight: '500', marginBottom: 28 },
  button: { 
    backgroundColor: '#111827', 
    paddingVertical: 16,
    paddingHorizontal: 32, 
    borderRadius: 100, 
    alignItems: 'center', 
    shadowColor: '#111827', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 16, 
    elevation: 6,
    width: '100%'
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
