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
import {productsApi} from '../../api/products.api';
import type {Product, ProductsStackParamList} from '../../types';

type Nav = NativeStackNavigationProp<ProductsStackParamList, 'ProductsList'>;

export default function ProductsListScreen() {
  const navigation = useNavigation<Nav>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await productsApi.list();
      setProducts(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (id: string, nombre: string) => {
    Alert.alert(
      'Eliminar producto',
      `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await productsApi.delete(id);
              setProducts(prev => prev.filter(p => p._id !== id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el producto');
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
        data={products}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor="#4ade80"
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay productos registrados</Text>
        }
        renderItem={({item}) => (
          <View style={styles.card}>
            {item.imagen ? (
              <Image
                source={{uri: item.imagen}}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.thumbnail, styles.noImage]}>
                <Icon name="image-not-supported" size={24} color="#555" />
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.nombre}
              </Text>
              <Text style={styles.cardPrice}>
                ${item.precio.toLocaleString()}
              </Text>
              <Text style={styles.cardType}>{item.tipo}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ProductForm', {productId: item._id})
                }
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

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm', {})}
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
  noImage: {
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {flex: 1, paddingHorizontal: 12, gap: 2},
  cardName: {color: '#fff', fontSize: 15, fontWeight: '600'},
  cardPrice: {color: '#4ade80', fontSize: 14},
  cardType: {color: '#888', fontSize: 12, textTransform: 'capitalize'},
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
    shadowColor: '#4ade80',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
});
