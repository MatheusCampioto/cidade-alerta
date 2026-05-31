import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getNextStates } from '../models/occurrenceStateMachine';
import { updateOccurrenceStatus } from '../services/occurrenceService';

export default function DetailScreen() {
  const { occurrence: occurrenceParam } = useLocalSearchParams();
  const occurrence = JSON.parse(occurrenceParam);
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(occurrence.status);
  const [loading, setLoading] = useState(false);

  const nextStates = getNextStates(currentStatus);

  async function handleTransition(newStatus) {
    setLoading(true);
    try {
      await updateOccurrenceStatus(occurrence.id, currentStatus, newStatus);
      setCurrentStatus(newStatus);
      Alert.alert('Status Atualizado', `Ocorrência avançada para: ${newStatus}`);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DADOS DA OCORRÊNCIA</Text>
          <View style={styles.card}>
            <Row label="Categoria" value={occurrence.categoria} />
            <Divider />
            <Row
              label="Gravidade"
              value={occurrence.gravidade}
              valueColor={gravityColor(occurrence.gravidade)}
            />
            <Divider />
            <Row label="Descrição" value={occurrence.descricao} />
            {occurrence.latitude && (
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

        {occurrence.statusHistory && occurrence.statusHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>HISTÓRICO DE TRAMITAÇÃO</Text>
            <View style={styles.card}>
              {occurrence.statusHistory.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <View
                    style={[
                      styles.historyDot,
                      { backgroundColor: statusColor(item.status) },
                    ]}
                  />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyStatus}>{item.status}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.timestamp).toLocaleString('pt-BR')}
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
                style={[styles.actionButton, loading && styles.buttonDisabled]}
                onPress={() => handleTransition(state)}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>
                  Mover para: {state}
                </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scroll: {
    padding: 16,
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1565c0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
  },
  finalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
});