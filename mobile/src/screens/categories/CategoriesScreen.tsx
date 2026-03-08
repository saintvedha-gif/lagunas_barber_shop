import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {categoriesApi} from '../../api/categories.api';
import type {Category} from '../../types';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [nombre, setNombre] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await categoriesApi.list();
      setCategories(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {load();}, [load]);

  const openModal = (cat?: Category) => {
    setEditing(cat ?? null);
    setNombre(cat?.nombre ?? '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await categoriesApi.update(editing._id, nombre.trim());
        setCategories(prev => prev.map(c => c._id === editing._id ? updated : c));
      } else {
        const created = await categoriesApi.create(nombre.trim());
        setCategories(prev => [...prev, created]);
      }
      setModalVisible(false);
      setNombre('');
      setEditing(null);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat: Category) => {
    Alert.alert('Eliminar', `¿Eliminar "${cat.nombre}"?`, [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await categoriesApi.delete(cat._id);
            setCategories(prev => prev.filter(c => c._id !== cat._id));
          } catch {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        },
      },
    ]);
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
        data={categories}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay categorías</Text>}
        renderItem={({item}) => (
          <View style={styles.row}>
            <Icon name="label" size={20} color="#4ade80" />
            <Text style={styles.rowText}>{item.nombre}</Text>
            <TouchableOpacity onPress={() => openModal(item)} style={styles.actionBtn}>
              <Icon name="edit" size={20} color="#4ade80" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
              <Icon name="delete" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => openModal()} activeOpacity={0.8}>
        <Icon name="add" size={28} color="#000" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editing ? 'Editar categoría' : 'Nueva categoría'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre de la categoría"
              placeholderTextColor="#555"
              value={nombre}
              onChangeText={setNombre}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {setModalVisible(false); setNombre(''); setEditing(null);}}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving ? {opacity: 0.6} : null]}
                onPress={handleSave}
                disabled={saving}>
                {saving ? <ActivityIndicator color="#000" /> : (
                  <Text style={styles.saveBtnText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0a'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a'},
  list: {padding: 16, paddingBottom: 80},
  empty: {color: '#555', textAlign: 'center', marginTop: 40, fontSize: 15},
  row: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  rowText: {flex: 1, color: '#fff', fontSize: 15},
  actionBtn: {padding: 4},
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    backgroundColor: '#4ade80', width: 56, height: 56,
    borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5,
  },
  modalOverlay: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)'},
  modalBox: {backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, width: '85%', gap: 16},
  modalTitle: {color: '#fff', fontSize: 18, fontWeight: '700'},
  modalInput: {
    backgroundColor: '#111', borderWidth: 1, borderColor: '#333',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: '#fff', fontSize: 15,
  },
  modalBtns: {flexDirection: 'row', gap: 10, marginTop: 4},
  cancelBtn: {flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#333', alignItems: 'center'},
  cancelBtnText: {color: '#aaa', fontSize: 15},
  saveBtn: {flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#4ade80', alignItems: 'center'},
  saveBtnText: {color: '#000', fontWeight: '700', fontSize: 15},
});
