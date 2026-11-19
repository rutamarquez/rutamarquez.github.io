import { useEffect, useRef, useState } from 'react'

// Mapa de la ruta con Leaflet y OpenStreetMap: gratis y sin clave de API.
// Leaflet se descarga solo cuando se abre esta pantalla, para no hacer lenta la portada.

export default function MapaRuta({ puntos, sellos }) {
  const contenedor = useRef(null)
  const [fallo, setFallo] = useState(false)

  useEffect(() => {
    let mapa
    let cancelado = false
    Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')])
      .then(([{ default: L }]) => {
        if (cancelado || !contenedor.current) return
        mapa = L.map(contenedor.current, {
          zoomControl: false,
          attributionControl: true,
          scrollWheelZoom: false,
        })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OpenStreetMap',
        }).addTo(mapa)

        const conUbicacion = puntos.filter((p) => p.ubicacion)
        const coords = conUbicacion.map((p) => [p.ubicacion.lat, p.ubicacion.lon])
        L.polyline(coords, { color: '#E2A93B', weight: 4, dashArray: '2 9', lineCap: 'round' }).addTo(mapa)
        conUbicacion.forEach((p) => {
          const hecho = Boolean(sellos[p.id])
          L.marker([p.ubicacion.lat, p.ubicacion.lon], {
            title: p.nombre,
            icon: L.divIcon({
              className: '',
              html: `<span class="marcador${hecho ? ' marcador--hecho' : ''}">${hecho ? '✓' : p.numero}</span>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            }),
          })
            .addTo(mapa)
            .bindPopup(`<b>${p.numero}. ${p.nombre}</b><br>${p.municipio}`)
        })
        mapa.fitBounds(coords, { padding: [28, 28] })
      })
      .catch(() => !cancelado && setFallo(true))
    return () => {
      cancelado = true
      mapa?.remove()
    }
  }, [puntos, sellos])

  if (fallo) {
    return <div className="mapa mapa--sin-conexion">El mapa necesita conexión. Las paradas están abajo.</div>
  }
  return <div className="mapa" ref={contenedor} role="img" aria-label="Mapa de la ruta con sus paradas" />
}
