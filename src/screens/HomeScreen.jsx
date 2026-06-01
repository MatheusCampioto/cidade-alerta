import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOccurrences } from '../services/occurrenceService';

export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getOccurrences();
      const total = data.length;
      const novo = data.filter((o) => o.status === 'Novo').length;
      const emAndamento = data.filter(
        (o) => o.status === 'Em Análise' || o.status === 'Em Andamento'
      ).length;
      const resolvido = data.filter((o) => o.status === 'Resolvido').length;
      const alta = data.filter((o) => o.gravidade === 'Alta').length;
      setStats({ total, novo, emAndamento, resolvido, alta });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStats(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🏛️</Text>
        <Text style={styles.headerTitle}>CidadeAlerta</Text>
        <Text style={styles.headerSubtitle}>
          Plataforma de Fiscalização Urbana Cidadã
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.body}>
        {!loadingStats && stats && stats.total > 0 && (
          <>
            <Text style={styles.sectionLabel}>PAINEL DE OCORRÊNCIAS</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderLeftColor: '#1565c0' }]}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#f57f17' }]}>
                <Text style={[styles.statNumber, { color: '#f57f17' }]}>{stats.emAndamento}</Text>
                <Text style={styles.statLabel}>Em Andamento</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#2e7d32' }]}>
                <Text style={[styles.statNumber, { color: '#2e7d32' }]}>{stats.resolvido}</Text>
                <Text style={styles.statLabel}>Resolvidos</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#c62828' }]}>
                <Text style={[styles.statNumber, { color: '#c62828' }]}>{stats.alta}</Text>
                <Text style={styles.statLabel}>Alta Gravidade</Text>
              </View>
            </View>
          </>
        )}

        {loadingStats && (
          <ActivityIndicator size="small" color="#1565c0" style={{ marginBottom: 16 }} />
        )}

        <Text style={styles.sectionLabel}>SERVIÇOS DISPONÍVEIS</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/register')}
        >
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>📷</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Registrar Ocorrência</Text>
            <Text style={styles.cardDesc}>
              Fotografe e registre problemas urbanos com classificação por IA
            </Text>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/list')}
        >
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>📋</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Consultar Ocorrências</Text>
            <Text style={styles.cardDesc}>
              Visualize e acompanhe o status das ocorrências registradas
            </Text>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { borderLeftColor: '#2e7d32' }]}
          onPress={() => router.push('/map')}
        >
          <View style={[styles.cardIcon, { backgroundColor: '#e8f5e9' }]}>
            <Text style={styles.cardIconText}>🗺️</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Mapa de Ocorrências</Text>
            <Text style={styles.cardDesc}>
              Visualize os problemas registrados no mapa da cidade
            </Text>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Alinhado à ODS 11 — Cidades e Comunidades Sustentáveis
        </Text>
        <Text style={styles.footerSub}>UniCesumar • ESOFT 2026.1</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#0d2d6e',
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#a8c4e0',
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    height: 4,
    backgroundColor: '#1565c0',
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
  },
  card: {
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
  cardIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d2d6e',
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 12,
    color: '#6b7a8d',
    lineHeight: 17,
  },
  cardArrow: {
    fontSize: 24,
    color: '#1565c0',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#0d2d6e',
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#a8c4e0',
    textAlign: 'center',
  },
  footerSub: {
    fontSize: 10,
    color: '#6a8aaa',
    marginTop: 4,
  },

  statsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 16,
},
statCard: {
  backgroundColor: '#ffffff',
  borderRadius: 8,
  padding: 12,
  borderLeftWidth: 4,
  elevation: 2,
  width: '47%',
  alignItems: 'center',
},
statNumber: {
  fontSize: 28,
  fontWeight: 'bold',
  color: '#0d2d6e',
},
statLabel: {
  fontSize: 11,
  color: '#6b7a8d',
  marginTop: 2,
  textAlign: 'center',
},
});