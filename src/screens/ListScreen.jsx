import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOccurrences } from '../services/occurrenceService';

export default function ListScreen() {
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;
  const isLargeDesktop = width >= 1400;

  const numColumns = isLargeDesktop ? 3 : isDesktop ? 2 : 1;

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
      console.error('Erro ao carregar ocorrências:', error);
      alert('Erro ao carregar ocorrências.');
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/')}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Ocorrências</Text>
        </View>

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ocorrências</Text>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.contentWrapper}>
          <Text style={styles.statsText}>
            {occurrences.length} ocorrência
            {occurrences.length !== 1 ? 's' : ''} registrada
            {occurrences.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <FlatList
        key={numColumns}
        data={occurrences}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          isDesktop && styles.listDesktop,
        ]}
        columnWrapperStyle={
          numColumns > 1 ? styles.columnWrapper : undefined
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              numColumns > 1 && styles.cardGrid,
            ]}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/detail',
                params: { id: item.id },
              })
            }
          >
            {item.imageDataUrl ? (
              <Image
                source={{ uri: item.imageDataUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.noImageBox}>
                <Text style={styles.noImageText}>Sem imagem</Text>
              </View>
            )}

            <View style={styles.cardTop}>
              <View style={styles.categoriaContainer}>
                <Text style={styles.categoria} numberOfLines={1}>
                  {item.categoria || 'Outro'}
                </Text>
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
                  {(item.gravidade || 'Média').toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.descricao} numberOfLines={3}>
              {item.descricao || 'Sem descrição'}
            </Text>

            <View style={styles.cardBottom}>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusColor(item.status) },
                  ]}
                />

                <Text style={styles.statusText}>
                  {item.status || 'Novo'}
                </Text>
              </View>

              {item.latitude !== null &&
                item.latitude !== undefined &&
                item.longitude !== null &&
                item.longitude !== undefined && (
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
    backgroundColor: '#eef2f7',
  },

  header: {
    backgroundColor: '#0d2d6e',
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  backText: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 34,
  },

  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  statsBar: {
    backgroundColor: '#0d2d6e',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#34508a',
  },

  contentWrapper: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
  },

  statsText: {
    color: '#a8c4e0',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  list: {
    padding: 16,
    gap: 12,
  },

  listDesktop: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    paddingVertical: 24,
  },

  columnWrapper: {
    gap: 16,
    marginBottom: 16,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#1565c0',
    elevation: 2,
  },

  cardGrid: {
    flex: 1,
    minHeight: 330,
  },

  thumbnail: {
    width: '100%',
    height: 170,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#d9e2ec',
  },

  noImageBox: {
    width: '100%',
    height: 170,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  noImageText: {
    color: '#718096',
    fontSize: 13,
    fontWeight: 'bold',
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },

  categoriaContainer: {
    flex: 1,
  },

  categoria: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d2d6e',
  },

  gravidadeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  gravidadeText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  descricao: {
    fontSize: 13,
    color: '#4a5568',
    marginBottom: 12,
    lineHeight: 19,
    minHeight: 56,
  },

  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    paddingTop: 10,
    gap: 8,
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

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2f7',
  },

  loadingText: {
    marginTop: 12,
    color: '#5a6a7e',
    fontSize: 14,
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