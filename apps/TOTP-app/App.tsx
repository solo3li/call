import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Vibration,
  Platform,
  Alert,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
  Image
} from 'react-native';
import { CameraView, useCameraPermissions, scanFromURLAsync } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import jsQR from 'jsqr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { 
  Scan, 
  ShieldCheck, 
  Clock, 
  LogOut, 
  Store, 
  RefreshCw,
  Camera as CameraIcon,
  Image as ImageIcon,
  Globe,
  Copy
} from 'lucide-react-native';
import { generateAlphanumericTotp, getRemainingSeconds } from './utils/totp';

declare var require: any;

// Neo-Brutalist Design Tokens (FoodyBoard: The Energetic Kitchen Ledger)
const COLORS = {
  primary: '#FF6B35', // Chef Orange
  secondary: '#448AFF', // Brand Blue (Secondary highlights)
  success: '#00E676', // Success Green
  warning: '#FFD700', // Warning Yellow
  danger: '#FF1744', // Brand Red (Alerts/Cancel)
  bgStart: '#FFFBEB', // Paper Beige Background
  bgEnd: '#FFFBEB',
  cardBg: '#FFFFFF', // Solid White Cards
  cardBorder: '#1A1A1A', // Ink Black Borders
  textPrimary: '#1A1A1A', // Ink Black Text
  textSecondary: '#555555', // Charcoal Dark Text
  textMuted: '#777777', // Muted Gray Text
};

// Bilingual Support
const TRANSLATIONS = {
  en: {
    appName: 'BoardToken',
    welcomeTitle: 'Secure Access Portal',
    welcomeDesc: 'Scan your personal QR code from the BoardToken dashboard to pair your account and start generating secure tokens.',
    startScan: 'Scan QR Code',
    pickGallery: 'Choose from Gallery',
    cameraPermissionTitle: 'Camera Permission Required',
    cameraPermissionDesc: 'BoardToken needs access to your camera to scan QR codes for secure verification.',
    grantBtn: 'Grant Permission',
    fromGallery: 'From Gallery',
    cancel: 'Cancel',
    unpairTitle: 'Delete Account',
    unpairConfirm: 'Are you sure you want to unpair this device? You will need to scan the QR code again to regain access.',
    unpairBtn: 'Unpair Device',
    scannerHint: 'Align QR Code within the frame',
    totpHeader: 'Your Secure Token',
    totpFooter: 'Enter this 10-char token on the login screen',
    timeLeftText: 'Expires in:',
    manualRefresh: 'Force Rotate',
    scanNewCode: 'Scan New',
    successPairing: 'BoardToken Paired Successfully!',
    invalidQr: 'Invalid QR code. Please scan a valid BoardToken setup QR code.',
    noQrFound: 'No QR code detected in the selected image.',
    mobileGalleryAlert: 'For security, scanning with the live camera is recommended on mobile devices.',
    errorProcessing: 'Error processing the image.',
    footerText: 'BoardToken Security System',
    seconds: 's',
    minutes: 'm',
    ok: 'OK',
    alertTitle: 'Alert',
    warningTitle: 'Warning',
    errorTitle: 'Error',
    pairedText: 'Device Paired',
    unpairingText: 'Unpairing Account',
    copyCode: 'Copy Code',
    copied: 'Copied!',
  },
  ar: {
    appName: 'بورد توكن',
    welcomeTitle: 'بوابة الدخول الآمنة',
    welcomeDesc: 'امسح رمز QR المخصص لك من لوحة تحكم BoardToken لربط حسابك والبدء في إنشاء رموز الدخول.',
    startScan: 'مسح رمز QR',
    pickGallery: 'اختيار من المعرض',
    cameraPermissionTitle: 'مطلوب إذن الكاميرا',
    cameraPermissionDesc: 'يحتاج BoardToken إلى الوصول إلى الكاميرا لمسح رموز QR لضمان عملية التحقق الآمنة.',
    grantBtn: 'منح الإذن',
    fromGallery: 'من المعرض',
    cancel: 'إلغاء',
    unpairTitle: 'إلغاء ربط الحساب',
    unpairConfirm: 'هل أنت متأكد من حذف الحساب من هذا الجهاز؟ ستحتاج لمسح رمز QR مجدداً للدخول.',
    unpairBtn: 'إلغاء الربط',
    scannerHint: 'ضع رمز QR داخل الإطار المخصص',
    totpHeader: 'رمز الدخول الخاص بك',
    totpFooter: 'أدخل هذا الرمز المكون من 10 خانات في صفحة الدخول',
    timeLeftText: 'تنتهي الصلاحية خلال:',
    manualRefresh: 'تحديث يدوي',
    scanNewCode: 'مسح رمز جديد',
    successPairing: 'تم ربط BoardToken بنجاح!',
    invalidQr: 'الرمز الممسوح غير صالح. يرجى مسح رمز QR من لوحة تحكم BoardToken.',
    noQrFound: 'لم يتم العثور على رمز QR في الصورة المختارة.',
    mobileGalleryAlert: 'لدواعي الأمان، يوصى باستخدام الكاميرا مباشرة على أجهزة الجوال.',
    errorProcessing: 'حدث خطأ أثناء معالجة الصورة.',
    footerText: 'نظام بورد توكن الآمن',
    seconds: 'ثانية',
    minutes: 'دقيقة',
    ok: 'حسناً',
    alertTitle: 'تنبيه',
    warningTitle: 'تحذير',
    errorTitle: 'خطأ',
    pairedText: 'تم ربط الجهاز',
    unpairingText: 'إلغاء ربط الحساب',
    copyCode: 'نسخ الرمز',
    copied: 'تم النسخ!',
  }
};

