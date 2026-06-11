import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNextStates } from '../models/occurrenceStateMachine';
import {
  deleteOccurrence,
  getOccurrenceById,
  updateOccurrenceStatus,
} from '../services/occurrenceService';

export default function DetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const occurrenceParam = Array.isArray(params.occurrence)
    ? params.occurrence[0]
    : params.occurrence;

  const [occurrence, setOccurrence] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadOccurrence();
  }, [idParam, occurrenceParam]);

  async function loadOccurrence() {
    setLoading(true);

    try {
      let data = null;

      if (idParam) {
        data = await getOccurrenceById(idParam);
      } else if (occurrenceParam) {
        data = JSON.parse(occurrenceParam);
      } else {
        throw new Error('Ocorrência não informada.');
      }

      setOccurrence(data);
      setCurrentStatus(data.status || 'Novo');
      setStatusHistory(data.statusHistory || []);
    } catch (error) {
      console.error('Erro ao carregar detalhe:', error);
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível carregar a ocorrência.'
      );
    } finally {
      setLoading(false);
    }
  }

  const nextStates = getNextStates(currentStatus);

  async function handleTransition(newStatus) {
    if (!occurrence?.id) {
      Alert.alert('Erro', 'ID da ocorrência não encontrado.');
      return;
    }

    setUpdating(true);

    try {
      await updateOccurrenceStatus(occurrence.id, currentStatus, newStatus);

      const newHistoryItem = {
        status: newStatus,
        timestamp: new Date().toISOString(),
      };

      setCurrentStatus(newStatus);
      setStatusHistory((oldHistory) => [...oldHistory, newHistoryItem]);

      setOccurrence((oldOccurrence) => ({
        ...oldOccurrence,
        status: newStatus,
        statusHistory: [...(oldOccurrence?.statusHistory || []), newHistoryItem],
      }));

      Alert.alert('Status Atualizado', `Ocorrência avançada para: ${newStatus}`);
    } catch (error) {
      console.error('Erro ao atualizar tramitação:', error);
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o status.');
    } finally {
      setUpdating(false);
    }
  }

  function confirmDelete() {
    const message =
      'Deseja excluir esta ocorrência? Essa ação não pode ser desfeita.';

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(message);

      if (confirmed) {
        handleDelete();
      }

      return;
    }

    Alert.alert('Excluir ocorrência', message, [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: handleDelete,
      },
    ]);
  }

  async function handleDelete() {
    if (!occurrence?.id) {
      Alert.alert('Erro', 'ID da ocorrência não encontrado.');
      return;
    }

    setDeleting(true);

    try {
      await deleteOccurrence(occurrence.id);

      console.log('Ocorrência excluída com sucesso:', occurrence.id);

      router.replace('/list');
    } catch (error) {
      console.error('Erro ao excluir ocorrência:', error);
      alert(
        'Erro ao excluir ocorrência: ' +
          (error?.message || 'erro desconhecido')
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0d2d6e" />
          <Text style={styles.loadingText}>Carregando detalhe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!occurrence) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Ocorrência não encontrada.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasLocation =
    occurrence.latitude !== null &&
    occurrence.latitude !== undefined &&
    occurrence.longitude !== null &&
    occurrence.longitude !== undefined;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DADOS DA OCORRÊNCIA</Text>

          {occurrence.imageDataUrl && (
            <Image
              source={{ uri: occurrence.imageDataUrl }}
              style={styles.occurrenceImage}
            />
          )}

          <View style={styles.card}>
            <Row label="Categoria" value={occurrence.categoria || 'Outro'} />

            <Divider />

            <Row
              label="Gravidade"
              value={occurrence.gravidade || 'Média'}
              valueColor={gravityColor(occurrence.gravidade)}
            />

            <Divider />

            <Row
              label="Descrição"
              value={occurrence.descricao || 'Sem descrição'}
            />

            {hasLocation && (
              <>
                <Divider />
                <Row
                  label="Localização"
                  value={`${occurrence.latitude.toFixed(5)}, ${occurrence.longitude.toFixed(5)}`}
                />
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STATUS ATUAL</Text>

          <View style={styles.card}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusColor(currentStatus) },
                ]}
              />
              <Text style={styles.statusValue}>{currentStatus}</Text>
            </View>
          </View>
        </View>

        {statusHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>HISTÓRICO DE TRAMITAÇÃO</Text>

            <View style={styles.card}>
              {statusHistory.map((item, index) => (
                <View key={`${item.status}-${index}`} style={styles.historyItem}>
                  <View
                    style={[
                      styles.historyDot,
                      { backgroundColor: statusColor(item.status) },
                    ]}
                  />

                  <View style={styles.historyContent}>
                    <Text style={styles.historyStatus}>{item.status}</Text>
                    <Text style={styles.historyDate}>
                      {formatDate(item.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {nextStates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>AVANÇAR TRAMITAÇÃO</Text>

            {nextStates.map((state) => (
              <TouchableOpacity
                key={state}
                style={[styles.actionButton, updating && styles.buttonDisabled]}
                onPress={() => handleTransition(state)}
                disabled={updating || deleting}
              >
                <Text style={styles.actionButtonText}>Mover para: {state}</Text>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {nextStates.length === 0 && (
          <View style={styles.finalCard}>
            <Text style={styles.finalText}>
              ✅ Ocorrência em estado final — {currentStatus}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GERENCIAR OCORRÊNCIA</Text>

          <TouchableOpacity
            style={[styles.deleteButton, deleting && styles.buttonDisabled]}
            onPress={confirmDelete}
            disabled={deleting || updating}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.deleteButtonText}>🗑️ Excluir ocorrência</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, valueColor }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor && { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function gravityColor(g) {
  if (g === 'Alta') return '#c62828';
  if (g === 'Média') return '#e65100';
  return '#2e7d32';
}

function statusColor(s) {
  if (s === 'Novo') return '#1565c0';
  if (s === 'Em Análise') return '#f57f17';
  if (s === 'Em Andamento') return '#6a1b9a';
  if (s === 'Resolvido') return '#2e7d32';
  return '#546e7a';
}

function formatDate(value) {
  try {
    if (!value) return '';

    if (value?.toDate) {
      return value.toDate().toLocaleString('pt-BR');
    }

    return new Date(value).toLocaleString('pt-BR');
  } catch (error) {
    return String(value);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },

  scroll: {
    padding: 16,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
  },

  loadingText: {
    marginTop: 12,
    color: '#5a6a7e',
    fontSize: 14,
  },

  errorText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#c62828',
  },

  section: {
    marginBottom: 16,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#5a6a7e',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  occurrenceImage: {
    width: '100%',
    height: 260,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#e0e0e0',
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1565c0',
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },

  rowLabel: {
    fontSize: 13,
    color: '#6b7a8d',
    flex: 1,
  },

  rowValue: {
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

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d2d6e',
  },

  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
  },

  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },

  historyContent: {
    flex: 1,
  },

  historyStatus: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0d2d6e',
  },

  historyDate: {
    fontSize: 11,
    color: '#8a9ab0',
    marginTop: 2,
  },

  actionButton: {
    backgroundColor: '#0d2d6e',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  buttonDisabled: {
    backgroundColor: '#a0aec0',
  },

  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  actionArrow: {
    color: '#a8c4e0',
    fontSize: 22,
    fontWeight: 'bold',
  },

  finalCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
    marginBottom: 16,
  },

  finalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },

  deleteButton: {
    backgroundColor: '#c62828',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },

  deleteButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});