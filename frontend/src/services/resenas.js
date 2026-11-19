// Reseñas guardadas en Firebase (Firestore), plan gratuito.
//
// Firebase solo se descarga cuando alguien abre una ficha o deja una reseña, así no
// hace más lenta la primera carga. Si no hay configuración (.env vacío), las reseñas
// aparecen como "próximamente" y el resto de la app funciona igual.
//
// Las reglas de seguridad están en firebase/firestore.rules: solo se puede crear
// reseñas (no editarlas ni borrarlas) y se valida cada campo.

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const resenasActivas = Boolean(config.apiKey && config.projectId)

export const ETIQUETAS = ['Buena atención', 'Comida casera', 'Paisaje', 'Para niños', 'Buen precio']
const COLECCION = 'resenas'

let conexion = null
async function db() {
  if (!conexion) {
    conexion = Promise.all([import('firebase/app'), import('firebase/firestore')]).then(
      ([app, firestore]) => ({ firestore, db: firestore.getFirestore(app.initializeApp(config)) }),
    )
  }
  return conexion
}

/** Reseñas visibles de un emprendimiento, de la más reciente a la más antigua. */
export async function leerResenas(emprendimientoId) {
  if (!resenasActivas) return []
  const { firestore: f, db: base } = await db()
  const consulta = f.query(
    f.collection(base, COLECCION),
    f.where('emprendimientoId', '==', emprendimientoId),
    f.where('visible', '==', true),
    f.limit(50),
  )
  const resultado = await f.getDocs(consulta)
  return resultado.docs
    .map((d) => ({ id: d.id, ...d.data(), creado: d.data().creado?.toDate?.() ?? null }))
    .sort((a, b) => (b.creado ?? 0) - (a.creado ?? 0))
}

export async function publicarResena({ emprendimientoId, calificacion, etiquetas, texto, autor }) {
  const { firestore: f, db: base } = await db()
  await f.addDoc(f.collection(base, COLECCION), {
    emprendimientoId,
    calificacion,
    etiquetas: etiquetas.filter((e) => ETIQUETAS.includes(e)),
    texto: texto.trim().slice(0, 500),
    autor: autor.trim().slice(0, 60),
    visible: true,
    creado: f.serverTimestamp(),
  })
}

export function resumen(resenas) {
  if (!resenas.length) return null
  const promedio = resenas.reduce((s, r) => s + r.calificacion, 0) / resenas.length
  return { promedio: promedio.toFixed(1).replace('.', ','), total: resenas.length }
}
