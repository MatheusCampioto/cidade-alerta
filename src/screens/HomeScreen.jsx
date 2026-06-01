import { useRouter } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
});