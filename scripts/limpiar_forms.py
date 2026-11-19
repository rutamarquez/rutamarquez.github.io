"""
Limpieza inicial de las respuestas del formulario "Queremos conocer tu emprendimiento".

Se ejecuta UNA sola vez (o cuando llegue un formulario nuevo) para pasar del
Excel original (privado) al archivo público y curado `datos/emprendimientos.csv`.

    python scripts/limpiar_forms.py

Por qué existe este paso:
- El Excel del Forms tiene datos personales y financieros (representante,
  correo, créditos, situación ante la DIAN). Según la Ley 1581 de 2012 eso no se
  publica. Este script solo copia los campos que la app necesita mostrar.
- Las respuestas vienen en texto libre (teléfonos con espacios, enlaces mezclados,
  nombres en mayúsculas). Aquí se normalizan y se aplican las correcciones
  manuales, cada una documentada en CORRECCIONES.

Después de este paso, el archivo que se edita a mano es `datos/emprendimientos.csv`.
"""

from pathlib import Path
import re

import pandas as pd

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "datos" / "privado" / "forms_emprendimientos.xlsx"
DESTINO = RAIZ / "datos" / "emprendimientos.csv"

# Columnas del Forms que se usan (por posición, porque los encabezados son preguntas largas)
COL = {
    "id": 0, "nombre": 6, "whatsapp": 8, "municipio": 10, "zona": 11,
    "acceso": 13, "hacer": 16, "duracion": 17, "donde_internet": 28, "enlaces": 29,
    "google_maps": 30, "reservas": 32,
}

# Centro aproximado de cada municipio (lat, lon). Se usa mientras no haya
# coordenadas exactas de cada emprendimiento.
CENTROS = {
    "Ramiriquí": (5.4011, -73.3352), "Tibaná": (5.3172, -73.3964),
    "Jenesano": (5.3856, -73.3636), "Nuevo Colón": (5.3553, -73.4567),
    "Úmbita": (5.2208, -73.4567), "Ciénega": (5.4086, -73.2958),
    "San Eduardo": (5.2242, -73.0778), "Ventaquemada": (5.3664, -73.5225),
    "Villa de Leyva": (5.6339, -73.5244),
}
PROVINCIA_MARQUEZ = {"Ramiriquí", "Tibaná", "Jenesano", "Nuevo Colón", "Úmbita", "Ciénega",
                     "Boyacá", "Rondón", "Turmequé", "Viracachá"}

# Respuesta "¿Qué puede hacer un visitante?" -> categoría del directorio
CATEGORIAS = {
    "Comer": "Comer", "Hospedarse": "Dormir", "Conocer procesos campesinos": "Agroturismo",
    "Hacer senderismo": "Senderos", "Conocer naturaleza": "Senderos",
    "Participar en talleres": "Cultura", "Conocer cultura local": "Cultura",
    "Conocer tradiciones": "Cultura", "Comprar productos locales": "Productos locales",
    "Realizar actividades de aventura": "Senderos",
    "Actividades de relajación y reflexión": "Senderos",
}
ORDEN_CATEGORIAS = ["Comer", "Dormir", "Agroturismo", "Senderos", "Cultura", "Productos locales"]

ACCESO = {
    "Sí": "Abierto a visitantes",
    "Sí, pero requiere orientación": "Requiere orientación para llegar",
    "Depende de la temporada": "Según la temporada",
    "No actualmente": "Solo con cita previa",
}

