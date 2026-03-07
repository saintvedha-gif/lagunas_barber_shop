# Laguna's Barber & Shop — Guía de Instalación

## 1. Base de datos
1. Abre phpMyAdmin en XAMPP → http://localhost/phpmyadmin
2. Haz clic en **"Importar"**
3. Selecciona el archivo `laguna_shop_database.sql`
4. Haz clic en **"Continuar"**

## 2. Credenciales de acceso inicial
| Campo    | Valor         |
|----------|---------------|
| Usuario  | `admin`       |
| Contraseña | `Admin2025!` |

> ⚠️ **CAMBIA LA CONTRASEÑA INMEDIATAMENTE** después del primer login.

## 3. Cambiar la contraseña del admin
Ejecuta esto en phpMyAdmin → pestaña SQL:
```sql
UPDATE administradores
SET password_hash = '$2y$12$TU_NUEVO_HASH_AQUI'
WHERE usuario = 'admin';
```
Para generar el hash, crea un archivo PHP temporal:
```php
<?php echo password_hash('TuNuevaContraseña123!', PASSWORD_BCRYPT); ?>
```

## 4. Configurar conexión (si tu XAMPP usa puerto distinto)
Edita `config/conexion.php`:
```php
define('DB_PORT', '3306');  // Cambia si tu MySQL usa otro puerto
define('DB_PASS', '');      // Agrega tu contraseña si tienes una
```

## 5. Mejoras de seguridad aplicadas
- ✅ PDO + Prepared Statements (sin SQL Injection)
- ✅ Contraseñas con bcrypt (password_hash)
- ✅ Bloqueo tras 5 intentos fallidos (5 min)
- ✅ Log de accesos al panel
- ✅ Token CSRF en formularios
- ✅ Regeneración de ID de sesión al login
- ✅ Validación de tipos de imagen (no solo extensión)
- ✅ Límite de tamaño de imágenes (5MB)
- ✅ htmlspecialchars en todas las salidas
- ✅ Imágenes en tabla separada (no CSV en un campo)
