import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {authApi} from '../../api/auth.api';

interface FormFields {
  passwordActual: string;
  passwordNuevo: string;
  confirmar: string;
}

export default function SettingsScreen() {
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: {errors},
  } = useForm<FormFields>({
    defaultValues: {passwordActual: '', passwordNuevo: '', confirmar: ''},
  });
  const passwordNuevo = watch('passwordNuevo');

  const onSubmit = async (data: FormFields) => {
    setSaving(true);
    try {
      await authApi.changePassword(data.passwordActual, data.passwordNuevo);
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      reset();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Cambiar contraseña</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Contraseña actual *</Text>
        <Controller
          control={control}
          name="passwordActual"
          rules={{required: 'Campo requerido'}}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              style={[styles.input, errors.passwordActual ? styles.inputError : null]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#555"
            />
          )}
        />
        {errors.passwordActual && (
          <Text style={styles.errorText}>{errors.passwordActual.message}</Text>
        )}

        <Text style={styles.label}>Nueva contraseña *</Text>
        <Controller
          control={control}
          name="passwordNuevo"
          rules={{required: 'Campo requerido', minLength: {value: 6, message: 'Mínimo 6 caracteres'}}}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              style={[styles.input, errors.passwordNuevo ? styles.inputError : null]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#555"
            />
          )}
        />
        {errors.passwordNuevo && (
          <Text style={styles.errorText}>{errors.passwordNuevo.message}</Text>
        )}

        <Text style={styles.label}>Confirmar nueva contraseña *</Text>
        <Controller
          control={control}
          name="confirmar"
          rules={{
            required: 'Campo requerido',
            validate: v => v === passwordNuevo || 'Las contraseñas no coinciden',
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              style={[styles.input, errors.confirmar ? styles.inputError : null]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#555"
            />
          )}
        />
        {errors.confirmar && (
          <Text style={styles.errorText}>{errors.confirmar.message}</Text>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, saving ? styles.saveBtnDisabled : null]}
          onPress={handleSubmit(onSubmit)}
          disabled={saving}
          activeOpacity={0.8}>
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveBtnText}>Actualizar contraseña</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0a'},
  content: {padding: 20, paddingBottom: 40},
  sectionTitle: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    gap: 4,
  },
  label: {color: '#aaa', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8},
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    marginBottom: 4,
  },
  inputError: {borderColor: '#ef4444'},
  errorText: {color: '#ef4444', fontSize: 12, marginBottom: 8},
  saveBtn: {
    backgroundColor: '#4ade80',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnDisabled: {opacity: 0.6},
  saveBtnText: {color: '#000', fontSize: 15, fontWeight: 'bold'},
});
