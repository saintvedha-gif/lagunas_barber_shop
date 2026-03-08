import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ordersApi} from '../../api/orders.api';
import type {Order, OrderStatus, OrdersStackParamList} from '../../types';

type RouteT = RouteProp<OrdersStackParamList, 'OrderDetail'>;

const STATUSES: {value: OrderStatus; label: string; color: string}[] = [
  {value: 'pendiente', label: 'Pendiente', color: '#facc15'},
  {value: 'en_proceso', label: 'En proceso', color: '#0dcaf0'},
  {value: 'completado', label: 'Completado', color: '#4ade80'},
  {value: 'cancelado', label: 'Cancelado', color: '#ef4444'},
];

export default function OrderDetailScreen() {
  const route = useRoute<RouteT>();
  const {orderId} = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    ordersApi.get(orderId).then(setOrder).catch(() => {
      Alert.alert('Error', 'No se pudo cargar el pedido');
    }).finally(() => setLoading(false));
  }, [orderId]);

  const changeStatus = async (estado: OrderStatus) => {
    if (!order || order.estado === estado) {return;}
    setUpdating(true);
    try {
      const updated = await ordersApi.updateStatus(orderId, estado);
      setOrder(updated);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !order) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cabecera */}
      <Text style={styles.orderId}>Pedido #{order._id.slice(-6).toUpperCase()}</Text>
      <Text style={styles.date}>
        {new Date(order.createdAt).toLocaleDateString('es-CO', {
          day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })}
      </Text>

      {/* Info cliente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cliente</Text>
        <View style={styles.infoRow}>
          <Icon name="person" size={16} color="#888" />
          <Text style={styles.infoText}>{order.nombre ?? 'Sin especificar'}</Text>
        </View>
        {order.email && (
          <View style={styles.infoRow}>
            <Icon name="email" size={16} color="#888" />
            <Text style={styles.infoText}>{order.email}</Text>
          </View>
        )}
        {order.telefono && (
          <View style={styles.infoRow}>
            <Icon name="phone" size={16} color="#888" />
            <Text style={styles.infoText}>{order.telefono}</Text>
          </View>
        )}
      </View>

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Productos</Text>
        {order.items.map((item, i) => {
          const nombre =
            typeof item.producto === 'object'
              ? item.producto.nombre
              : `Producto ${i + 1}`;
          return (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>{nombre}</Text>
              <Text style={styles.itemQty}>x{item.cantidad}</Text>
              <Text style={styles.itemPrice}>${(item.precio * item.cantidad).toLocaleString()}</Text>
            </View>
          );
        })}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.total.toLocaleString()}</Text>
        </View>
      </View>

      {/* Estado */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado del pedido</Text>
        {updating && <ActivityIndicator color="#4ade80" style={styles.updatingIndicator} />}
        <View style={styles.statusGrid}>
          {STATUSES.map(s => (
            <TouchableOpacity
              key={s.value}
              style={[
                styles.statusBtn,
                order.estado === s.value
                  ? {backgroundColor: s.color + '22', borderColor: s.color}
                  : null,
              ]}
              onPress={() => changeStatus(s.value)}
              disabled={updating}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.statusBtnText,
                  order.estado === s.value ? {color: s.color, fontWeight: '700'} : null,
                ]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0a'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a'},
  content: {padding: 20, paddingBottom: 40},
  orderId: {color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4},
  date: {color: '#555', fontSize: 13, marginBottom: 24},
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {color: '#aaa', fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4},
  infoRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  infoText: {color: '#ddd', fontSize: 14},
  itemRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  itemName: {flex: 1, color: '#ddd', fontSize: 14},
  itemQty: {color: '#888', fontSize: 13},
  itemPrice: {color: '#4ade80', fontSize: 14, fontWeight: '600', minWidth: 70, textAlign: 'right'},
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 4,
  },
  totalLabel: {color: '#fff', fontSize: 15, fontWeight: '700'},
  totalValue: {color: '#4ade80', fontSize: 18, fontWeight: 'bold'},
  updatingIndicator: {position: 'absolute', right: 16, top: 16},
  statusGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  statusBtn: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  statusBtnText: {color: '#666', fontSize: 14},
});
