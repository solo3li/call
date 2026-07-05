import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Animated, Easing, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { Button } from '../../components/ui/Button';
import { Theme } from '../../constants/Theme';
import { mockExtractData } from '../../api/ocr';
import { Ionicons } from '@expo/vector-icons';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTorchEnabled, setIsTorchEnabled] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  
  // Animation value for the scanner line
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Loop the scanning animation up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanAnim]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={Theme.colors.text} style={{ marginBottom: 20 }} />
        <Text style={styles.message}>نحتاج إلى إذن الكاميرا لمسح الطلبات وتوثيقها</Text>
        <Button onPress={requestPermission} title="منح إذن الكاميرا" style={styles.permissionBtn} />
      </View>
    );
  }

  const toggleTorch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTorchEnabled(!isTorchEnabled);
  };

  const pickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsProcessing(true);
        const photoUri = result.assets[0].uri;
        setCapturedImage(photoUri);
        
        // Simulate processing delay for the cool animation and send to OCR
        const extractedData = await mockExtractData(photoUri);
        
        // Success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        router.push({
          pathname: '/verification',
          params: { data: JSON.stringify(extractedData), imageUri: photoUri }
        });
      }
    } catch (e) {
      console.error(e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setCapturedImage(null);
    } finally {
      setIsProcessing(false);
      setCapturedImage(null); // Reset when returning
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      if (photo) {
        setCapturedImage(photo.uri);
        // Simulate processing delay for the cool animation and send to OCR
        const extractedData = await mockExtractData(photo.uri);
        
        // Success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        router.push({
          pathname: '/verification',
          params: { data: JSON.stringify(extractedData), imageUri: photo.uri }
        });
      }
    } catch (e) {
      console.error(e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setCapturedImage(null);
    } finally {
      setIsProcessing(false);
      setCapturedImage(null); // Reset when returning to camera
    }
  };

  // The distance the laser line moves
  const laserTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 180], // Adjust based on cutout size
  });

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing="back" 
        ref={cameraRef}
        enableTorch={isTorchEnabled}
      >
        {/* Full-screen Overlay with Transparent Cutout */}
        <View style={styles.overlay}>
          {/* Top Mask */}
          <View style={styles.mask} />
          {/* Middle Row with Cutout */}
          <View style={styles.middleRow}>
            <View style={styles.mask} />
            {/* The Cutout */}
            <View style={styles.cutout}>
              {/* Corner Accents */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Animated Laser Line */}
              <Animated.View style={[styles.laserLine, { transform: [{ translateY: laserTranslateY }] }]} />
            </View>
            <View style={styles.mask} />
          </View>
          {/* Bottom Mask */}
          <View style={styles.mask} />
        </View>

        {/* Controls Overlay */}
        <View style={styles.controlsContainer}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleTorch}>
              <Ionicons name={isTorchEnabled ? "flash" : "flash-off"} size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.instructionText}>ضع الفاتورة داخل الإطار</Text>
            <View style={{ width: 52 }} /> {/* Spacer to center the text */}
          </View>

          {/* Bottom Controls (Capture Button & Gallery) */}
          <View style={styles.bottomControls}>
            <View style={styles.galleryButtonPlaceholder} /> {/* Spacer to center the shutter */}
            
            <TouchableOpacity style={styles.captureButtonOuter} onPress={takePicture} disabled={isProcessing}>
              <View style={[styles.captureButtonInner, isProcessing && styles.captureButtonDisabled]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.galleryButton} onPress={pickImage} disabled={isProcessing}>
              <Ionicons name="images" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {/* Processing State Overlay */}
      {isProcessing && capturedImage && (
        <BlurView intensity={90} tint="dark" style={styles.processingOverlay}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} blurRadius={10} />
          <View style={styles.processingContent}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={styles.processingText}>جاري تحليل الطلب...</Text>
            <Text style={styles.processingSubText}>عبر الذكاء الاصطناعي</Text>
            
            {/* Animated Laser over the preview panel */}
            <Animated.View style={[styles.processingLaser, { transform: [{ translateY: laserTranslateY }] }]} />
          </View>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionBtn: {
    marginTop: 20,
    minWidth: 200,
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    fontFamily: Theme.typography.fontFamilyBold,
    fontSize: 18,
    color: Theme.colors.text,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mask: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
  },
  middleRow: {
    flexDirection: 'row',
    height: 400, // Height of the cutout
    width: '100%',
  },
  cutout: {
    width: 320, // Width of the cutout
    height: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Theme.colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderBottomRightRadius: 16,
  },
  laserLine: {
    width: '100%',
    height: 3,
    backgroundColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingSafeArea: true,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  instructionText: {
    color: 'white',
    fontFamily: Theme.typography.fontFamilyBold,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bottomControls: {
    paddingBottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  galleryButtonPlaceholder: {
    width: 60,
  },
  galleryButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  captureButtonOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },
  captureButtonDisabled: {
    backgroundColor: '#ccc',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  processingContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    width: 300,
    overflow: 'hidden',
  },
  processingText: {
    color: 'white',
    fontFamily: Theme.typography.fontFamilyBold,
    fontSize: 18,
    marginTop: 20,
  },
  processingSubText: {
    color: Theme.colors.textMuted,
    fontFamily: Theme.typography.fontFamily,
    fontSize: 14,
    marginTop: 8,
  },
  processingLaser: {
    width: '150%',
    height: 3,
    backgroundColor: Theme.colors.primary,
    position: 'absolute',
    opacity: 0.7,
  }
});
