import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { wp, hp, moderateScale } from '../utils/responsive';

export default function DeleteConfirmationModal({ 
  visible, 
  onConfirm, 
  onCancel, 
  title = "Are You Sure want to delete this Product?",
  buttonText = "Delete"
}) {
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
          <Text style={styles.title}>{title}</Text>
          
          <TouchableOpacity style={styles.deleteButton} onPress={onConfirm}>
            <Text style={styles.deleteButtonText}>{buttonText}</Text>
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
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: moderateScale(25),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(12),
    width: '100%',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
