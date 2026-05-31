import { CameraView, useCameraPermissions } from 'expo-camera';
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
import { classifyOccurrence } from '../services/gemini';
import { saveOccurrence } from '../services/occurrenceService';

export default function RegisterScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [classification, setClassification] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);
  const router = useRouter();

  async function takePicture() {
    if (!cameraRef.current) return;
    setLoading(true);
    try {
      const pic = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });
      setPhoto(pic);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      }

      const result = await classifyOccurrence(pic.base64);
      setClassification(result);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    } finally {
      setLoading(false);
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
  }

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Precisamos de acesso à câmera para registrar ocorrências.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (photo) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: photo.uri }} style={styles.preview} />

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1a73e8" />
            <Text style={styles.loadingText}>Analisando com IA...</Text>
          </View>
        )}

        {classification && !loading && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Classificação da IA</Text>
            <Text style={styles.cardItem}>
              📁 Categoria:{' '}
              <Text style={styles.bold}>{classification.categoria}</Text>
            </Text>
            <Text style={styles.cardItem}>
              ⚠️ Gravidade:{' '}
              <Text
                style={[
                  styles.bold,
                  { color: gravityColor(classification.gravidade) },
                ]}
              >
                {classification.gravidade}
              </Text>
            </Text>
            <Text style={styles.cardItem}>📝 {classification.descricao}</Text>
            {location && (
              <Text style={styles.cardItem}>
                📍 {location.latitude.toFixed(5)},{' '}
                {location.longitude.toFixed(5)}
              </Text>
            )}
          </View>
        )}

        {classification && !loading && (
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleRetake}
            >
              <Text style={styles.buttonText}>🔄 Refazer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>✅ Salvar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        <View style={styles.cameraOverlay}>
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

function gravityColor(gravidade) {
  if (gravidade === 'Alta') return '#ea4335';
  if (gravidade === 'Média') return '#fbbc04';
  return '#34a853';
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  camera: {
    width: '100%',
    height: 500,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 24,
  },
  captureButton: {
    backgroundColor: '#1a73e8',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureText: {
    fontSize: 32,
  },
  preview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingBox: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#1a73e8',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a73e8',
  },
  cardItem: {
    fontSize: 15,
    marginBottom: 4,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#ea4335',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
  },
});