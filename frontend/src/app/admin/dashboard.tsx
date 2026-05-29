import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';

export default function AdminDashboard() {
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
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCard: {
      backgroundColor: theme.background,
      width: '48%',
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
    statTitle: {
      fontSize: 14,
      color: theme.text,
      opacity: 0.8,
    },
    statValue: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.primary,
      marginTop: 10,
    },
    actionButton: {
      backgroundColor: theme.primary,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    actionText: {
      color: theme.textInverse,
      fontWeight: 'bold',
      fontSize: 16,
    }
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Welcome, Admin</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Total Revenue</Text>
          <Text style={styles.statValue}>$12,450</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Orders Today</Text>
          <Text style={styles.statValue}>142</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Low Stock Items</Text>
          <Text style={[styles.statValue, { color: theme.error }]}>8</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Active Users</Text>
          <Text style={styles.statValue}>890</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionText}>Manage Users</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.secondary }]}>
        <Text style={styles.actionText}>View Inventory</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
