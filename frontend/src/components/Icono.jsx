// Íconos en SVG dentro del código: no pesan nada extra ni dependen de internet.
const TRAZOS = {
  inicio: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  ruta: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 15V9a4 4 0 0 1 4-4h4m4 4v6a4 4 0 0 1-4 4h-4',
  sello: 'M12 3a5 5 0 0 1 3 9v2h4a2 2 0 0 1 2 2v2H3v-2a2 2 0 0 1 2-2h4v-2a5 5 0 0 1 3-9zM4 21h16',
  lista: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  buscar: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm9 3-4.35-4.35',
  atras: 'M15 18l-6-6 6-6',
  derecha: 'M5 12h14m-6-6 6 6-6 6',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  chat: 'M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z',
  redes: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm5.5-9.5h.01',
  check: 'M5 12.5 10 17.5 19 7',
  descargar: 'M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14',
  compartir: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v12m0-12L8 7m4-4 4 4',
  regalo: 'M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm-1-4h18v4H3zm9 0v14M12 7S10.5 3 8 3.5 7 7 12 7zm0 0s1.5-4 4-3.5S17 7 12 7z',
  grafico: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  reloj: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13v4l3 2',
  carro: 'M5 16h14M6.5 16v2.5M17.5 16v2.5M4 16v-4l2-5h12l2 5v4M4 12h16M7.5 14h.01M16.5 14h.01',
  web: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.6 3.5 5.6 3.5 9s-1 6.4-3.5 9c-2.5-2.6-3.5-5.6-3.5-9s1-6.4 3.5-9z',
  estrella: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-5v-4m0-4h.01',
}

export default function Icono({ nombre, tamano = 20, relleno = false, className }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill={relleno ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={relleno ? 1.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={TRAZOS[nombre]} />
    </svg>
  )
}
