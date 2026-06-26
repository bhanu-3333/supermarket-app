import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { wp, hp, moderateScale } from '../utils/responsive';

export default function LogoutModal({ visible, onConfirm, onCancel }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onCancel}
      >
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1}
          onPress={() => {}}
        >
          <Text style={styles.title}>Are You sure want to{'\n'}Logout</Text>
          
          <TouchableOpacity style={styles.logoutButton} onPress={onConfirm}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: wp(8),
    width: wp(80),
    maxWidth: 350,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  title: {
    fontSize: moderateScale(18),
    color: '#111827',
    textAlign: 'center',
    marginBottom: hp(3),
    lineHeight: moderateScale(26),
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: moderateScale(25),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(12),
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
