import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function StaffManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/admin/staff', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (data.success) setStaff(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!newStaff.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    if (newStaff.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setCreating(true);
    try {
      const { data } = await api.post('/admin/staff', newStaff, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (data.success) {
        Alert.alert('Success', 'Staff member created successfully');
        setModalVisible(false);
        setNewStaff({ name: '', email: '', password: '' });
        fetchStaff();
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create staff');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStaff = (staffId, staffName) => {
    Alert.alert('Delete Staff', `Are you sure you want to delete ${staffName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/staff/${staffId}`, {
              headers: { Authorization: `Bearer ${user?.token}` },
            });
            fetchStaff();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete staff');
          }
        },
      },
    ]);
  };

  const renderStaff = ({ item }) => (
    <View style={styles.staffCard}>
      <View style={styles.staffLeft}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color="#123F7A" />
        </View>
        <View>
          <Text style={styles.staffName}>{item.name}</Text>
          <Text style={styles.staffEmail}>{item.email}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteStaff(item._id, item.name)}
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#123F7A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff Management</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#123F7A" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#123F7A" style={{ marginTop: 40 }} />
      ) : staff.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No staff members yet</Text>
          <TouchableOpacity style={styles.addStaffButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addStaffButtonText}>Add Staff Member</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={staff}
          renderItem={renderStaff}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Staff Member</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Name :</Text>
            <TextInput
              style={styles.input}
              placeholder="eg : John Doe"
              placeholderTextColor="#999"
              value={newStaff.name}
              onChangeText={(text) => setNewStaff({ ...newStaff, name: text })}
            />

            <Text style={styles.label}>Email :</Text>
            <TextInput
              style={styles.input}
              placeholder="eg : john@gmail.com"
              placeholderTextColor="#999"
              value={newStaff.email}
              onChangeText={(text) => setNewStaff({ ...newStaff, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password :</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 characters"
              placeholderTextColor="#999"
              value={newStaff.password}
              onChangeText={(text) => setNewStaff({ ...newStaff, password: text })}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateStaff}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Create Staff</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111' },
  addButton: { padding: 8 },
  list: { padding: width * 0.05 },
  staffCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  staffLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffName: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 4 },
  staffEmail: { fontSize: 13, color: '#666' },
  deleteButton: { padding: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#888', marginBottom: 20 },
  addStaffButton: {
    backgroundColor: '#123F7A',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addStaffButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: width * 0.05,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  label: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#F3F7FA',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 14,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#123F7A',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
