"""
Genera los archivos que usa la app a partir de los datos curados.

    python scripts/generar_datos.py

Lee:
    datos/emprendimientos.csv         (se edita a mano)
    datos/rutas.json                  (rutas y paradas)
    datos/resultados_pruebas.json     (resultados de la prueba en campo)
    datos/privado/codigos_sellos.csv  (códigos de los sellos; NO se sube a GitHub)

Escribe en frontend/public/:
    data/emprendimientos.json   solo los emprendimientos visibles y solo datos públicos
    data/rutas.json             rutas con sus paradas (los códigos van cifrados con SHA-256)
    data/diagnostico.json       indicadores agregados (nunca datos de un negocio en particular)
    itinerario-ruta-piloto.pdf  itinerario descargable para consultar sin conexión

Si encuentra un error en los datos, lo muestra y termina sin generar nada.
Las advertencias (datos pendientes) se muestran pero no detienen el proceso.
"""

from __future__ import annotations

import csv
import hashlib
import json
import sys
from datetime import date
from pathlib import Path
from urllib.parse import quote

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "datos"
SALIDA = RAIZ / "frontend" / "public"

CATEGORIAS_VALIDAS = ["Comer", "Dormir", "Agroturismo", "Senderos", "Cultura", "Productos locales"]
CAMPOS_LISTA = ("categorias", "que_hacer")

errores: list[str] = []
advertencias: list[str] = []


# ---------------------------------------------------------------------------
# Lectura y validación
# ---------------------------------------------------------------------------
def leer_emprendimientos() -> list[dict]:
    with open(DATOS / "emprendimientos.csv", encoding="utf-8-sig") as f:
        filas = list(csv.DictReader(f))

    ids = set()
    for fila in filas:
        ref = f"Emprendimiento {fila['id']} ({fila['nombre']})"
        fila["id"] = int(fila["id"])
        if fila["id"] in ids:
            errores.append(f"{ref}: el id está repetido.")
        ids.add(fila["id"])

        for campo in CAMPOS_LISTA:
            fila[campo] = [v.strip() for v in fila[campo].split("|") if v.strip()]
        for cat in fila["categorias"]:
            if cat not in CATEGORIAS_VALIDAS:
                errores.append(f"{ref}: categoría desconocida '{cat}'. Válidas: {CATEGORIAS_VALIDAS}")

        for campo in ("whatsapp", "whatsapp_alterno"):
            numero = fila[campo]
            if numero and not (len(numero) == 10 and numero.isdigit() and numero.startswith("3")):
                errores.append(f"{ref}: {campo} '{numero}' no es un celular colombiano de 10 dígitos.")

        for campo in ("instagram", "facebook", "tiktok", "web", "reservas_url", "google_maps_url"):
            if fila[campo] and not fila[campo].startswith("https://"):
                errores.append(f"{ref}: el enlace de {campo} debe empezar por https://")

        fila["lat"] = float(fila["lat"]) if fila["lat"] else None
        fila["lon"] = float(fila["lon"]) if fila["lon"] else None
        if fila["lat"] is not None and not (4.0 < fila["lat"] < 7.5 and -75 < fila["lon"] < -71.5):
            errores.append(f"{ref}: las coordenadas no quedan en Boyacá.")

        fila["visible"] = fila["visible"] == "Sí"
        if fila["visible"]:
            if not fila["whatsapp"]:
                advertencias.append(f"{ref}: no tiene WhatsApp; la app oculta ese botón.")
            if fila["lat"] is None:
                advertencias.append(f"{ref}: no tiene ubicación; no aparece en el mapa.")
        if fila["pendiente"]:
            advertencias.append(f"{ref}: pendiente -> {fila['pendiente']}")
    return filas


def leer_codigos() -> dict[tuple[str, int], str]:
    ruta = DATOS / "privado" / "codigos_sellos.csv"
    if not ruta.exists():
        errores.append("Falta datos/privado/codigos_sellos.csv (códigos de los sellos).")
        return {}
    with open(ruta, encoding="utf-8") as f:
        codigos = {(r["ruta"], int(r["emprendimiento"])): r["codigo"].strip() for r in csv.DictReader(f)}
    for (ruta_id, emp), codigo in codigos.items():
        if not (len(codigo) == 4 and codigo.isdigit()):
            errores.append(f"Código del sello {ruta_id}/{emp} debe tener 4 dígitos.")
    return codigos


def huella_codigo(ruta_id: str, emprendimiento: int, codigo: str) -> str:
    """SHA-256 del código. La app compara la huella, así el código no queda escrito en la página."""
    return hashlib.sha256(f"{ruta_id}:{emprendimiento}:{codigo}".encode()).hexdigest()