# ---------------------------------------------------------------------------
# Correcciones manuales. Cada una dice por qué se hizo.
# ---------------------------------------------------------------------------
CORRECCIONES = {
    1: {"nombre": "Viajes y Travesías MC",
        "descripcion": "Experiencias de turismo rural con amasijos, comida típica y caminatas.",
        "pendiente": "Dice tener Facebook, Instagram, TikTok y Google Maps, pero no dejó enlaces."},
    2: {"nombre": "Marú, Casa Artesanal",
        "descripcion": "Panadería artesanal con recordatorios y obleas con fruta.",
        "pendiente": "Pedir enlace de Google Maps."},
    3: {"nombre": "Stella Artesanías",
        "descripcion": "Recordatorios hechos a mano en el casco urbano de Tibaná.",
        "pendiente": "Facebook en creación."},
    4: {"nombre": "Sendero a La Burrera",
        "descripcion": "Caminata guiada de nivel intermedio con una vista muy bonita, plantas y aves. "
                       "Según la época se llega a una cascada; si no, se organiza un taller de pintura "
                       "o un círculo de palabra.",
        "pendiente": "Confirmar en qué meses se puede visitar."},
    5: {"nombre": "Lenguparque: Agroturismo y Bienestar",
        "descripcion": "Agroturismo y bienestar con alojamiento, comida, productos del campo y "
                       "actividades de relajación.",
        "pendiente": "Está en San Eduardo, fuera de la provincia: confirmar si se incluye."},
    6: {"nombre": "El Mirador de la Cima",
        "descripcion": "Mirador rural con comida y alojamiento rural en preparación.",
        "whatsapp": "3105588985", "whatsapp_alterno": "3107820930",
        "google_maps_url": "https://maps.app.goo.gl/zNug43fVKdvUKhks7", "web": "",
        "pendiente": "Pedir enlaces de Facebook e Instagram; confirmar cuál WhatsApp se publica."},
    7: {"descripcion": "Alojamiento rural y cocina campesina, con talleres junto a artesanas y "
                       "caminatas al cerro El Castillejo, el Parque Natural Municipal Guanachas y "
                       "la laguna de Agua Blanca.",
        "pendiente": "Pedir enlace de Google Maps."},
    8: {"nombre": "Anali Viajes",
        "descripcion": "Pasadías desde Bogotá con transporte, alimentación y guía local: caminata al "
                       "cerro El Castillejo, taller de amasijos y experiencia de papa nativa.",
        "pendiente": "Pedir enlace de Google Maps."},
    # ID 9 y 23 son el mismo emprendimiento (respondió dos veces). Se combinan en el 9.
    9: {"nombre": "Casa Hospedaje Rural El Cerezo",
        "descripcion": "Hospedaje rural con alimentación.",
        "whatsapp": "3005590740", "whatsapp_alterno": "3015505654", "duracion": "Día completo",
        "pendiente": "Registro combinado con el ID 23. Confirmar duración y WhatsApp principal."},
    10: {"nombre": "Sendero de la Miel - Encuentro de Dos Mundos",
         "descripcion": "Proyecto de turismo rural y agroturismo que se está construyendo.",
         "pendiente": "Redes en proceso."},
    # El WhatsApp del formulario tiene 11 dígitos; el número válido aparece en el campo de redes.
    11: {"nombre": "Arepas Las Milagrosas", "whatsapp": "3132464869",
         "descripcion": "Arepa artesanal hecha en laja. Se puede ver cómo se prepara y participar en talleres.",
         "pendiente": "Confirmar el WhatsApp (el del formulario tenía 11 dígitos). Pedir enlace de Google Maps."},
    12: {"vereda": "Ruche",
         "descripcion": "Hospedaje rural, cocina tradicional boyacense, recorrido cultural, el sendero "
                        "del oso, talleres y artesanías.",
         "pendiente": "Pedir enlaces directos de Instagram, Facebook y Google Maps."},
    13: {"tiktok": "https://www.tiktok.com/@ranchoalegretibana",
         "descripcion": "Recorrido por cultivos de manzana, procesos de la finca y venta de la fruta cosechada.",
         "pendiente": "Verificar TikTok (el enlace venía mal escrito). Pedir enlace de Google Maps."},
    # El WhatsApp está incompleto ("31357"): se deja vacío y la app oculta el botón.
    14: {"nombre": "Bague Tradición", "whatsapp": "",
         "descripcion": "Artesanías en fique, gaita, paja blanca, calceta de plátano, esparto y cuero, "
                        "con talleres de tejeduría y cestería.",
         "pendiente": "URGENTE: el WhatsApp está incompleto. Pedir enlace de Google Maps."},
    15: {"nombre": "Cabañas Rurales La Posada",
         "descripcion": "Cabañas para hospedaje rural, en preparación."},
    # Aparece con nombre de persona: se oculta hasta conocer el nombre del negocio.
    16: {"nombre": "Restaurante y Cafetería (por confirmar)", "visible": "No",
         "descripcion": "Restaurante y cafetería.",
         "pendiente": "Falta el nombre del emprendimiento."},
    17: {"nombre": "Raíces Vivas de mi Tierra",
         "descripcion": "Experiencias culturales y caminatas ecológicas alrededor de las fiestas de "
                        "Nuevo Colón, como el Reinado de la Flor, el Concurso de la Auyama y el "
                        "Festival de las Frutas y la Ruana."},
    18: {"nombre": "Saberes y Sabores de Pura Cepa",
         "descripcion": "Talleres educativos sobre la cultura frutícola y pecuaria de la zona.",
         "pendiente": "Pedir enlace de Google Maps."},
    19: {"nombre": "Caminos Andinos", "municipio": "Ventaquemada",
         "descripcion": "Guianza y experiencias comunitarias en Ventaquemada, Turmequé, Ramiriquí y Nuevo Colón.",
         "pendiente": "Está en Tunja-Ventaquemada, fuera de la provincia: confirmar si se incluye."},
    20: {"reservas_url": "https://www.airbnb.com/rooms/52535349",
         "descripcion": "Alojamiento rural con caminatas ecoturísticas guiadas y experiencias "
                        "espirituales en la laguna."},
    # El enlace de Facebook era la página general de Facebook, no la de ellos.
    21: {"nombre": "ASORFEM - Asociación Orgánica Rural Femenina", "facebook": "",
         "tiktok": "https://www.tiktok.com/@asorfem",
         "descripcion": "Asociación de mujeres campesinas que produce abono orgánico. Ofrece talleres "
                        "y venta de productos.",
         "pendiente": "Pedir el enlace correcto de Facebook."},
    22: {"nombre": "Ruta Entre Alas y Flores",
         "descripcion": "Recorridos a pie y en bicicleta por fincas frutícolas, talleres sobre "
                        "polinizadores y demostraciones de cosecha, poda e injerto. Tiene dulces y "
                        "mermeladas de fruta y alojamiento rural."},
    # ID 23 se combinó en el 9.
    24: {"nombre": "Experiencias agroecológicas (por confirmar)", "municipio": "", "visible": "No",
         "descripcion": "Cocina tradicional, recorridos agroganaderos y vivencias campesinas.",
         "pendiente": "Falta el nombre del emprendimiento y el municipio."},
    25: {"nombre": "Turismo de Bienestar", "municipio": "Villa de Leyva",
         "descripcion": "Talleres de bordado, mostacilla y pintura.",
         "pendiente": "Está en Villa de Leyva (provincia de Ricaurte): confirmar si se incluye. "
                      "Pedir enlace de Instagram."},
    26: {"nombre": "Alsf Alimentos Liofilizados",
         "descripcion": "Fruta liofilizada producida en Nuevo Colón. Hace parte de la Ruta Entre Alas y Flores.",
         "pendiente": "Confirmar si \"Flafs.co\" es su página web o Instagram."},
    27: {"vereda": "Siramá", "whatsapp": "3104481690", "whatsapp_alterno": "3125133156",
         "instagram": "https://www.instagram.com/laacuarela2003",
         "descripcion": "Restaurante bajo reserva con postres, snacks y café.",
         "pendiente": "Pedir enlaces de Facebook y Google Maps."},
    28: {"nombre": "Sendero Interpretativo Entre Alas y Flores", "vereda": "Llano Grande",
         "descripcion": "Caminatas por la naturaleza en la vereda Llano Grande. Hace parte de la Ruta "
                        "Entre Alas y Flores."},
    29: {"nombre": "Del Fogón", "instagram": "https://www.instagram.com/cocinacampesinadelfogon",
         "descripcion": "Cocina tradicional boyacense y talleres de amasijos, bebidas fermentadas y platos típicos.",
         "pendiente": "Pedir enlaces de Facebook y Google Maps."},
}
IDS_COMBINADOS = {23: 9}

