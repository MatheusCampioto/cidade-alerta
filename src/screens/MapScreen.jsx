import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOccurrences } from '../services/occurrenceService';

let MapView, Marker, Callout;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
}

export default function MapScreen() {
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: -23.4273,
    longitude: -51.9375,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getOccurrences();
      setOccurrences(data.filter((o) => o.latitude && o.longitude));

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.center}>
        <Text style={styles.webIcon}>🗺️</Text>
        <Text style={styles.webTitle}>Mapa disponível apenas no app mobile</Text>
        <Text style={styles.webDesc}>Abra o aplicativo no Android para visualizar o mapa de ocorrências</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0d2d6e" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {occurrences.length} ocorrência{occurrences.length !== 1 ? 's' : ''} no mapa
        </Text>
        <TouchableOpacity onPress={loadData}>
          <Text style={styles.refreshText}>↺ Atualizar</Text>
        </TouchableOpacity>
      </View>

      <MapView style={styles.map} region={region} showsUserLocation>
        {occurrences.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            pinColor={gravityPinColor(item.gravidade)}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{item.categoria}</Text>
                <Text style={styles.calloutGravidade}>
                  Gravidade: {item.gravidade}
                </Text>
                <Text style={styles.calloutDesc}>{item.descricao}</Text>
                <Text style={styles.calloutStatus}>● {item.status}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>LEGENDA</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#c62828' }]} />
          <Text style={styles.legendText}>Alta gravidade</Text>
          <View style={[styles.legendDot, { backgroundColor: '#e65100', marginLeft: 12 }]} />
          <Text style={styles.legendText}>Média gravidade</Text>
          <View style={[styles.legendDot, { backgroundColor: '#2e7d32', marginLeft: 12 }]} />
          <Text style={styles.legendText}>Baixa gravidade</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function gravityPinColor(g) {
  if (g === 'Alta') return '#c62828';
  if (g === 'Média') return '#e65100';
  return '#2e7d32';
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
    padding: 32,
  },
  webIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  webTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d2d6e',
    textAlign: 'center',
    marginBottom: 8,
  },
  webDesc: {
    fontSize: 13,
    color: '#6b7a8d',
    textAlign: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    color: '#a8c4e0',
    fontSize: 12,
    fontWeight: 'bold',
  },
  refreshText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 200,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d2d6e',
    marginBottom: 4,
  },
  calloutGravidade: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  calloutDesc: {
    fontSize: 12,
    color: '#444',
    marginBottom: 4,
  },
  calloutStatus: {
    fontSize: 11,
    color: '#888',
  },
  legend: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#5a6a7e',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#5a6a7e',
  },
});