# ---------------------------------------------------------------------------
# Construcción de los archivos públicos
# ---------------------------------------------------------------------------
def enlace_como_llegar(e: dict) -> str:
    if e["google_maps_url"]:
        return e["google_maps_url"]
    if e["lat"] is not None and e["ubicacion_aproximada"] != "Sí":
        return f"https://www.google.com/maps/dir/?api=1&destination={e['lat']},{e['lon']}"
    # Ubicación aproximada: mejor buscar por nombre que mandar al turista a un punto inventado.
    consulta = ", ".join(p for p in (e["nombre"], e["vereda"] and f"vereda {e['vereda']}",
                                     e["municipio"], "Boyacá") if p)
    return f"https://www.google.com/maps/search/?api=1&query={quote(consulta)}"


def publico(e: dict) -> dict:
    return {
        "id": e["id"],
        "nombre": e["nombre"],
        "municipio": e["municipio"],
        "vereda": e["vereda"] or None,
        "provinciaMarquez": e["provincia_marquez"] == "Sí",
        "categorias": e["categorias"],
        "descripcion": e["descripcion"],
        "queHacer": e["que_hacer"],
        "duracion": e["duracion"] or None,
        "acceso": e["acceso"] or None,
        "horario": e["horario"] or None,
        "whatsapp": e["whatsapp"] or None,
        "redes": {k: e[k] for k in ("instagram", "facebook", "tiktok", "web") if e[k]},
        "reservasUrl": e["reservas_url"] or None,
        "comoLlegarUrl": enlace_como_llegar(e),
        "ubicacion": ({"lat": e["lat"], "lon": e["lon"], "aproximada": e["ubicacion_aproximada"] == "Sí"}
                      if e["lat"] is not None else None),
    }


def construir_rutas(emprendimientos: dict[int, dict], codigos: dict) -> dict:
    with open(DATOS / "rutas.json", encoding="utf-8") as f:
        datos = json.load(f)
    rutas = []
    for ruta in datos["rutas"]:
        paradas = []
        for numero, parada in enumerate(ruta["paradas"], start=1):
            emp = emprendimientos.get(parada["emprendimiento"])
            if emp is None or not emp["visible"]:
                errores.append(f"Ruta {ruta['id']}: la parada {numero} apunta al emprendimiento "
                               f"{parada['emprendimiento']}, que no existe o no está visible.")
                continue
            codigo = codigos.get((ruta["id"], emp["id"]))
            if codigo is None:
                errores.append(f"Ruta {ruta['id']}: falta el código del sello de {emp['nombre']}.")
                continue
            paradas.append({**parada, "numero": numero,
                            "huellaCodigo": huella_codigo(ruta["id"], emp["id"], codigo)})
        municipios = list(dict.fromkeys(emprendimientos[p["emprendimiento"]]["municipio"]
                                        for p in paradas))
        rutas.append({**ruta, "paradas": paradas, "municipios": municipios})
    return {"rutas": rutas}


def conteo(filas: list[dict], campo: str) -> dict[str, int]:
    resultado: dict[str, int] = {}
    for f in filas:
        resultado[f[campo]] = resultado.get(f[campo], 0) + 1
    return resultado


def construir_diagnostico(filas: list[dict]) -> dict:
    """Indicadores sobre todos los emprendimientos que respondieron el Forms (también los ocultos).
    Los que se agregaron después sin encuesta no tienen esas respuestas y no se cuentan."""
    filas = [f for f in filas if f["en_google_maps"] and f["reservas_en_linea"]]
    total = len(filas)

    def indicador(titulo, campo, malos, descripcion):
        cuenta = conteo(filas, campo)
        sin = sum(cuenta.get(m, 0) for m in malos)
        return {"titulo": titulo, "descripcion": descripcion, "sin": sin, "con": total - sin,
                "porcentajeSin": round(100 * sin / total), "detalle": cuenta}

    municipios = sorted(conteo(filas, "municipio").items(), key=lambda kv: -kv[1])
    with open(DATOS / "resultados_pruebas.json", encoding="utf-8") as f:
        pruebas = json.load(f)
    pruebas.pop("_nota", None)
    return {
        "totalEmprendimientos": total,
        "totalMunicipios": len([m for m, _ in municipios if m]),
        "indicadores": [
            indicador("Google Maps", "en_google_maps", ("No", "No sabe"),
                      "no aparecen en Google Maps o no saben si aparecen"),
            indicador("Reservas en línea", "reservas_en_linea", ("No", "En proceso"),
                      "no tienen un sistema de reservas o compras en línea"),
            indicador("Redes sociales", "presencia_digital", ("No", "En proceso"),
                      "no tienen presencia en redes sociales"),
        ],
        "porMunicipio": [{"municipio": m or "Sin municipio", "total": n} for m, n in municipios],
        "pruebas": pruebas,
        "actualizado": date.today().isoformat(),
    }


