"""
Genera los códigos QR para imprimir, uno por municipio, en un solo PDF.

    python scripts/generar_qr.py https://rutamarquez.github.io

Cada QR abre la app con el municipio en el enlace (?municipio=tibana), así la pantalla
de inicio muestra "Estás en Tibaná" con los emprendimientos de ese lugar.
La última página es un QR general, sin municipio.

IMPORTANTE: el enlace que se use aquí queda impreso. Si después cambia (otra cuenta de
GitHub, otro dominio), todos los QR impresos dejan de funcionar.
"""

import csv
import sys
import unicodedata
from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib import colors
from reportlab.lib.pagesizes import A5
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

RAIZ = Path(__file__).resolve().parent.parent
VERDE = colors.HexColor("#1F3B2D")
MOSTAZA = colors.HexColor("#E2A93B")


def clave(municipio: str) -> str:
    sin_tildes = unicodedata.normalize("NFD", municipio).encode("ascii", "ignore").decode()
    return "".join(c for c in sin_tildes.lower() if c.isalpha())


def pagina(c: canvas.Canvas, url: str, titulo: str, subtitulo: str) -> None:
    ancho, alto = A5
    c.setFillColor(VERDE)
    c.rect(0, alto - 62 * mm, ancho, 62 * mm, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica", 9)
    c.drawCentredString(ancho / 2, alto - 16 * mm, "RUTA MÁRQUEZ · PROVINCIA DE MÁRQUEZ, BOYACÁ")
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(ancho / 2, alto - 32 * mm, "Escanea y descubre")
    c.setFillColor(MOSTAZA)
    c.drawCentredString(ancho / 2, alto - 43 * mm, titulo)
    c.setFillColor(colors.white)
    c.setFont("Helvetica", 10)
    c.drawCentredString(ancho / 2, alto - 53 * mm, subtitulo)

    lado = 92 * mm
    qr = QrCodeWidget(url, barLevel="M")
    x0, y0, x1, y1 = qr.getBounds()
    dibujo = Drawing(lado, lado, transform=[lado / (x1 - x0), 0, 0, lado / (y1 - y0), 0, 0])
    dibujo.add(qr)
    x = (ancho - lado) / 2
    y = alto - 62 * mm - 12 * mm - lado
    c.setStrokeColor(MOSTAZA)
    c.setLineWidth(3)
    c.roundRect(x - 5 * mm, y - 5 * mm, lado + 10 * mm, lado + 10 * mm, 6 * mm)
    renderPDF.draw(dibujo, c, x, y)

    c.setFillColor(VERDE)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(ancho / 2, y - 14 * mm, "Apunta la cámara de tu celular aquí")
    c.setFont("Helvetica", 9.5)
    c.setFillColor(colors.HexColor("#555555"))
    c.drawCentredString(ancho / 2, y - 20 * mm, "Gratis. No necesitas descargar ninguna aplicación.")
    c.setFont("Helvetica", 7.5)
    c.drawCentredString(ancho / 2, 10 * mm, url)
    c.showPage()


def main() -> int:
    if len(sys.argv) != 2 or not sys.argv[1].startswith("https://"):
        print("Uso: python scripts/generar_qr.py https://enlace-de-la-app")
        return 1
    base = sys.argv[1].rstrip("/") + "/"
    with open(RAIZ / "datos" / "emprendimientos.csv", encoding="utf-8-sig") as f:
        filas = [r for r in csv.DictReader(f) if r["visible"] == "Sí" and r["municipio"]]
    conteo: dict[str, int] = {}
    for r in filas:
        conteo[r["municipio"]] = conteo.get(r["municipio"], 0) + 1

    destino = RAIZ / "qr-municipios.pdf"
    c = canvas.Canvas(str(destino), pagesize=A5)
    c.setTitle("Ruta Márquez · Códigos QR por municipio")
    for municipio, n in sorted(conteo.items()):
        texto = f"Emprendimientos rurales de {municipio} para comer, dormir y vivir el campo"
        pagina(c, f"{base}?municipio={clave(municipio)}", municipio, texto)
    pagina(c, base, "Márquez", "Emprendimientos rurales para comer, dormir y vivir el campo")
    c.save()
    print(f"Listo: {destino.name} con {len(conteo) + 1} páginas.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