# ---------------------------------------------------------------------------
# Datos tomados de la base de seguimiento del grupo ("Emprendedores.xlsx", hoja Base A).
# Coordenadas exactas que dieron los emprendedores (las que venían en grados, minutos
# y segundos se pasaron a decimales).
# ---------------------------------------------------------------------------
COORDENADAS = {
    3: (5.318444, -73.396389),    # Stella Artesanías
    5: (5.224244, -73.077485),    # Lenguparque (cl. 5 # 3-2, San Eduardo)
    7: (5.217630, -73.506350),    # Rastro de Niebla
    10: (5.376659, -73.367033),   # Sendero de la Miel
    11: (5.401121, -73.334219),   # Arepas Las Milagrosas
    12: (5.320213, -73.371302),   # Casa del Viejo Territorio Muisca
    13: (5.325110, -73.367376),   # Rancho Alegre
    14: (5.387073, -73.362759),   # Bague Tradición
    15: (5.388110, -73.340709),   # Cabañas Rurales La Posada
    18: (5.350500, -73.449694),   # Saberes y Sabores de Pura Cepa
    20: (5.400092, -73.269104),   # Refugio de La Calderona
    21: (5.396552, -73.286701),   # ASORFEM
    24: (5.356694, -73.455278),   # Laura Tatiana Buitrago (queda en Nuevo Colón)
    26: (5.363773, -73.437396),   # Alsf Alimentos Liofilizados
    27: (5.325694, -73.396861),   # La Acuarela
}

