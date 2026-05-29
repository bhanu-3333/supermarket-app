import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';

export default function StaffDashboard() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.surface,
      padding: 15,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 20,
    },
    actionCard: {
      backgroundColor: theme.background,
      padding: 20,
      borderRadius: 10,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    actionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 5,
    },
    actionDesc: {
      fontSize: 14,
      color: theme.text,
      opacity: 0.8,
    }
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Staff Portal</Text>
      
      <TouchableOpacity style={styles.actionCard}>
        <Text style={styles.actionTitle}>➕ Add Product</Text>
        <Text style={styles.actionDesc}>Scan barcode to add new inventory</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard}>
        <Text style={styles.actionTitle}>📦 Update Stock</Text>
        <Text style={styles.actionDesc}>Manage existing product quantities</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionCard}>
        <Text style={styles.actionTitle}>⚠️ Low Stock Alerts</Text>
        <Text style={[styles.actionDesc, { color: theme.error }]}>3 items need immediate restocking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
