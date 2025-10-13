# 🔄 Actualización de Base de Datos - Campos Nuevos

Si ya creaste la tabla `scissors` anteriormente, necesitas agregar los nuevos campos.

## 📋 **Nuevos Campos Agregados**

- `serial_number` - Número de serie único (G1-001, B1-001, etc.)
- `type_of_shears` - Tipo de tijera (grooming o beauty)

---

## 🔧 **Opción 1: Actualizar Tabla Existente (Recomendado)**

Si ya tienes datos y quieres mantenerlos:

```sql
-- Conectarse a la base de datos
psql -U postgres -d titan_skugen

-- Agregar los nuevos campos
ALTER TABLE scissors 
ADD COLUMN serial_number VARCHAR(50),
ADD COLUMN type_of_shears VARCHAR(20);

-- Hacer que los campos sean obligatorios después de llenarlos
-- (Por ahora los dejamos opcionales para datos existentes)

-- Agregar índices para los nuevos campos
CREATE INDEX idx_scissors_serial_number ON scissors(serial_number);
CREATE INDEX idx_scissors_type ON scissors(type_of_shears);

-- Verificar los cambios
\d scissors
```

### **Actualizar Datos Existentes (Opcional)**

Si quieres actualizar las tijeras existentes con valores por defecto:

```sql
-- Asignar tipo "grooming" a todas las tijeras existentes
UPDATE scissors 
SET type_of_shears = 'grooming' 
WHERE type_of_shears IS NULL;

-- Generar números de serie para tijeras existentes
UPDATE scissors 
SET serial_number = 'G1-' || LPAD(id::text, 3, '0')
WHERE serial_number IS NULL;

-- Ahora hacer que los campos sean obligatorios
ALTER TABLE scissors 
ALTER COLUMN serial_number SET NOT NULL,
ALTER COLUMN type_of_shears SET NOT NULL;

-- Agregar constraint de unicidad
ALTER TABLE scissors
ADD CONSTRAINT scissors_serial_number_unique UNIQUE (serial_number);
```

---

## 🗑️ **Opción 2: Recrear Tabla (Pierde Datos)**

Si no tienes datos importantes o quieres empezar de cero:

```sql
-- Conectarse a la base de datos
psql -U postgres -d titan_skugen

-- Eliminar tabla existente (¡CUIDADO! Esto borra todos los datos)
DROP TABLE IF EXISTS scissors CASCADE;

-- Crear la nueva tabla con todos los campos
CREATE TABLE scissors (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    type_of_shears VARCHAR(20) NOT NULL,
    segment VARCHAR(50) NOT NULL,
    edge VARCHAR(50) NOT NULL,
    size VARCHAR(20) NOT NULL,
    number_of_teeth INTEGER,
    color VARCHAR(10) NOT NULL,
    color_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX idx_scissors_sku ON scissors(sku);
CREATE INDEX idx_scissors_serial_number ON scissors(serial_number);
CREATE INDEX idx_scissors_type ON scissors(type_of_shears);
CREATE INDEX idx_scissors_segment ON scissors(segment);
CREATE INDEX idx_scissors_created_at ON scissors(created_at DESC);

-- Verificar
\d scissors
```

---

## ✅ **Verificar Actualización**

Después de actualizar, verifica que los campos existan:

```sql
-- Ver la estructura de la tabla
\d scissors

-- Debería mostrar:
-- - serial_number | character varying(50) | not null
-- - type_of_shears | character varying(20) | not null
```

---

## 🚀 **Reiniciar la Aplicación**

Después de actualizar la base de datos:

```bash
# Detener el servidor actual (Ctrl+C)
# Reiniciar
npm run dev
```

---

## 📊 **Nuevo Sistema de Numeración de Serie**

### **Cómo Funciona:**

1. **Prefijo por tipo:**
   - Grooming → **G1**
   - Beauty → **B1**

2. **Número incremental:**
   - Primera tijera: `G1-001`
   - Segunda tijera idéntica: `G1-002`
   - Tercera tijera idéntica: `G1-003`

3. **Criterio de "idéntica":**
   Tijeras son consideradas idénticas si tienen los mismos valores en:
   - Type of Shears
   - Segment
   - Edge
   - Size
   - Color
   
   **NOTA:** El campo Series fue eliminado y reemplazado por el número de grupo del Serial Number

### **Ejemplo:**

```
Tijera 1: Grooming, Thinning, Convex, 5.5", RD
Serial: G1-001 (Grupo 1 de Grooming, primera tijera)
SKU: TG155RD

Tijera 2: Grooming, Thinning, Convex, 5.5", RD (IDÉNTICA)
Serial: G1-002 (Grupo 1 de Grooming, segunda tijera)
SKU: TG155RD

Tijera 3: Grooming, Thinning, Convex, 6", RD (DIFERENTE tamaño)
Serial: G2-001 (Grupo 2 de Grooming porque el tamaño cambió)
SKU: TG26RD

Tijera 4: Grooming, Straight, Convex, 5.5", RD (DIFERENTE segmento)
Serial: G3-001 (Grupo 3 de Grooming porque el segmento cambió)
SKU: SG355RD

Tijera 5: Beauty, Thinning, Convex, 5.5", RD (DIFERENTE tipo)
Serial: B1-001 (Grupo 1 de Beauty, los grupos son independientes por tipo)
SKU: TB155RD

Tijera 6: Grooming, Thinning, Convex, 5.5", RD (IDÉNTICA a tijera 1)
Serial: G1-003 (Grupo 1 de Grooming, tercera tijera)
SKU: TG155RD
```

---

## ⚠️ **Importante**

- El `serial_number` es **único** en la base de datos
- El `serial_number` se genera **automáticamente** en el frontend
- Si dos usuarios intentan crear la misma tijera simultáneamente, uno recibirá un error de duplicado

---

## 🎉 **¡Listo!**

Tu base de datos ahora soporta:
- ✅ Números de serie únicos (G1-001, B1-001, etc.)
- ✅ Tipo de tijera (Grooming/Beauty)
- ✅ Sistema de numeración incremental inteligente

