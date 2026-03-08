import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {barberApi} from '../../api/barber.api';
import type {BarberService, BarberStackParamList} from '../../types';

type Nav = NativeStackNavigationProp<BarberStackParamList, 'BarberServicesList'>;

export default function BarberServicesScreen() {
  const navigation = useNavigation<Nav>();
  const [services, setServices] = useState<BarberService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await barberApi.list();
      setServices(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los servicios');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {load();}, [load]);

  const handleDelete = (id: string, nombre: string) => {
    Alert.alert(
      'Eliminar servicio',
      `¿Eliminar "${nombre}"?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await barberApi.delete(id);
              setServices(prev => prev.filter(s => s._id !== id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {setRefreshing(true); load();}}
            tintColor="#4ade80"
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No hay servicios registrados</Text>
        }
        renderItem={({item}) => (
          <View style={styles.card}>
            {item.imagen ? (
              <Image source={{uri: item.imagen}} style={styles.thumbnail} resizeMode="cover" />
            ) : (
              <View style={[styles.thumbnail, styles.noImage]}>
                <Icon name="content-cut" size={24} color="#555" />
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={1}>{item.nombre}</Text>
              <Text style={styles.cardPrice}>${item.precio.toLocaleString()}</Text>
              {item.duracion && <Text style={styles.cardMeta}>{item.duracion} min</Text>}
            </View>
            <View style={[styles.activeDot, {backgroundColor: item.activo ? '#4ade80' : '#555'}]} />
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('BarberServiceForm', {serviceId: item._id})}
                style={styles.actionBtn}>
                <Icon name="edit" size={20} color="#4ade80" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item._id, item.nombre)}
                style={styles.actionBtn}>
                <Icon name="delete" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('BarberServiceForm', {})}
        activeOpacity={0.8}>
        <Icon name="add" size={28} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0a'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a'},
  list: {padding: 16, paddingBottom: 80},
  empty: {color: '#555', textAlign: 'center', marginTop: 40, fontSize: 15},
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  thumbnail: {width: 70, height: 70},
  noImage: {backgroundColor: '#222', justifyContent: 'center', alignItems: 'center'},
  cardInfo: {flex: 1, paddingHorizontal: 12, gap: 2},
  cardName: {color: '#fff', fontSize: 15, fontWeight: '600'},
  cardPrice: {color: '#4ade80', fontSize: 14},
  cardMeta: {color: '#888', fontSize: 12},
  activeDot: {width: 8, height: 8, borderRadius: 4, marginRight: 8},
  cardActions: {flexDirection: 'row', paddingRight: 8, gap: 4},
  actionBtn: {padding: 8},
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: '#4ade80',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
