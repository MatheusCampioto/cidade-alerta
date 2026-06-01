import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { classifyOccurrence } from '../services/gemini';
import { saveOccurrence } from '../services/occurrenceService';

export default function RegisterScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [classification, setClassification] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('options'); // options | camera | preview
  const cameraRef = useRef(null);
  const router = useRouter();

  async function getLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({});
      return loc.coords;
    }
    return null;
  }

  async function analyzePhoto(base64) {
    setLoading(true);
    try {
      const coords = await getLocation();
      setLocation(coords);
      const result = await classifyOccurrence(base64);
      setClassification(result);
      setMode('preview');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível analisar a imagem');
    } finally {
      setLoading(false);
    }
  }

  async function takePicture() {
    if (!cameraRef.current) return;
    setLoading(true);
    try {
      const pic = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });
      setPhoto(pic);
      await analyzePhoto(pic.base64);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto');
      setLoading(false);
    }
  }

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à galeria');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.IMAGE,
      base64: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhoto({ uri: asset.uri, base64: asset.base64 });
      await analyzePhoto(asset.base64);
    }
  }

  async function handleSave() {
    if (!photo || !classification) return;
    setLoading(true);
    try {
      await saveOccurrence({
        categoria: classification.categoria,
        gravidade: classification.gravidade,
        descricao: classification.descricao,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
      });
      Alert.alert('Sucesso!', 'Ocorrência registrada com sucesso.', [
        { text: 'OK', onPress: () => router.push('/list') },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a ocorrência');
    } finally {
      setLoading(false);
    }
  }

  function handleRetake() {
    setPhoto(null);
    setClassification(null);
    setLocation(null);
    setMode('options');
  }

  // TELA DE OPÇÕES
  if (mode === 'options') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📋 Nova Ocorrência</Text>
          <Text style={styles.headerSubtitle}>
            Escolha como deseja registrar o problema
          </Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionLabel}>MÉTODO DE REGISTRO</Text>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => {
              if (!permission?.granted) {
                requestPermission();
              } else {
                setMode('camera');
              }
            }}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>📷</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Usar Câmera</Text>
              <Text style={styles.optionDesc}>
                Fotografe o problema diretamente com a câmera
              </Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={pickFromGallery}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#e8f5e9' }]}>
              <Text style={styles.optionIconText}>🖼️</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Escolher da Galeria</Text>
              <Text style={styles.optionDesc}>
                Selecione uma foto já existente no dispositivo
              </Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Analisando com IA...</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // TELA DA CÂMERA
  if (mode === 'camera') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={cameraRef} facing="back">
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setMode('options')}
            >
              <Text style={styles.cancelText}>✕ Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.captureText}>📷</Text>
              )}
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // TELA DE PREVIEW
  return (
    <ScrollView contentContainerStyle={styles.previewContainer}>
      <Image source={{ uri: photo.uri }} style={styles.preview} />

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0d2d6e" />
          <Text style={styles.loadingTextDark}>Analisando com IA...</Text>
        </View>
      )}

      {classification && !loading && (
        <>
          <Text style={styles.sectionLabel}>RESULTADO DA ANÁLISE — IA</Text>
          <View style={styles.resultCard}>
            <ResultRow label="Categoria" value={classification.categoria} />
            <View style={styles.divider} />
            <ResultRow
              label="Gravidade"
              value={classification.gravidade}
              valueColor={gravityColor(classification.gravidade)}
            />
            <View style={styles.divider} />
            <ResultRow label="Descrição" value={classification.descricao} />
            {location && (
              <>
                <View style={styles.divider} />
                <ResultRow
                  label="Localização"
                  value={`${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}
                />
              </>
            )}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.buttonSecondary]}
              onPress={handleRetake}
            >
              <Text style={styles.actionButtonText}>🔄 Refazer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>✅ Confirmar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function ResultRow({ label, value, valueColor }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={[styles.resultValue, valueColor && { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );
}

function gravityColor(g) {
  if (g === 'Alta') return '#c62828';
  if (g === 'Média') return '#e65100';
  return '#2e7d32';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#0d2d6e',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#a8c4e0',
    marginTop: 4,
  },
  body: {
    flex: 1,
    padding: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#5a6a7e',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1565c0',
    elevation: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionIconText: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d2d6e',
    marginBottom: 3,
  },
  optionDesc: {
    fontSize: 12,
    color: '#6b7a8d',
    lineHeight: 17,
  },
  optionArrow: {
    fontSize: 24,
    color: '#1565c0',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 45, 110, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
    fontWeight: 'bold',
  },
  loadingTextDark: {
    color: '#0d2d6e',
    fontSize: 16,
    marginTop: 12,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 40,
  },
  cancelButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  captureButton: {
    backgroundColor: '#1565c0',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  captureText: {
    fontSize: 36,
  },
  previewContainer: {
    padding: 16,
    backgroundColor: '#f0f2f5',
  },
  preview: {
    width: '100%',
    height: 260,
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingBox: {
    alignItems: 'center',
    marginVertical: 16,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1565c0',
    elevation: 2,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 13,
    color: '#6b7a8d',
    flex: 1,
  },
  resultValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0d2d6e',
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#edf2f7',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#0d2d6e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#c62828',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});