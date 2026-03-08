import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuthStore} from '../../store/authStore';
import type {MasStackParamList} from '../../types';

type Nav = NativeStackNavigationProp<MasStackParamList, 'MasMenu'>;

function MenuItem({icon, label, onPress, destructive}: {
  icon: string; label: string; onPress: () => void; destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Icon name={icon} size={22} color={destructive ? '#ef4444' : '#4ade80'} />
      <Text style={[styles.menuItemText, destructive ? {color: '#ef4444'} : null]}>
        {label}
      </Text>
      <Icon name="chevron-right" size={20} color="#555" />
    </TouchableOpacity>
  );
}

export default function MasMenuScreen() {
  const navigation = useNavigation<Nav>();
  const {admin, logout} = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      {/* Perfil */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Icon name="person" size={32} color="#4ade80" />
        </View>
        <View>
          <Text style={styles.adminName}>{admin?.nombre ?? 'Admin'}</Text>
          <Text style={styles.adminEmail}>{admin?.email}</Text>
        </View>
      </View>

      {/* Gestión */}
      <Text style={styles.sectionTitle}>Gestión</Text>
      <View style={styles.section}>
        <MenuItem
          icon="label"
          label="Categorías"
          onPress={() => navigation.navigate('Categorias')}
        />
        <View style={styles.divider} />
        <MenuItem
          icon="settings"
          label="Configuración"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      {/* Sesión */}
      <Text style={styles.sectionTitle}>Sesión</Text>
      <View style={styles.section}>
        <MenuItem
          icon="logout"
          label="Cerrar sesión"
          onPress={() => logout()}
          destructive
        />
      </View>

      <Text style={styles.version}>Lagunas Barbershop v1.0 · Admin Panel</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0a'},
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0a2f0a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  adminName: {color: '#fff', fontSize: 17, fontWeight: '700'},
  adminEmail: {color: '#888', fontSize: 13, marginTop: 2},
  sectionTitle: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  section: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  menuItemText: {flex: 1, color: '#ddd', fontSize: 15},
  divider: {height: 1, backgroundColor: '#222', marginHorizontal: 18},
  version: {color: '#333', fontSize: 12, textAlign: 'center', paddingVertical: 24},
});
