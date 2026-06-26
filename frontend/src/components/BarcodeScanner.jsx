import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { wp, hp, moderateScale } from '../utils/responsive';

export default function BarcodeScanner({ visible, onScan, onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    
    setScanned(true);
    
    // Vibrate device
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        console.log('Haptics not available');
      }
    }
    
    // Call the onScan callback with the barcode data
    onScan(data);
    
    // Reset scanned state after a short delay
    setTimeout(() => {
      setScanned(false);
    }, 500);
  };

  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={80} color="#999" />
          <Text style={styles.permissionText}>
            Camera permission is required to scan products
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButtonAlt} onPress={handleClose}>
            <Text style={styles.closeButtonAltText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: [
              'ean13',
              'ean8',
              'upc_a',
              'upc_e',
              'code128',
              'qr',
            ],
          }}
          onBarcodeScanned={handleBarCodeScanned}
        >
          {/* Top Overlay */}
          <View style={styles.topOverlay}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <View style={styles.closeButtonCircle}>
                <Ionicons name="close" size={28} color="#111" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Scanner Area */}
          <View style={styles.scannerArea}>
            {/* Top Dark Overlay */}
            <View style={styles.darkOverlay} />

            {/* Scanner Frame */}
            <View style={styles.scannerFrame}>
              <View style={styles.scannerBox}>
                {/* Corner Brackets */}
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />

                {/* Scanning Line Animation */}
                <View style={styles.scanLine} />
              </View>

              <Text style={styles.instructionText}>Scan Product Barcode</Text>
              <Text style={styles.subText}>
                Position barcode within the frame
              </Text>
            </View>

            {/* Bottom Dark Overlay */}
            <View style={styles.darkOverlay} />
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: wp(8),
  },
  permissionText: {
    fontSize: moderateScale(16),
    color: '#666',
    textAlign: 'center',
    marginTop: hp(3),
    marginBottom: hp(4),
    lineHeight: moderateScale(24),
  },
  permissionButton: {
    backgroundColor: '#123F7A',
    borderRadius: moderateScale(25),
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(10),
    marginBottom: hp(2),
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  closeButtonAlt: {
    paddingVertical: hp(1.5),
  },
  closeButtonAltText: {
    color: '#666',
    fontSize: moderateScale(16),
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: hp(6),
    paddingHorizontal: wp(5),
    zIndex: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeButtonCircle: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scannerArea: {
    flex: 1,
    justifyContent: 'space-around',
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scannerFrame: {
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  scannerBox: {
    width: wp(75),
    height: hp(30),
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: moderateScale(30),
    height: moderateScale(30),
    borderColor: '#fff',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  instructionText: {
    color: '#fff',
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    marginTop: hp(3),
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subText: {
    color: '#fff',
    fontSize: moderateScale(14),
    marginTop: hp(1),
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
