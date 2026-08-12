import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const MOCK_JOBS = [
  { id: '1', title: 'Need help moving out of dorm', price: 300, distance: 1.2, isUrgent: true, category: 'Physical' },
  { id: '2', title: 'React Native debugging', price: 500, distance: 0, isUrgent: false, category: 'Digital' },
];

export default function ExploreFeed() {
  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_JOBS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            {item.isUrgent && <Text style={styles.urgentBadge}>SOS / URGENT</Text>}
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.price}>₹{item.price}</Text>
            </View>
            <View style={styles.tagsRow}>
              <Text style={styles.tag}>{item.category}</Text>
              <Text style={styles.tag}>{item.distance === 0 ? 'Anywhere' : `${item.distance} km`}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  urgentBadge: { backgroundColor: '#DC2626', color: '#fff', fontSize: 10, fontWeight: 'bold', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111827', flex: 1 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#16A34A', marginLeft: 8 },
  tagsRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  tag: { backgroundColor: '#EFF6FF', color: '#1D4ED8', fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' }
});
