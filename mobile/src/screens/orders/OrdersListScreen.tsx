import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ordersApi} from '../../api/orders.api';
import type {Order, OrderStatus, OrdersStackParamList} from '../../types';

type Nav = NativeStackNavigationProp<OrdersStackParamList, 'OrdersList'>;

const STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: '#facc15',
  en_proceso: '#0dcaf0',
  completado: '#4ade80',
  cancelado: '#ef4444',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

export default function OrdersListScreen() {
  const navigation = useNavigation<Nav>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await ordersApi.list();
      setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {load();}, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={orders}
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
        <Text style={styles.empty}>No hay pedidos registrados</Text>
      }
      renderItem={({item}) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('OrderDetail', {orderId: item._id})}
          activeOpacity={0.7}>
          <View style={styles.cardTop}>
            <Text style={styles.cardId}>#{item._id.slice(-6).toUpperCase()}</Text>
            <View style={[styles.badge, {backgroundColor: STATUS_COLORS[item.estado] + '22', borderColor: STATUS_COLORS[item.estado]}]}>
              <Text style={[styles.badgeText, {color: STATUS_COLORS[item.estado]}]}>
                {STATUS_LABELS[item.estado]}
              </Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <Icon name="person" size={14} color="#888" />
            <Text style={styles.cardMeta}>{item.nombre ?? 'Sin nombre'}</Text>
          </View>
          <View style={styles.cardRow}>
            <Icon name="shopping-cart" size={14} color="#888" />
            <Text style={styles.cardMeta}>{item.items.length} item(s)</Text>
            <Text style={styles.cardTotal}>${item.total.toLocaleString()}</Text>
          </View>
          <Text style={styles.cardDate}>
            {new Date(item.createdAt).toLocaleDateString('es-CO', {day: '2-digit', month: 'short', year: 'numeric'})}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0a'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a'},
  list: {padding: 16, paddingBottom: 32},
  empty: {color: '#555', textAlign: 'center', marginTop: 40, fontSize: 15},
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  cardTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  cardId: {color: '#fff', fontWeight: 'bold', fontSize: 15},
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {fontSize: 12, fontWeight: '600'},
  cardRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  cardMeta: {color: '#888', fontSize: 13},
  cardTotal: {color: '#4ade80', fontSize: 13, fontWeight: '600', marginLeft: 'auto'},
  cardDate: {color: '#555', fontSize: 12},
});
