# ISAMER OS - Panel de Gestión Dual E-Commerce

Sistema de gestión comercial en tiempo real para **BB IMPORT** (https://bbimport.onrender.com/) y **LUMBAR FIX®** (https://lumbar-fix.vercel.app/).

---

## 1. Acceso Inmediato (Sin Desplegar Nada Aún)

Ya tienes una URL en vivo generada por Google AI Studio lista para usar:
- Puedes abrir el enlace de vista previa o el enlace compartido en tu navegador (computadora o celular).
- Puedes agregarla a la pantalla de inicio de tu celular ("Instalar aplicación" o "Agregar a inicio") y usarla como una app nativa PWA.
- Guarda todos los cambios, ventas, clientes e inventario en almacenamiento local persistente (`localStorage`).

---

## 2. Cómo Desplegarla en Render (Paso a Paso)

Dado que ya utilizas Render para **BB IMPORT**, puedes desplegar este panel en Render en menos de 2 minutos completamente gratis:

### Opción A: Conectar con GitHub (Recomendado)
1. En **Google AI Studio**, haz clic en el menú superior o de configuración (⚙️ Settings) y selecciona **Export to GitHub** (o descarga el ZIP y súbelo a un repositorio de GitHub).
2. Ve a tu panel de **[Render](https://dashboard.render.com/)**.
3. Haz clic en el botón azul **New +** y selecciona **Static Site**.
4. Conecta tu cuenta de GitHub y elige el repositorio de esta aplicación.
5. Render detectará automáticamente el archivo `render.yaml` o puedes ingresar estos parámetros:
   - **Name**: `isamer-os-ecommerce`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
6. Haz clic en **Create Static Site**.
7. En 1 minuto, Render te entregará tu URL personalizada (por ejemplo `https://isamer-os.onrender.com`).

#### Nota sobre Rutas (SPA en Render):
En el panel de tu Static Site en Render:
- Ve a **Redirects/Rewrites**.
- Agrega una regla:
  - **Source**: `/*`
  - **Destination**: `/index.html`
  - **Action**: `Rewrite`
*(Esto ya está preconfigurado en `render.yaml`)*.

---

## 3. Despliegue en Vercel (Alternativa)

Si prefieres tenerla en Vercel (junto a LUMBAR FIX®):
1. Importa el repositorio en **[Vercel Dashboard](https://vercel.com/)**.
2. Framework Preset: **Vite**.
3. Build & Output Settings: Se detectan automáticamente (`npm run build` y carpeta `dist`).
4. Haz clic en **Deploy**.
