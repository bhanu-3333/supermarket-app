import { View, Text, StyleSheet } from 'react-native';

export default function CustomerCart() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Shopping Cart</Text>
      <Text style={styles.sub}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 22, fontWeight: 'bold', color: '#0A3B7C' },
  sub: { fontSize: 14, color: '#888', marginTop: 8 },
});
