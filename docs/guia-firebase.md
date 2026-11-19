# Guía de Firebase (reseñas)

Firebase guarda las reseñas que dejan los turistas. Plan gratuito (Spark): no pide tarjeta de
crédito y no se pausa por inactividad. Sus límites (unas 50.000 lecturas y 20.000 escrituras al
día) están muy por encima de lo que usará la app.

## 1. Crear el proyecto

1. Entre a [console.firebase.google.com](https://console.firebase.google.com) con el correo institucional.
2. **Crear un proyecto** → nombre `ruta-marquez` → puede desactivar Google Analytics → Crear.

## 2. Crear la base de datos

1. Menú izquierdo: **Compilación > Firestore Database > Crear base de datos**.
2. Ubicación: `southamerica-east1 (São Paulo)` o `us-east1`. **No se puede cambiar después.**
3. Modo: **producción**.
4. Pestaña **Reglas**: borre lo que hay, pegue el contenido de `firebase/firestore.rules` y **Publicar**.

## 3. Registrar la app web

1. Configuración del proyecto (ícono de engranaje) > **Tus apps** > ícono `</>` (Web).
2. Nombre: `Ruta Márquez`. No marque Firebase Hosting.
3. Aparece un bloque `firebaseConfig`. Copie estos cuatro valores:

| En Firebase | Variable |
| --- | --- |
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |

4. Póngalos en `frontend/.env` (para probar en su computador) y como **Variables** del
   repositorio en GitHub (para la versión publicada).

Estos valores **no son secretos**: van dentro de la app y cualquiera los puede ver. Lo que
protege la base de datos son las reglas del paso 2.

## 4. Primera reseña

Abra una ficha y deje una reseña. La primera vez, Firebase puede tardar unos segundos o pedir
crear un índice: si en la consola del navegador aparece un enlace "create index", ábralo y
confirme.

## Moderar reseñas

Firestore Database > colección `resenas` > abra la reseña > campo `visible` → `false`.

## Proteger contra abuso (recomendado antes de la publicación oficial)

Las reglas ya limitan qué se puede escribir, pero no cuántas veces. Para evitar spam:
**Compilación > App Check** > registrar la app con **reCAPTCHA Enterprise** > activar
"Enforce" en Firestore. Requiere agregar unas líneas en `frontend/src/services/resenas.js`
(ver la documentación de Firebase App Check para web).
