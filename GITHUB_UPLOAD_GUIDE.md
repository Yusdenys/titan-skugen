# 🚀 Guía para Subir Titan SKUGen a GitHub

## ⚠️ IMPORTANTE: Seguridad Primero

**ANTES DE CONTINUAR:**
1. Ve a https://github.com/settings/security
2. **Cambia tu contraseña** inmediatamente
3. **Habilita 2FA** (autenticación de dos factores)


---

## 🔐 Método Recomendado: SSH

### **Paso 1: Generar Clave SSH**

Abre PowerShell y ejecuta:

```powershell
# Generar clave SSH
ssh-keygen -t ed25519 -C "yudemendoza@gmail.com"
```

**Presiona Enter** en cada pregunta para aceptar los valores por defecto.

### **Paso 2: Copiar tu Clave Pública**

```powershell
# Ver tu clave pública
Get-Content ~/.ssh/id_ed25519.pub

# O copiar directamente al portapapeles
Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard
```

### **Paso 3: Agregar Clave a GitHub**

1. Ve a: https://github.com/settings/keys
2. Click en **"New SSH key"**
3. **Title**: `Laptop Personal - Titan SKUGen`
4. **Key**: Pega tu clave pública
5. Click en **"Add SSH key"**
6. Confirma con tu contraseña

### **Paso 4: Probar Conexión SSH**

```powershell
ssh -T git@github.com
```

Deberías ver: `Hi Yusdenys! You've successfully authenticated...`

### **Paso 5: Crear Repositorio en GitHub**

1. Ve a: https://github.com/new
2. **Repository name**: `titan-skugen`
3. **Description**: `Sistema de generación de SKUs para tijeras - Grooming & Beauty`
4. Selecciona **Public** (para que sea visible) o **Private**
5. **NO marques** ninguna opción de inicialización
6. Click en **"Create repository"**

### **Paso 6: Conectar y Subir**

En tu PowerShell (desde F:\CODE\React\sku-generator):

```powershell
# Conectar con tu repositorio
git remote add origin git@github.com:Yusdenys/titan-skugen.git

# Verificar la conexión
git remote -v

# Subir el código
git push -u origin master
```

¡Listo! Tu código estará en: **https://github.com/Yusdenys/titan-skugen**

---

## 🔄 Para Futuras Actualizaciones

Cuando hagas cambios en el código:

```powershell
# Ver qué cambió
git status

# Agregar todos los cambios
git add .

# O agregar archivos específicos
git add components/define-product-form.jsx

# Crear commit
git commit -m "Descripción clara de tus cambios"

# Subir a GitHub
git push
```

---

## 🆘 Solución de Problemas

### **Error: "Permission denied (publickey)"**

```powershell
# Iniciar el agente SSH
Start-Service ssh-agent

# Agregar tu clave
ssh-add ~/.ssh/id_ed25519

# Probar de nuevo
ssh -T git@github.com
```

### **Error: "Could not resolve hostname"**

Verifica tu conexión a internet y vuelve a intentar.

### **Error: "remote: Repository not found"**

Asegúrate de haber creado el repositorio en GitHub primero.

---

## 📝 Alternativa: HTTPS con Token Personal

Si SSH no funciona, usa HTTPS:

### **1. Generar Token Personal**

1. Ve a: https://github.com/settings/tokens/new
2. **Note**: `titan-skugen-app`
3. **Expiration**: 90 days
4. **Scopes**: Marca **`repo`** (acceso completo a repositorios)
5. Click **"Generate token"**
6. **COPIA EL TOKEN** (solo se muestra una vez)

### **2. Conectar y Subir con HTTPS**

```powershell
# Conectar con HTTPS
git remote add origin https://github.com/Yusdenys/titan-skugen.git

# Subir (te pedirá credenciales)
git push -u origin master
```

**Cuando pida credenciales:**
- **Username**: `Yusdenys`
- **Password**: Pega el **token** (NO tu contraseña)

---

## 📊 Estado Actual del Proyecto

✅ **Git inicializado**
✅ **Commit inicial creado**: "Initial commit - Titan SKUGen"
✅ **48 archivos** listos para subir
✅ **12,277 líneas** de código
✅ **Sin errores** de linting

### **Archivos Incluidos:**
- ✅ Código fuente completo
- ✅ Componentes React
- ✅ API Routes
- ✅ Documentación (README, SETUP_DATABASE, etc.)
- ✅ Configuración (package.json, tailwind, etc.)
- ✅ Favicon personalizado
- ❌ `.env.local` (excluido por seguridad - en .gitignore)

---

## 🎯 Después de Subir

Tu repositorio estará en:
**https://github.com/Yusdenys/titan-skugen**

### **Cosas que puedes hacer:**
- Ver el código en línea
- Compartir el proyecto
- Clonar en otras computadoras
- Colaborar con otros desarrolladores
- Usar GitHub Pages para deployment

---

## ✅ Checklist Final

Antes de subir, verifica:
- [ ] Contraseña de GitHub cambiada
- [ ] 2FA habilitado en GitHub
- [ ] SSH configurado (o token generado)
- [ ] Repositorio creado en GitHub
- [ ] Conexión probada
- [ ] Listo para `git push`

---

## 🎉 ¡Éxito!

Una vez subido, tu proyecto estará disponible públicamente (o privadamente) en GitHub.

¿Necesitas ayuda con algún paso? ¡Estoy aquí para asistirte! 🚀

