import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp, RouteProp} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {productsApi} from '../../api/products.api';
import {categoriesApi} from '../../api/categories.api';
import type {Category, ProductsStackParamList} from '../../types';

type Nav = NativeStackNavigationProp<ProductsStackParamList, 'ProductForm'>;
type RouteT = RouteProp<ProductsStackParamList, 'ProductForm'>;

interface FormFields {
  nombre: string;
  descripcion: string;
  precio: string;
  tipo: 'ropa' | 'cosmetico';
  stock: string;
}

export default function ProductFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const {productId} = route.params ?? {};
  const isEditing = !!productId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  const {control, handleSubmit, setValue, watch, formState: {errors}} = useForm<FormFields>({
    defaultValues: {nombre: '', descripcion: '', precio: '', tipo: 'ropa', stock: '0'},
  });
  const tipo = watch('tipo');

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
    if (isEditing) {
      productsApi.get(productId!).then(p => {
        setValue('nombre', p.nombre);
        setValue('descripcion', p.descripcion ?? '');
        setValue('precio', String(p.precio));
        setValue('tipo', p.tipo);
        if (p.imagen) {setImageUri(p.imagen);}
        const cat = typeof p.categoria === 'object' ? p.categoria?._id : p.categoria;
        if (cat) {setSelectedCategory(cat);}
        setLoadingData(false);
      }).catch(() => setLoadingData(false));
    }
  }, [isEditing, productId, setValue]);

  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8});
    if (result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: FormFields) => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append('nombre', data.nombre.trim());
      form.append('descripcion', data.descripcion.trim());
      form.append('precio', data.precio);
      form.append('tipo', data.tipo);
      if (selectedCategory) {form.append('categoria', selectedCategory);}
      if (imageUri && !imageUri.startsWith('http')) {
        form.append('imagen', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'product.jpg',
        } as any);
      }

      if (isEditing) {
        await productsApi.update(productId!, form);
      } else {
        await productsApi.create(form);
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Imagen */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.7}>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.imagePreview} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="add-photo-alternate" size={36} color="#555" />
            <Text style={styles.imagePlaceholderText}>Seleccionar imagen</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Nombre */}
      <Text style={styles.label}>Nombre *</Text>
      <Controller
        control={control}
        name="nombre"
        rules={{required: 'El nombre es requerido'}}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={[styles.input, errors.nombre ? styles.inputError : null]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Nombre del producto"
            placeholderTextColor="#555"
          />
        )}
      />
      {errors.nombre && <Text style={styles.errorText}>{errors.nombre.message}</Text>}

      {/* Descripción */}
      <Text style={styles.label}>Descripción</Text>
      <Controller
        control={control}
        name="descripcion"
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={[styles.input, styles.textarea]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Descripción opcional"
            placeholderTextColor="#555"
            multiline
            numberOfLines={3}
          />
        )}
      />

      {/* Precio */}
      <Text style={styles.label}>Precio *</Text>
      <Controller
        control={control}
        name="precio"
        rules={{required: 'El precio es requerido', pattern: {value: /^\d+(\.\d+)?$/, message: 'Precio inválido'}}}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={[styles.input, errors.precio ? styles.inputError : null]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="0"
            placeholderTextColor="#555"
            keyboardType="numeric"
          />
        )}
      />
      {errors.precio && <Text style={styles.errorText}>{errors.precio.message}</Text>}

      {/* Tipo */}
      <Text style={styles.label}>Tipo</Text>
      <View style={styles.typeRow}>
        {(['ropa', 'cosmetico'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.typeBtn, tipo === t ? styles.typeBtnActive : null]}
            onPress={() => setValue('tipo', t)}>
            <Text style={[styles.typeBtnText, tipo === t ? styles.typeBtnTextActive : null]}>
              {t === 'ropa' ? '👕 Ropa' : '🧴 Cosmético'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categoría */}
      <Text style={styles.label}>Categoría</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat._id}
            style={[styles.catChip, selectedCategory === cat._id ? styles.catChipActive : null]}
            onPress={() => setSelectedCategory(selectedCategory === cat._id ? '' : cat._id)}>
            <Text style={[styles.catChipText, selectedCategory === cat._id ? styles.catChipTextActive : null]}>
              {cat.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Guardar */}
      <TouchableOpacity
        style={[styles.saveBtn, saving ? styles.saveBtnDisabled : null]}
        onPress={handleSubmit(onSubmit)}
        disabled={saving}
        activeOpacity={0.8}>
        {saving ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.saveBtnText}>{isEditing ? 'Guardar cambios' : 'Crear producto'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0a'},
  content: {padding: 20, paddingBottom: 40},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a'},
  imagePicker: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  imagePreview: {width: '100%', height: '100%'},
  imagePlaceholder: {flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8},
  imagePlaceholderText: {color: '#555', fontSize: 13},
  label: {color: '#aaa', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4},
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    marginBottom: 16,
  },
  inputError: {borderColor: '#ef4444'},
  textarea: {height: 80, textAlignVertical: 'top'},
  errorText: {color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 12},
  typeRow: {flexDirection: 'row', gap: 10, marginBottom: 16},
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  typeBtnActive: {borderColor: '#4ade80', backgroundColor: '#0a2f0a'},
  typeBtnText: {color: '#888', fontSize: 14},
  typeBtnTextActive: {color: '#4ade80', fontWeight: '600'},
  catRow: {marginBottom: 20},
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
  },
  catChipActive: {borderColor: '#4ade80', backgroundColor: '#0a2f0a'},
  catChipText: {color: '#888', fontSize: 13},
  catChipTextActive: {color: '#4ade80'},
  saveBtn: {
    backgroundColor: '#4ade80',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {opacity: 0.6},
  saveBtnText: {color: '#000', fontSize: 16, fontWeight: 'bold'},
});
