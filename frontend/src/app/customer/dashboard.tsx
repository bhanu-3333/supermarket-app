import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, FlatList } from 'react-native';
import { Colors } from '../../constants/theme';

export default function CustomerDashboard() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const dummyProducts = [
    { id: '1', name: 'Fresh Apples', price: '$2.99/lb', category: 'Fruits' },
    { id: '2', name: 'Whole Milk', price: '$3.49', category: 'Dairy' },
    { id: '3', name: 'Whole Wheat Bread', price: '$2.49', category: 'Bakery' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.surface,
    },
    header: {
      backgroundColor: theme.primary,
      padding: 20,
      paddingTop: 40,
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.textInverse,
    },
    scanButton: {
      backgroundColor: theme.secondary,
      padding: 15,
      borderRadius: 50,
      alignItems: 'center',
      margin: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },
    scanButtonText: {
      color: theme.textInverse,
      fontSize: 18,
      fontWeight: 'bold',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginLeft: 20,
      marginTop: 10,
      marginBottom: 10,
    },
    productCard: {
      backgroundColor: theme.background,
      padding: 15,
      marginHorizontal: 20,
      marginBottom: 10,
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    productName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    productPrice: {
      fontSize: 14,
      color: theme.primary,
      marginTop: 5,
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Smart Checkout</Text>
      </View>

      <TouchableOpacity style={styles.scanButton}>
        <Text style={styles.scanButtonText}>📸 Scan Barcode</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Featured Products</Text>
      
      <FlatList
        data={dummyProducts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price}</Text>
            </View>
            <TouchableOpacity style={{ padding: 10, backgroundColor: theme.surface, borderRadius: 5 }}>
              <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
