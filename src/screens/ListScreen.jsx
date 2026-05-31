import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getOccurrences } from '../services/occurrenceService';

export default function ListScreen() {
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadOccurrences();
    }, [])
  );

  async function loadOccurrences() {
    setLoading(true);
    try {
      const data = await getOccurrences();
      setOccurrences(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0d2d6e" />
        <Text style={styles.loadingText}>Carregando ocorrências...</Text>
      </View>
    );
  }

  if (occurrences.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>Nenhuma ocorrência registrada</Text>
          <Text style={styles.emptyDesc}>
            Registre a primeira ocorrência urbana da sua região
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {occurrences.length} ocorrência{occurrences.length !== 1 ? 's' : ''} registrada{occurrences.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <FlatList
        data={occurrences}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/detail',
                params: { occurrence: JSON.stringify(item) },
              })
            }
          >
            <View style={styles.cardTop}>
              <View style={styles.categoriaContainer}>
                <Text style={styles.categoria}>{item.categoria}</Text>
              </View>
              <View
                style={[
                  styles.gravidadeBadge,
                  { backgroundColor: gravityBg(item.gravidade) },
                ]}
              >
                <Text
                  style={[
                    styles.gravidadeText,
                    { color: gravityColor(item.gravidade) },
                  ]}
                >
                  {item.gravidade.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.descricao}>{item.descricao}</Text>

            <View style={styles.cardBottom}>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusColor(item.status) },
                  ]}
                />
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
              {item.latitude && (
                <Text style={styles.location}>
                  📍 {item.latitude.toFixed(3)}, {item.longitude.toFixed(3)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function gravityColor(g) {
  if (g === 'Alta') return '#c62828';
  if (g === 'Média') return '#e65100';
  return '#2e7d32';
}

function gravityBg(g) {
  if (g === 'Alta') return '#ffebee';
  if (g === 'Média') return '#fff3e0';
  return '#e8f5e9';
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
  statsBar: {
    backgroundColor: '#0d2d6e',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  statsText: {
    color: '#a8c4e0',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  list: {
    padding: 16,
    gap: 10,
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoriaContainer: {
    flex: 1,
  },
  categoria: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0d2d6e',
  },
  gravidadeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  gravidadeText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  descricao: {
    fontSize: 13,
    color: '#4a5568',
    marginBottom: 10,
    lineHeight: 18,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    paddingTop: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#5a6a7e',
    fontWeight: '600',
  },
  location: {
    fontSize: 11,
    color: '#8a9ab0',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d2d6e',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#6b7a8d',
    textAlign: 'center',
  },
});