DATOS_BASE_A = {
    1: {"vereda": "Supaneca"},
    2: {"vereda": "Pavaquira"},
    # El WhatsApp correcto es 3204148224 (en el Forms tenía un 2 de más).
    11: {"whatsapp": "3204148224", "whatsapp_alterno": "3132464869",
         "pendiente": "Pedir enlace de Google Maps."},
    13: {"vereda": "Suta Abajo"},
    # WhatsApp completo, que en el Forms venía como "31357".
    14: {"whatsapp": "3135791804", "pendiente": "Pedir enlace de Google Maps."},
    17: {"acceso": "Proyecto en formación",
         "pendiente": "Según la base del grupo es una idea a futuro, sin ubicación definida."},
    8: {"pendiente": "No tiene oficina, opera desde Bogotá. Pedir enlace de Google Maps."},
    24: {"municipio": "Nuevo Colón", "pendiente": "Falta el nombre del emprendimiento."},
}

# Emprendimientos que están en la base del grupo pero no respondieron el Forms.
# Como no tienen respuestas del diagnóstico, no cuentan en los indicadores.
NUEVOS = [
    {"id": 30, "nombre": "Reserva Natural El Unjo", "municipio": "Jenesano",
     "categorias": "Senderos|Agroturismo|Cultura",
     "descripcion": "Reserva natural con ecoturismo, agroturismo y experiencias comunitarias.",
     "que_hacer": "Conocer naturaleza|Conocer procesos campesinos|Conocer cultura local",
     "whatsapp": "3214193566", "presencia_digital": "No",
     "pendiente": "No respondió el Forms: falta ubicación, horario y qué ofrece exactamente."},
]


def limpiar_texto(valor) -> str:
    return re.sub(r"\s+", " ", str(valor)).strip() if pd.notna(valor) else ""


def telefonos(valor) -> list[str]:
    """Extrae números de 10 dígitos de un texto como '310 558 8985 - 3107820930'."""
    digitos = re.sub(r"\D", "", str(valor))
    return [digitos[i:i + 10] for i in range(0, len(digitos), 10) if len(digitos[i:i + 10]) == 10]


def enlaces(texto: str) -> dict:
    """Separa los enlaces escritos en texto libre por red social."""
    redes = {"instagram": "", "facebook": "", "tiktok": "", "web": ""}
    for url in re.findall(r"https?://\S+", texto):
        url_limpia = url.split("?")[0] if "profile.php" not in url else url
        for red in ("instagram", "facebook", "tiktok"):
            if red in url:
                redes[red] = url_limpia
                break
        else:
            if "airbnb" not in url:
                redes["web"] = url_limpia
    return redes


def opciones(texto) -> list[str]:
    return [o.strip() for o in str(texto).split(";") if o.strip()]


