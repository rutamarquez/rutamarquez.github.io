# Ruta Márquez

Aplicación web para celular (PWA) que reúne los emprendimientos turísticos rurales de la
Provincia de Márquez, Boyacá, y la **ruta piloto** de un día por Ramiriquí, Tibaná y Jenesano.
Se abre escaneando un código QR, sin descargar nada, y también funciona en computador.

Proyecto de la Práctica en Responsabilidad Social: *Fortalecimiento y promoción de
emprendimientos turísticos de la Provincia de Márquez, Boyacá*.

## Qué hace

| Pantalla | Para qué sirve |
| --- | --- |
| Inicio | Presentación, buscador, categorías, ruta piloto y pasaporte de sellos |
| Directorio | Todos los emprendimientos, con búsqueda y filtro por categoría |
| Ficha | Descripción, **Cómo llegar** (Google Maps), **WhatsApp**, redes, sello y reseñas |
| Ruta | Mapa, paradas con horario y tiempos de trayecto, **itinerario en PDF** |
| Sellos | Pasaporte: 6 sellos para ganar el premio |
| Premio | Código del premio para reclamar en la alcaldía |
| Resultados | Diagnóstico de visibilidad digital y resultados de las pruebas |
| `#/verificar` | (Oculta) Para que la alcaldía verifique el código de premio |

## Arquitectura

```
               ┌──────────────────────────┐
 Excel / CSV ─▶│  Python (scripts/)       │──▶ frontend/public/data/*.json
 (datos/)      │  valida, calcula, genera │──▶ itinerario-ruta-piloto.pdf
               └──────────────────────────┘
                                                    ┌────────────────────┐
 Turista ── QR ──▶ GitHub Pages ──▶ React (PWA) ───▶│ Firebase Firestore │ (solo reseñas)
                                                    └────────────────────┘
```

- **Sin servidor propio ni base de datos que mantener.** Los datos de los emprendimientos son
  pocos y cambian poco, así que viven en un archivo (`datos/emprendimientos.csv`).
- **Python** limpia y valida los datos, calcula el diagnóstico y genera el PDF.
- **React + Vite** construye la app. Es una PWA: después de la primera visita abre rápido y
  funciona sin señal, algo importante en las veredas.
- **GitHub Pages** la publica gratis. **GitHub Actions** la vuelve a publicar sola cada vez que
  se cambia algo en el repositorio.
- **Firebase (Firestore, plan gratuito)** guarda solo las reseñas. Si no se configura, la app
  funciona igual y las reseñas aparecen como "próximamente".
- **Leaflet + OpenStreetMap** para el mapa (gratis, sin clave de API).

## Estructura

```
ruta-marquez/
├── datos/
│   ├── emprendimientos.csv      ← datos de los emprendimientos (se edita a mano)
│   ├── rutas.json               ← rutas y paradas
│   ├── resultados_pruebas.json  ← resultados de la prueba en campo
│   └── privado/                 ← NO se sube a GitHub (datos personales y códigos)
│       ├── forms_emprendimientos.xlsx
│       └── codigos_sellos.csv
├── scripts/
│   ├── limpiar_forms.py   ← Excel del Forms → emprendimientos.csv (una sola vez)
│   ├── generar_datos.py   ← valida y genera los archivos de la app
│   └── generar_qr.py      ← QR para imprimir, uno por municipio
├── frontend/
│   ├── public/            ← íconos, manifest, service worker, datos generados
│   └── src/
│       ├── pages/         ← una pantalla por archivo
│       ├── components/    ← piezas reutilizables
│       ├── services/      ← datos, pasaporte de sellos, reseñas (Firebase)
│       ├── hooks/         ← navegación, pasaporte, municipio del QR
│       └── styles/        ← estilos (colores de los mockups)
├── firebase/firestore.rules   ← reglas de seguridad de las reseñas
├── .github/workflows/         ← publicación automática
└── docs/                      ← guías de publicación, Firebase y administración
```

## Cómo correrla en su computador

Necesita: [VS Code](https://code.visualstudio.com/), [Node.js 20 o más](https://nodejs.org/),
[Python 3.11 o más](https://www.python.org/downloads/) (en Windows marque *Add Python to PATH*)
y [Git](https://git-scm.com/).

```bash
# 1. Python: instalar librerías y generar los datos de la app
python -m venv .venv
# Windows:  .venv\Scripts\activate      Mac/Linux:  source .venv/bin/activate
pip install -r requirements.txt
python scripts/generar_datos.py

# 2. App: instalar y abrir en modo desarrollo
cd frontend
npm install
npm run dev
```

La terminal muestra una dirección como `http://localhost:5173`. Para probarla en el celular,
conecte el celular al mismo wifi y abra la dirección `Network:` que también aparece.

Para las reseñas, copie `frontend/.env.example` como `frontend/.env` y llene los datos de
Firebase (ver [docs/guia-firebase.md](docs/guia-firebase.md)).

## Cómo actualizar la información

Ver el manual completo en [docs/manual-administracion.md](docs/manual-administracion.md). En resumen:

1. Edite `datos/emprendimientos.csv` (con Excel o VS Code).
2. Ejecute `python scripts/generar_datos.py`. Si hay un error (un teléfono mal escrito, un enlace
   sin `https://`) lo dice y no genera nada.
3. Suba los cambios a GitHub. La app se actualiza sola en uno o dos minutos.

## Publicación y QR

Ver [docs/guia-publicacion.md](docs/guia-publicacion.md). Lo más importante: el enlace de la
app **no puede cambiar** una vez se imprimen los QR.

## Privacidad (Ley 1581 de 2012)

- El Excel del Forms tiene datos personales y financieros. Vive en `datos/privado/`, que está
  en `.gitignore` y **nunca** se sube al repositorio, que es público.
- La app solo muestra datos de contacto comercial (nombre del negocio, WhatsApp, redes).
- El diagnóstico muestra solo totales, nunca datos de un emprendimiento en particular.
- Los códigos de los sellos no quedan escritos en la app: se guarda su huella SHA-256.

## Limitaciones conocidas del prototipo

- **Sellos:** se guardan en el celular del turista. Si borra los datos del navegador, los pierde.
  Los códigos son de 4 dígitos y la validación es local: alguien con conocimientos técnicos podría
  probar combinaciones. Para una versión final, validarlos en Firebase o un servidor.
- **Premio:** el código tiene un dígito de control (no se puede inventar al azar), pero no se
  registra en ningún lado. La alcaldía debe llevar una planilla de premios entregados.
- **Ubicaciones:** varios emprendimientos no tienen coordenadas exactas. En esos casos el mapa
  usa el centro del municipio y "Cómo llegar" busca el negocio por nombre en Google Maps.
- **Fotos:** aún no hay; se muestra la inicial del negocio.
