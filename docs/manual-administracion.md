# Manual de administración

Para quien administre la app (la persona que contrate la alcaldía). No hace falta saber
React para el día a día: casi todo se hace editando archivos de datos.

## Agregar o editar un emprendimiento

Archivo: `datos/emprendimientos.csv`. Se puede abrir con Excel (Datos > Desde texto/CSV, con
codificación UTF-8 y separador coma) o con VS Code (la extensión *Rainbow CSV* ayuda a leerlo).

| Columna | Qué poner |
| --- | --- |
| `id` | Número único. Para uno nuevo, el siguiente al más alto. No reutilice números. |
| `nombre`, `municipio`, `vereda` | Como debe verse en la app |
| `provincia_marquez` | `Sí` o `No` (los de fuera se marcan como "Cercano") |
| `categorias` | Separadas por `|`. Válidas: `Comer`, `Dormir`, `Agroturismo`, `Senderos`, `Cultura`, `Productos locales` |
| `descripcion` | Una o dos frases sencillas |
| `que_hacer` | Actividades separadas por `|` |
| `duracion`, `acceso`, `horario` | Texto libre. Si `acceso` es `Solo con cita previa`, la ficha muestra un aviso |
| `whatsapp` | Celular de 10 dígitos, sin espacios ni +57 |
| `instagram`, `facebook`, `tiktok`, `web`, `reservas_url` | Enlaces completos que empiecen por `https://` |
| `google_maps_url` | Enlace de Google Maps del lugar (el que se obtiene con "Compartir") |
| `lat`, `lon` | Coordenadas en decimal (ej. `5.320213` y `-73.371302`) |
| `ubicacion_aproximada` | `No` si las coordenadas son exactas |
| `en_google_maps`, `reservas_en_linea`, `presencia_digital` | Respuestas del diagnóstico |
| `visible` | `No` para ocultarlo de la app sin borrarlo |
| `pendiente` | Notas internas: qué falta confirmar. No se muestra en la app |

Después: `python scripts/generar_datos.py` y subir los cambios a GitHub.

### Cómo sacar las coordenadas de Google Maps
En el computador, clic derecho sobre el lugar en Google Maps: el primer renglón del menú son las
coordenadas. Un clic las copia.

## Cambiar la ruta piloto o crear otra ruta

Archivo: `datos/rutas.json`. Cada parada tiene el `id` del emprendimiento, la hora sugerida, la
actividad y los minutos de trayecto hasta la siguiente. El orden de la lista es el orden de la ruta.

Cada parada necesita su código de sello en `datos/privado/codigos_sellos.csv` (y en el secreto
`CODIGOS_SELLOS` de GitHub, ver la guía de publicación).

## Códigos de los sellos

- Están en `datos/privado/codigos_sellos.csv`. Ese archivo no se sube a GitHub.
- Cada emprendedor de la ruta debe conocer **solo su código** para dárselo a los turistas que lo visitan.
- Para cambiar un código (por ejemplo, si se filtró): edítelo en el archivo, actualice el secreto
  `CODIGOS_SELLOS` en GitHub y vuelva a publicar. Los sellos que los turistas ya ganaron se conservan.

## Resultados de las pruebas

Archivo: `datos/resultados_pruebas.json`. Llene los números y cambie `"disponible"` a `true`.

## Ocultar una reseña inapropiada

Consola de Firebase > Firestore Database > colección `resenas` > abra la reseña > cambie el
campo `visible` a `false`. Desaparece de la app de inmediato.

## Verificar un premio

En el punto de información, abra `…/#/verificar` en cualquier celular o computador y escriba
el código que muestra el turista (formato `RM-0000-0`). Si es válido, anótelo en una planilla
de premios entregados para que no se use dos veces.

## Publicar una versión nueva del código

Si cambia algo en `frontend/src`, en `frontend/public/sw.js` cambie `VERSION` (por ejemplo, de
`ruta-marquez-v1` a `ruta-marquez-v2`). Así los celulares que ya tenían la app guardada
descargan la versión nueva.