# ---------------------------------------------------------------------------
# PDF del itinerario
# ---------------------------------------------------------------------------
def generar_pdf(ruta: dict, emprendimientos: dict[int, dict], destino: Path) -> None:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    verde, mostaza, crema = colors.HexColor("#1F3B2D"), colors.HexColor("#E2A93B"), colors.HexColor("#F6F0E2")
    titulo = ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=22, textColor=verde, leading=26)
    sub = ParagraphStyle("s", fontName="Helvetica", fontSize=10.5, textColor=colors.HexColor("#555555"), leading=14)
    normal = ParagraphStyle("n", fontName="Helvetica", fontSize=9.5, leading=12.5)
    negrita = ParagraphStyle("b", parent=normal, fontName="Helvetica-Bold", fontSize=10.5, textColor=verde)
    pequeño = ParagraphStyle("p", parent=normal, fontSize=8.5, textColor=colors.HexColor("#555555"))

    doc = SimpleDocTemplate(str(destino), pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm,
                            topMargin=14 * mm, bottomMargin=14 * mm,
                            title=f"Ruta Márquez · {ruta['nombre']}", author="Ruta Márquez")
    partes = [
        Paragraph("RUTA MÁRQUEZ · PROVINCIA DE MÁRQUEZ, BOYACÁ", pequeño), Spacer(1, 3 * mm),
        Paragraph(f"{ruta['nombre']}: {ruta['subtitulo']}", titulo), Spacer(1, 2 * mm),
        Paragraph(f"{ruta['duracion']} · {len(ruta['paradas'])} paradas · {ruta['transporte'].lower()}", sub),
        Spacer(1, 2 * mm), Paragraph(ruta["descripcion"], normal), Spacer(1, 6 * mm),
    ]
    filas = []
    for p in ruta["paradas"]:
        e = emprendimientos[p["emprendimiento"]]
        lugar = e["municipio"] + (f", vereda {e['vereda']}" if e["vereda"] else "")
        contacto = f"WhatsApp: {e['whatsapp'][:3]} {e['whatsapp'][3:6]} {e['whatsapp'][6:]}" if e["whatsapp"] \
            else "WhatsApp: por confirmar"
        detalle = [Paragraph(f"{p['numero']}. {e['nombre']}", negrita),
                   Paragraph(f"{lugar} · {p['actividad']}", normal),
                   Paragraph(f"{contacto} · <link href='{enlace_como_llegar(e)}' color='#1F3B2D'>"
                             f"<u>Cómo llegar</u></link>", pequeño)]
        filas.append([Paragraph(f"<b>{p['hora']}</b>", normal), detalle])
        if p.get("minutos_a_siguiente"):
            filas.append(["", Paragraph(f"↓ unos {p['minutos_a_siguiente']} min en carro", pequeño)])
    tabla = Table(filas, colWidths=[26 * mm, None])
    tabla.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                               ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                               ("LINEBEFORE", (1, 0), (1, -1), 2, mostaza)]))
    partes += [tabla, Spacer(1, 6 * mm)]
    premio = ruta["premio"]
    caja = Table([[Paragraph(f"<b>Premio: {premio['nombre']}</b><br/>" + "<br/>".join(
        f"• {i}" for i in premio["incluye"]) + f"<br/>Se reclama en: {premio['lugar_reclamo']}.", normal)]],
                 colWidths=[None])
    caja.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), crema), ("BOX", (0, 0), (-1, -1), 1, mostaza),
                              ("LEFTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 6),
                              ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
    partes += [caja, Spacer(1, 4 * mm), Paragraph(
        "Consejos: en zonas rurales la señal es débil, guarde este PDF antes de salir. Varias paradas "
        "atienden con reserva, escriba por WhatsApp un día antes. Los tiempos de trayecto son aproximados.",
        pequeño)]
    doc.build(partes)


# ---------------------------------------------------------------------------
def main() -> int:
    filas = leer_emprendimientos()
    codigos = leer_codigos()
    por_id = {f["id"]: f for f in filas}
    rutas = construir_rutas(por_id, codigos)
    diagnostico = construir_diagnostico(filas)

    for a in advertencias:
        print(f"  [aviso] {a}")
    if errores:
        print("\nNo se generaron los archivos. Corrija estos errores:")
        for e in errores:
            print(f"  [ERROR] {e}")
        return 1

    (SALIDA / "data").mkdir(parents=True, exist_ok=True)
    visibles = [publico(f) for f in filas if f["visible"]]

    def guardar(nombre, contenido):
        with open(SALIDA / "data" / nombre, "w", encoding="utf-8") as f:
            json.dump(contenido, f, ensure_ascii=False, indent=1)

    guardar("emprendimientos.json", visibles)
    guardar("rutas.json", rutas)
    guardar("diagnostico.json", diagnostico)
    for ruta in rutas["rutas"]:
        generar_pdf(ruta, por_id, SALIDA / f"itinerario-{ruta['id']}.pdf")

    print(f"\nListo: {len(visibles)} emprendimientos visibles de {len(filas)}, "
          f"{len(rutas['rutas'])} ruta(s), {len(advertencias)} aviso(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
