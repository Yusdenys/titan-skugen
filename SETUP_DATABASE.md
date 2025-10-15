# 🗄️ Configuración de Base de Datos PostgreSQL para Titan SKUGen

## 📋 **Requisitos Previos**

- PostgreSQL instalado (versión 12 o superior)
- Node.js y npm instalados
- Acceso a la terminal/consola

## 🚀 **Paso 1: Instalar PostgreSQL**

### Windows:
1. Descargar desde: https://www.postgresql.org/download/windows/
2. Ejecutar el instalador
3. Configurar contraseña para el usuario `postgres`
4. Recordar el puerto (por defecto: 5432)

### macOS:
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 🔧 **Paso 2: Crear la Base de Datos**

### Acceder a PostgreSQL:
```bash
# Windows (PowerShell)
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

### Crear Base de Datos y Tabla:
```sql
-- Crear la base de datos
CREATE DATABASE titan_skugen;

-- Conectarse a la base de datos
\c titan_skugen

-- Crear la tabla para las tijeras
CREATE TABLE scissors (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    type_of_shears VARCHAR(20) NOT NULL,
    segment VARCHAR(50) NOT NULL,
    size VARCHAR(20) NOT NULL,
    number_of_teeth INTEGER,
    color VARCHAR(10) NOT NULL,
    color_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_scissors_sku ON scissors(sku);
CREATE INDEX idx_scissors_serial_number ON scissors(serial_number);
CREATE INDEX idx_scissors_type ON scissors(type_of_shears);
CREATE INDEX idx_scissors_segment ON scissors(segment);
CREATE INDEX idx_scissors_created_at ON scissors(created_at DESC);

-- Verificar que la tabla se creó correctamente
\dt

-- Ver la estructura de la tabla
\d scissors

-- Salir de psql
\q
```

## ⚙️ **Paso 3: Configurar Variables de Entorno**

### Crear archivo `.env.local` en la raíz del proyecto:

```env
# Configuración de Base de Datos PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=titan_skugen
DB_PASSWORD=tu_contraseña_aqui
DB_PORT=5432
```

**⚠️ IMPORTANTE:** 
- Reemplaza `tu_contraseña_aqui` con tu contraseña real de PostgreSQL
- NO subas este archivo a Git (ya está en .gitignore)

## 📦 **Paso 4: Instalar Dependencias de Node**

```bash
npm install pg
npm install --save-dev @types/pg
```

## ✅ **Paso 5: Verificar la Conexión**

### Crear un script de prueba (test-db.js):

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'titan_skugen',
  password: 'tu_contraseña',
  port: 5432,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    const result = await client.query('SELECT NOW()');
    console.log('⏰ Hora del servidor:', result.rows[0].now);
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Error de conexión:', err);
  }
}

testConnection();
```

### Ejecutar el test:
```bash
node test-db.js
```

## 🎯 **Paso 6: Iniciar la Aplicación**

```bash
npm run dev
```

La aplicación ahora guardará las tijeras en PostgreSQL automáticamente.

## 📊 **Consultas Útiles de PostgreSQL**

### Ver todas las tijeras:
```sql
SELECT * FROM scissors ORDER BY created_at DESC;
```

### Buscar por SKU:
```sql
SELECT * FROM scissors WHERE sku = 'TPRO5528TRD';
```

### Contar tijeras por segmento:
```sql
SELECT segment, COUNT(*) as total 
FROM scissors 
GROUP BY segment;
```

### Tijeras con más dientes:
```sql
SELECT sku, number_of_teeth 
FROM scissors 
WHERE number_of_teeth IS NOT NULL 
ORDER BY number_of_teeth DESC 
LIMIT 10;
```

### Eliminar todas las tijeras (¡CUIDADO!):
```sql
TRUNCATE TABLE scissors RESTART IDENTITY CASCADE;
```

## 🔍 **Troubleshooting**

### Error: "password authentication failed"
- Verifica la contraseña en `.env.local`
- Reinicia PostgreSQL

### Error: "database does not exist"
- Asegúrate de haber creado la base de datos: `CREATE DATABASE titan_skugen;`

### Error: "connection refused"
- Verifica que PostgreSQL esté corriendo: `pg_isready`
- Verifica el puerto en `.env.local`

### Error: "table does not exist"
- Ejecuta el script de creación de tabla nuevamente

## 📱 **API Endpoints Disponibles**

### POST /api/scissors
Crear una nueva tijera
```json
{
  "sku": "TPRO5528TRD",
  "segment": "thinning",
  "edge": "convex",
  "series": "Pro",
  "size": "5.5",
  "numberOfTeeth": 28,
  "color": "RD",
  "colorName": "Red"
}
```

### GET /api/scissors
Obtener todas las tijeras
```
Query params opcionales:
- limit: número de resultados (default: 100)
- offset: paginación (default: 0)
- segment: filtrar por segmento
```

### GET /api/scissors/[id]
Obtener una tijera por ID

### PUT /api/scissors/[id]
Actualizar una tijera

### DELETE /api/scissors/[id]
Eliminar una tijera

## 🎉 **¡Listo!**

Tu aplicación ahora está conectada a PostgreSQL y guardará automáticamente las tijeras que definas.

