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
  const [mode, setMode] = useState('options');

  const cameraRef = useRef(null);
  const router = useRouter();

  async function getLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('GPS negado pelo usuário. Continuando sem localização.');
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({});
      return loc.coords;
    } catch (error) {
      console.log('GPS indisponível. Continuando sem localização:', error);
      return null;
    }
  }

  async function analyzePhoto(base64, mimeType = 'image/jpeg') {
    setLoading(true);

    try {
      console.log('Iniciando análise da imagem...');
      console.log('Base64 existe?', !!base64);
      console.log('MimeType:', mimeType);

      const result = await classifyOccurrence(base64, mimeType);

      console.log('Resultado retornado pela IA:', result);

      setClassification({
        categoria: result?.categoria || 'Outro',
        gravidade: result?.gravidade || 'Média',
        descricao:
          result?.descricao || 'Não foi possível classificar automaticamente',
      });

      const coords = await getLocation();
      setLocation(coords);

      setMode('preview');
    } catch (error) {
      console.error('Erro ao analisar a foto no componente:', error);

      setClassification({
        categoria: 'Outro',
        gravidade: 'Média',
        descricao: 'Não foi possível classificar automaticamente',
      });

      const coords = await getLocation();
      setLocation(coords);

      setMode('preview');

      alert(
        'Não foi possível processar via IA. Os dados foram preenchidos de forma padrão para permitir o envio.'
      );
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
        quality: 0.3,
      });

      if (!pic?.base64) {
        alert('A foto não gerou o código base64 necessário.');
        setLoading(false);
        return;
      }

      setPhoto({
        uri: pic.uri,
        base64: pic.base64,
        mimeType: 'image/jpeg',
      });

      await analyzePhoto(pic.base64, 'image/jpeg');
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
      setLoading(false);
    }
  }

  async function pickFromGallery() {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        alert('Permissão negada: precisamos de acesso à galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        base64: true,
        quality: 0.3,
      });

      console.log('Resultado do Picker:', {
        canceled: result.canceled,
        temAssets: !!result.assets,
        quantidadeAssets: result.assets?.length || 0,
      });

      if (result.canceled) {
        console.log('Usuário cancelou a escolha da imagem.');
        return;
      }

      const asset = result.assets[0];

      if (!asset?.base64) {
        alert(
          'Aviso: a imagem não gerou o código base64 necessário para o Gemini.'
        );
        return;
      }

      const mimeType = asset.mimeType || 'image/jpeg';

      setPhoto({
        uri: asset.uri,
        base64: asset.base64,
        mimeType,
      });

      console.log('Chamando análise da imagem...');
      await analyzePhoto(asset.base64, mimeType);
    } catch (error) {
      console.error('Erro ao escolher imagem da galeria:', error);
      alert('Erro ao escolher imagem: ' + (error?.message || 'erro desconhecido'));
    }
  }

  async function handleSave() {
    console.log('CLICOU NO BOTÃO CONFIRMAR');

    if (!photo) {
      alert('Erro: nenhuma foto foi selecionada.');
      return;
    }

    if (!classification) {
      alert('Erro: a imagem ainda não foi classificada.');
      return;
    }

    setLoading(true);

    try {
      const dadosParaSalvar = {
        categoria: classification.categoria || 'Outro',
        gravidade: classification.gravidade || 'Média',
        descricao: classification.descricao || 'Sem descrição',
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,

        imageDataUrl: photo?.base64
          ? `data:${photo?.mimeType || 'image/jpeg'};base64,${photo.base64}`
          : null,
      };

      console.log('Dados enviados para salvar no Firebase:', {
        ...dadosParaSalvar,
        imageDataUrl: dadosParaSalvar.imageDataUrl ? 'Imagem salva em base64' : null,
      });

      const idSalvo = await saveOccurrence(dadosParaSalvar);

      console.log('Ocorrência salva com sucesso. ID:', idSalvo);

      setLoading(false);
      router.replace('/list');
    } catch (error) {
      console.error('ERRO REAL AO SALVAR OCORRÊNCIA:', error);

      setLoading(false);

      alert(
        'Erro ao salvar ocorrência: ' +
          (error?.message || 'erro desconhecido. Veja o console.')
      );
    }
  }

  function handleRetake() {
    setPhoto(null);
    setClassification(null);
    setLocation(null);
    setMode('options');
  }

  async function openCamera() {
    try {
      if (permission?.granted) {
        setMode('camera');
        return;
      }

      const result = await requestPermission();

      if (result?.granted) {
        setMode('camera');
      } else {
        alert('Permissão da câmera negada.');
      }
    } catch (error) {
      console.error('Erro ao pedir permissão da câmera:', error);
      alert('Erro ao abrir câmera.');
    }
  }

  if (mode === 'options') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>📋 Nova Ocorrência</Text>
            <Text style={styles.headerSubtitle}>
              Escolha como deseja registrar o problema
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionLabel}>MÉTODO DE REGISTRO</Text>

          <TouchableOpacity style={styles.optionCard} onPress={openCamera}>
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

          <TouchableOpacity style={styles.optionCard} onPress={pickFromGallery}>
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

  return (
    <ScrollView contentContainerStyle={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <TouchableOpacity onPress={handleRetake}>
          <Text style={styles.previewBackText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.previewHeaderTitle}>Nova Ocorrência</Text>
      </View>

      {photo?.uri && <Image source={{ uri: photo.uri }} style={styles.preview} />}

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0d2d6e" />
          <Text style={styles.loadingTextDark}>Salvando ocorrência...</Text>
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
              disabled={loading}
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
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: '#ffffff',
    lineHeight: 32,
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
    flexGrow: 1,
  },
  previewHeader: {
    backgroundColor: '#0d2d6e',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewBackText: {
    fontSize: 32,
    color: '#ffffff',
    lineHeight: 32,
  },
  previewHeaderTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
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