import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {productsApi} from '../../api/products.api';
import {ordersApi} from '../../api/orders.api';
import {barberApi} from '../../api/barber.api';
import {useAuthStore} from '../../store/authStore';

interface Stats {
  products: number;
  pendingOrders: number;
  totalOrders: number;
  services: number;
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <View style={[styles.statCard, {borderLeftColor: color}]}>
      <Icon name={icon} size={28} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const {admin, logout} = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const [products, orders, services] = await Promise.all([
        productsApi.list(),
        ordersApi.list(),
        barberApi.list(),
      ]);
      setStats({
        products: products.length,
        pendingOrders: orders.filter(o => o.estado === 'pendiente').length,
        totalOrders: orders.length,
        services: services.length,
      });
    } catch {
      // Si el servidor no responde, mostrar 0s
      setStats({products: 0, pendingOrders: 0, totalOrders: 0, services: 0});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4ade80"
        />
      }>
      {/* Saludo */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bienvenido,</Text>
          <Text style={styles.adminName}>{admin?.nombre ?? 'Admin'}</Text>
        </View>
        <TouchableOpacity
          onPress={() => logout()}
          style={styles.logoutBtn}
          activeOpacity={0.7}>
          <Icon name="logout" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Estadísticas */}
      <Text style={styles.sectionTitle}>Resumen</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4ade80"
          style={styles.loader}
        />
      ) : (
        <View style={styles.grid}>
          <StatCard
            icon="inventory-2"
            label="Productos"
            value={stats?.products ?? 0}
            color="#4ade80"
          />
          <StatCard
            icon="receipt-long"
            label="Pedidos pendientes"
            value={stats?.pendingOrders ?? 0}
            color="#facc15"
          />
          <StatCard
            icon="shopping-bag"
            label="Total pedidos"
            value={stats?.totalOrders ?? 0}
            color="#0dcaf0"
          />
          <StatCard
            icon="content-cut"
            label="Servicios"
            value={stats?.services ?? 0}
            color="#c084fc"
          />
        </View>
      )}

      <Text style={styles.tip}>
        Desliza hacia abajo para actualizar los datos
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  greeting: {
    color: '#888',
    fontSize: 14,
  },
  adminName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 18,
    width: '46%',
    borderLeftWidth: 3,
    gap: 6,
  },
  statValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 13,
  },
  loader: {
    marginTop: 40,
  },
  tip: {
    color: '#444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
});