export default function App() {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scanned, setHasScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [authData, setAuthData] = useState<{ secret: string, name: string, issuer: string } | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  // Animation values for Premium Splash Screen
  const [splashVisible, setSplashVisible] = useState(true);
  const splashFade = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoGlow = useRef(new Animated.Value(0.5)).current;

  // Language translation helper
  const t = TRANSLATIONS[lang];

  // Splash Screen & Font Loading & Glow Loops
  useEffect(() => {
    // Dynamic Google Fonts loading for Cairo on web platform
    if (Platform.OS === 'web') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&display=swap';
      document.head.appendChild(link);
    }

    // Pulse glow/opacity animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlow, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(logoGlow, {
          toValue: 0.5,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();

    // Scale up logo
    Animated.timing(logoScale, {
      toValue: 1.0,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.5)),
    }).start();

    // Fade out splash screen after 2.5s
    const timer = setTimeout(() => {
      Animated.timing(splashFade, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setSplashVisible(false);
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Load stored secret and language on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Update TOTP code and timer
  useEffect(() => {
    if (!authData) return;

    const updateCode = () => {
      const code = generateAlphanumericTotp(authData.secret);
      setTotpCode(code);
      setTimeLeft(getRemainingSeconds());
    };

    updateCode();
    let prevRemaining = getRemainingSeconds();
    const interval = setInterval(() => {
      const remaining = getRemainingSeconds();
      setTimeLeft(remaining);
      // If code just rotated (timer wrapped around to 3600 from a low number)
      if (remaining > prevRemaining) {
        updateCode();
      }
      prevRemaining = remaining;
    }, 1000);

    return () => clearInterval(interval);
  }, [authData]);

  const loadStoredAuth = async () => {
    try {
      const saved = await AsyncStorage.getItem('@boardtoken_auth');
      if (saved) {
        setAuthData(JSON.parse(saved));
      }
      const savedLang = await AsyncStorage.getItem('@boardtoken_lang');
      if (savedLang === 'en' || savedLang === 'ar') {
        setLang(savedLang);
      }
    } catch (e) {
      console.error('Load Error', e);
    }
  };

  const toggleLang = async () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    setLang(nextLang);
    try {
      await AsyncStorage.setItem('@boardtoken_lang', nextLang);
    } catch (e) {
      console.error('Lang Save Error', e);
    }
  };

  const processScannedData = (data: string) => {
    try {
      if (!data.startsWith('otpauth://totp/')) {
        throw new Error('Invalid protocol');
      }
      
      // Replace protocol with http so URL parser handles searchParams correctly in all JS engines
      const safeUrlStr = data.replace('otpauth://', 'http://');
      const url = new URL(safeUrlStr);
      
      const secret = url.searchParams.get('secret');
      const issuer = url.searchParams.get('issuer') || 'BoardToken';
      const label = url.pathname.split(':').pop() || 'User';

      if (secret) {
        const dataToSave = { secret, name: decodeURIComponent(label), issuer };
        setAuthData(dataToSave);
        AsyncStorage.setItem('@boardtoken_auth', JSON.stringify(dataToSave));
        setShowScanner(false);
        Vibration.vibrate(200);
        
        if (Platform.OS === 'web') {
          window.alert(t.successPairing);
        } else {
          Alert.alert(t.pairedText, t.successPairing);
        }
        return true;
      }
    } catch (e) {
      if (Platform.OS === 'web') {
        window.alert(t.invalidQr);
      } else {
        Alert.alert(t.errorTitle, t.invalidQr);
      }
    }
    return false;
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setHasScanned(true);
    Vibration.vibrate(100);
    processScannedData(data);
    // Allow scanning again after 2s
    setTimeout(() => setHasScanned(false), 2000);
  };

  const pickImageAndScan = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;

        if (Platform.OS === 'web') {
          // Web-specific QR decoding using jsQR + Canvas
          const domImage = new window.Image();
          domImage.src = uri;
          domImage.crossOrigin = "Anonymous";
          
          await new Promise((resolve, reject) => {
            domImage.onload = resolve;
            domImage.onerror = reject;
          });

          const canvas = document.createElement('canvas');
          canvas.width = domImage.width;
          canvas.height = domImage.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get canvas context');
          
          ctx.drawImage(domImage, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            processScannedData(code.data);
          } else {
            window.alert(t.noQrFound);
          }
        } else {
          // Native platforms (Android/iOS)
          try {
            const scannedResults = await scanFromURLAsync(uri);
            if (scannedResults && scannedResults.length > 0) {
              processScannedData(scannedResults[0].data);
            } else {
              Alert.alert(t.alertTitle, t.noQrFound);
            }
          } catch (scanErr) {
            console.error('Scan from URL Error:', scanErr);
            Alert.alert(t.alertTitle, t.noQrFound);
          }
        }
      }
    } catch (err) {
      console.error('Pick Image Error:', err);
      if (Platform.OS === 'web') {
        window.alert(t.errorProcessing);
      } else {
        Alert.alert(t.errorTitle, t.errorProcessing);
      }
    }
  };

  const handleLogout = () => {
    const performLogout = () => {
      Vibration.vibrate(50);
      setAuthData(null);
      AsyncStorage.removeItem('@boardtoken_auth');
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t.unpairConfirm)) {
        performLogout();
      }
      return;
    }

    Alert.alert(
      t.unpairingText,
      t.unpairConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.unpairBtn, 
          style: 'destructive',
          onPress: performLogout
        },
      ]
    );
  };

  const forceUpdateCode = () => {
    if (!authData) return;
    Vibration.vibrate(50);
    const code = generateAlphanumericTotp(authData.secret);
    setTotpCode(code);
  };

  const copyToClipboard = async () => {
    if (!totpCode) return;
    await Clipboard.setStringAsync(totpCode);
    Vibration.vibrate(50);
    if (Platform.OS === 'web') {
      window.alert(t.copied);
    } else {
      Alert.alert(t.alertTitle, t.copied);
    }
  };


  if (showScanner) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.scannerOverlay}>
          <SafeAreaView style={styles.scannerSafeArea}>
            <View style={styles.scannerHeader}>
              <Text style={styles.scannerTitle}>{t.appName}</Text>
              <Text style={styles.scannerSubtitle}>{t.scannerHint}</Text>
            </View>
            
            <View style={styles.scannerWindow}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            
            <View style={styles.scannerActions}>
              <TouchableOpacity 
                style={[styles.neoBtn, { backgroundColor: '#FFFFFF', flex: 1 }]} 
                onPress={pickImageAndScan}
                activeOpacity={0.8}
              >
                <ImageIcon color={COLORS.textPrimary} size={18} style={{ marginRight: 8 }} strokeWidth={2.5} />
                <Text style={[styles.neoBtnText, { color: COLORS.textPrimary }]}>{t.fromGallery}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.neoBtn, { backgroundColor: COLORS.danger, flex: 1 }]} 
                onPress={() => setShowScanner(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.neoBtnTextWhite}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.responsiveWrapper}>
        {/* Header Navigation */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('./assets/icon.png')} 
              style={styles.headerLogoImage} 
              resizeMode="contain"
            />
            <Text style={styles.logoText}>{t.appName}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleLang} style={styles.langBtn} activeOpacity={0.8}>
              <Globe color={COLORS.textPrimary} size={16} style={{ marginRight: 6 }} strokeWidth={2.5} />
              <Text style={styles.langBtnText}>{lang === 'ar' ? 'EN' : 'عربي'}</Text>
            </TouchableOpacity>
            {authData && (
              <TouchableOpacity onPress={handleLogout} style={styles.iconBtn} activeOpacity={0.8}>
                <LogOut color={COLORS.danger} size={20} strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {!authData ? (
            /* Welcome / Landing Screen */
            <View style={styles.welcomeCard}>
              <Animated.Image 
                source={require('./assets/icon.png')} 
                style={[styles.welcomeLogoImage, { transform: [{ scale: logoScale }] }]} 
                resizeMode="contain"
              />
              <Text style={styles.welcomeTitle}>{t.welcomeTitle}</Text>
              <Text style={styles.welcomeDesc}>{t.welcomeDesc}</Text>
              
              <View style={styles.actionContainer}>
                <TouchableOpacity 
                  style={[styles.neoBtn, { backgroundColor: COLORS.primary }]} 
                  onPress={async () => {
                    if (!hasPermission?.granted) {
                      const res = await requestPermission();
                      if (res.granted) {
                        setShowScanner(true);
                      } else {
                        if (Platform.OS !== 'web') {
                          Alert.alert(t.cameraPermissionTitle, t.cameraPermissionDesc);
                        } else {
                          window.alert(t.cameraPermissionDesc);
                        }
                      }
                    } else {
                      setShowScanner(true);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <CameraIcon color={COLORS.textPrimary} size={20} style={{ marginRight: 8 }} strokeWidth={2.5} />
                  <Text style={[styles.neoBtnText, { color: COLORS.textPrimary }]}>{t.startScan}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.neoBtn, { backgroundColor: '#FFFFFF' }]} 
                  onPress={pickImageAndScan}
                  activeOpacity={0.8}
                >
                  <ImageIcon color={COLORS.textPrimary} size={20} style={{ marginRight: 8 }} strokeWidth={2.5} />
                  <Text style={[styles.neoBtnText, { color: COLORS.textPrimary }]}>{t.pickGallery}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Active Code Card Screen */
            <View style={styles.activeContainer}>
              {/* Profile Card */}
              <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{authData.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={[styles.profileInfo, { alignItems: 'flex-start' }]}>
                  <Text style={styles.profileName}>{authData.name}</Text>
                  <View style={styles.issuerRow}>
                    <Store size={14} color={COLORS.textPrimary} style={{ marginRight: 5 }} strokeWidth={2.5} />
                    <Text style={styles.profileIssuer}>{authData.issuer}</Text>
                  </View>
                </View>
              </View>

              {/* TOTP Access Token Card */}
              <View style={styles.codeCard}>
                <View style={styles.headerRow}>
                  <Text style={[styles.codeCardTitle, { marginBottom: 0 }]}>{t.totpHeader}</Text>
                  <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn} activeOpacity={0.8}>
                    <Copy size={14} color={COLORS.primary} strokeWidth={2.5} style={{ marginRight: 6 }} />
                    <Text style={styles.copyBtnText}>{t.copyCode}</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.codeContainer}>
                  {totpCode.split('').map((char, i) => (
                    <View key={i} style={styles.charBox}>
                      <Text style={styles.charText}>{char}</Text>
                    </View>
                  ))}
                </View>
                
                <Text style={styles.codeFooter}>{t.totpFooter}</Text>

                {/* Progress countdown bar */}
                <View style={styles.timerWrapper}>
                  <View style={styles.timerHeader}>
                    <Clock size={14} color={COLORS.textPrimary} style={{ marginRight: 6 }} strokeWidth={2.5} />
                    <Text style={styles.timerLabel}>
                      {t.timeLeftText} {Math.floor(timeLeft / 60)}{t.minutes} {timeLeft % 60}{t.seconds}
                    </Text>
                  </View>
                  <View style={styles.timerTrack}>
                    <Animated.View 
                      style={[
                        styles.timerFill, 
                        { 
                          width: `${(timeLeft / 3600) * 100}%`,
                          backgroundColor: timeLeft <= 600 ? COLORS.danger : (timeLeft <= 1800 ? COLORS.warning : COLORS.success)
                        }
                      ]} 
                    />
                  </View>
                </View>

                {/* Bottom Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.refreshBtn} onPress={forceUpdateCode} activeOpacity={0.8}>
                    <RefreshCw size={14} color={COLORS.textPrimary} style={{ marginRight: 6 }} strokeWidth={2.5} />
                    <Text style={styles.refreshBtnText}>{t.manualRefresh}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.refreshBtn, { borderColor: COLORS.danger }]} onPress={handleLogout} activeOpacity={0.8}>
                    <LogOut size={14} color={COLORS.danger} style={{ marginRight: 6 }} strokeWidth={2.5} />
                    <Text style={[styles.refreshBtnText, { color: COLORS.danger }]}>{t.scanNewCode}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t.footerText} • {new Date().getFullYear()}
          </Text>
        </View>
      </View>

      {/* High-End Animated Splash Screen overlay */}
      {splashVisible && (
        <Animated.View style={[styles.splashOverlay, { opacity: splashFade }]}>
          <Animated.View style={[styles.splashIconWrapper, { transform: [{ scale: logoScale }] }]}>
            <View style={styles.splashGlowRing}>
              <Animated.Image 
                source={require('./assets/icon.png')} 
                style={styles.splashLogoImage} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.splashLogoText}>BoardToken</Text>
            <Text style={styles.splashTagline}>Secure Alphanumeric Authenticator</Text>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgStart,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.bgStart,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  responsiveWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1A1A1A',
    borderRadius: 12,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginTop: Platform.OS === 'ios' ? 12 : 24,
    marginBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.textPrimary,
  },
  iconBtn: {
    width: 34,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  welcomeCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.cardBorder,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  glowingLogoWrapper: {
    width: 100,
    height: 100,
    backgroundColor: '#FFD700', // Warning Yellow
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeDesc: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  neoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  neoBtnText: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.textPrimary,
  },
  neoBtnTextWhite: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: 'white',
  },
  activeContainer: {
    gap: 20,
  },
  profileCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  avatarContainer: {
    width: 46,
    height: 46,
    backgroundColor: COLORS.secondary, // Brand Blue
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.textPrimary,
  },
  issuerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  profileIssuer: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.textSecondary,
  },
  codeCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.cardBorder,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.primary,
  },
  codeCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  charBox: {
    width: 36,
    height: 52,
    backgroundColor: '#FFFBEB', // Paper Beige
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  charText: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.textPrimary,
  },
  codeFooter: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.textSecondary,
    marginBottom: 28,
  },
  timerWrapper: {
    width: '100%',
    gap: 8,
    marginBottom: 24,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerLabel: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.textPrimary,
  },
  timerTrack: {
    height: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#1A1A1A',
    borderRadius: 6,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 0,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  refreshBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  refreshBtnText: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.textPrimary,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,26,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerSafeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  scannerHeader: {
    alignItems: 'center',
    marginTop: 20,
  },
  scannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
  },
  scannerSubtitle: {
    color: '#BBBBBB',
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    marginTop: 8,
  },
  scannerWindow: {
    width: 260,
    height: 260,
    borderRadius: 12,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.primary,
  },
  cornerTL: {
    top: -3,
    left: -3,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: -3,
    right: -3,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: -3,
    left: -3,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: -3,
    right: -3,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderBottomRightRadius: 8,
  },
  scannerActions: {
    width: '100%',
    paddingHorizontal: 32,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: COLORS.cardBorder,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    color: COLORS.textSecondary,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary, // Chef Orange background
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  splashIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashGlowRing: {
    width: 140,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  splashLogoText: {
    color: '#1A1A1A',
    fontSize: 32,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    letterSpacing: 0.5,
  },
  splashTagline: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? 'Cairo, sans-serif' : undefined,
    marginTop: 8,
  },
  headerLogoImage: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  welcomeLogoImage: {
    width: 90,
    height: 90,
    marginBottom: 24,
  },
  splashLogoImage: {
    width: 90,
    height: 90,
  }
});