def si_no(valor: str) -> str:
    v = limpiar_texto(valor).lower()
    if v in ("si", "sí"):
        return "Sí"
    if v == "no se":
        return "No sabe"
    return limpiar_texto(valor).capitalize()


def presencia_digital(texto: str) -> str:
    t = texto.lower()
    if "no tenemos presencia digital" in t:
        return "No"
    if "proceso" in t:
        return "En proceso"
    return "Sí"


def main():
    df = pd.read_excel(ORIGEN)
    c = df.columns
    filas = []
    for _, x in df.iterrows():
        id_ = int(x[c[COL["id"]]])
        if id_ in IDS_COMBINADOS:
            continue
        municipio = limpiar_texto(x[c[COL["municipio"]]])
        tels = telefonos(x[c[COL["whatsapp"]]])
        hacer = opciones(x[c[COL["hacer"]]])
        cats = sorted({CATEGORIAS[h] for h in hacer if h in CATEGORIAS}, key=ORDEN_CATEGORIAS.index)
        fila = {
            "id": id_,
            "nombre": limpiar_texto(x[c[COL["nombre"]]]),
            "municipio": municipio,
            "vereda": "",
            "categorias": "|".join(cats),
            "descripcion": "",
            "que_hacer": "|".join(h for h in hacer),
            "duracion": limpiar_texto(x[c[COL["duracion"]]]),
            "acceso": ACCESO.get(limpiar_texto(x[c[COL["acceso"]]]), ""),
            "whatsapp": tels[0] if tels else "",
            "whatsapp_alterno": tels[1] if len(tels) > 1 else "",
            **enlaces(str(x[c[COL["enlaces"]]])),
            "reservas_url": "",
            "google_maps_url": "",
            "lat": "", "lon": "", "ubicacion_aproximada": "Sí",
            "horario": "",
            "en_google_maps": si_no(x[c[COL["google_maps"]]]),
            "reservas_en_linea": si_no(x[c[COL["reservas"]]]),
            "presencia_digital": presencia_digital(str(x[c[COL["donde_internet"]]])),
            "visible": "Sí",
            "pendiente": "",
        }
        fila.update(CORRECCIONES.get(id_, {}))
        fila.update(DATOS_BASE_A.get(id_, {}))
        filas.append(fila)

    for nuevo in NUEVOS:
        fila = {campo: "" for campo in filas[0]}
        fila.update({"ubicacion_aproximada": "Sí", "visible": "Sí"}, **nuevo)
        filas.append(fila)

    for fila in filas:
        id_ = fila["id"]
        if fila["municipio"] == "Tunja - Ventaquemada":
            fila["municipio"] = "Ventaquemada"
        fila["provincia_marquez"] = "Sí" if fila["municipio"] in PROVINCIA_MARQUEZ else "No"
        if id_ in COORDENADAS:
            fila["lat"], fila["lon"] = COORDENADAS[id_]
            fila["ubicacion_aproximada"] = "No"
        # Sin coordenadas: centro del municipio con un pequeño desplazamiento para que
        # los puntos no queden uno encima de otro. Se marca como ubicación aproximada.
        # Un proyecto sin ubicación definida no se pone en el mapa.
        elif fila["municipio"] in CENTROS and fila["acceso"] != "Proyecto en formación":
            lat, lon = CENTROS[fila["municipio"]]
            desplazamiento = ((id_ * 37) % 11 - 5) * 0.0012, ((id_ * 53) % 11 - 5) * 0.0012
            fila["lat"] = round(lat + desplazamiento[0], 5)
            fila["lon"] = round(lon + desplazamiento[1], 5)

    columnas = ["id", "nombre", "municipio", "vereda", "provincia_marquez", "categorias", "descripcion",
                "que_hacer", "duracion", "acceso", "horario", "whatsapp", "whatsapp_alterno", "instagram",
                "facebook", "tiktok", "web", "reservas_url", "google_maps_url", "lat", "lon",
                "ubicacion_aproximada", "en_google_maps", "reservas_en_linea", "presencia_digital",
                "visible", "pendiente"]
    salida = pd.DataFrame(filas)[columnas]
    salida.to_csv(DESTINO, index=False, encoding="utf-8-sig")
    print(f"{len(salida)} emprendimientos guardados en {DESTINO.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
