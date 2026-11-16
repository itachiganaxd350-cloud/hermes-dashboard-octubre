# -*- coding: utf-8 -*-
"""dataset.json para el dashboard CIERRE OCTUBRE 2026.
Hojas usadas (se ignoran las 2 de septiembre):
  1) CIERRE OCTUBRE          -> cierre + detalle producto x tipo de cliente
  3) VARIACION EN PESOS AAA  -> meses hasta REAL 2026 en pesos
  4) VARIACION EN KILOS AAA  -> cuadro completo (incl. proyeccion 2027)
  6) NICHOS DE MERCADO       -> kilos por nicho
  7) CANALES OCTUBRE         -> terrazas / comercializadora
"""
import xlrd, json, os

XLS = r"C:\Users\ASUS\Desktop\CIERRE OCTUBRE  2026.xls"
OUT = r"C:\Users\ASUS\Documents\cierre-octubre-2026\src\data\dataset.json"

book = xlrd.open_workbook(XLS)
sh_cierre = book.sheet_by_name("CIERRE OCTUBRE ")
sh_pesos = book.sheet_by_name("VARIACION EN PESOS AÑO AÑO ")
sh_kilos = book.sheet_by_name("VARIACION EN KILOS AÑO AÑO")
sh_nichos = book.sheet_by_name("NICHOS DE MERCADO ")
sh_canales = book.sheet_by_name("CANALES OCTUBRE ")


def num(sh, r, c):
    v = sh.cell_value(r, c)
    if v == "" or v is None:
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return int(f) if f.is_integer() else f


def txt(sh, r, c):
    return str(sh.cell_value(r, c)).strip()


# ---------------- CIERRE + DETALLE PRODUCTO x CLIENTE ----------------
detalle = []
for r in range(1, 147):
    desc = txt(sh_cierre, r, 1)
    if not desc:
        continue
    tipo = txt(sh_cierre, r, 5)
    if tipo.upper().startswith("EMPLEADO"):
        tipo_grupo = "EMPLEADOS"
    else:
        tipo_grupo = tipo
    detalle.append(
        {
            "codigo": txt(sh_cierre, r, 0),
            "producto": desc,
            "tipoCliente": tipo_grupo,
            "margen": num(sh_cierre, r, 2),
            "utilidad": num(sh_cierre, r, 3),
            "valor": num(sh_cierre, r, 4),
            "kilos": num(sh_cierre, r, 6),
        }
    )

cierre = {
    "asiCerramos": num(sh_cierre, 147, 6),
    "presupuesto1": num(sh_cierre, 148, 6),
    "cumplimiento1": num(sh_cierre, 149, 6),
    "presupuesto2": num(sh_cierre, 150, 6),
    "cumplimiento2": num(sh_cierre, 151, 6),
    "crecimientoAA": num(sh_cierre, 152, 6),
    "crecimientoMM": num(sh_cierre, 153, 6),
    "margen": num(sh_cierre, 147, 2),
    "utilidad": num(sh_cierre, 147, 3),
    "valorNeto": num(sh_cierre, 147, 4),
}

# ---------------- PRODUCTOS AGREGADOS (para ranking / tabla) ----------------
prod = {}
for d in detalle:
    p = prod.setdefault(
        d["producto"], {"producto": d["producto"], "kilos": 0.0, "valor": 0.0, "utilidad": 0.0}
    )
    p["kilos"] += d["kilos"] or 0
    p["valor"] += d["valor"] or 0
    p["utilidad"] += d["utilidad"] or 0
productos = sorted(prod.values(), key=lambda x: -x["kilos"])
for p in productos:
    p["margen"] = (p["utilidad"] / p["valor"] * 100) if p["valor"] else 0

# tipos de cliente presentes
tipos = sorted({d["tipoCliente"] for d in detalle})

# ---------------- PESOS (meses -> real 2026) ----------------
pesos = {
    "meses": [txt(sh_pesos, r, 0) for r in range(1, 13)],
    "venta2024": [num(sh_pesos, r, 1) for r in range(1, 13)],
    "real2025": [num(sh_pesos, r, 2) for r in range(1, 13)],
    "presupuesto2026": [num(sh_pesos, r, 3) for r in range(1, 13)],
    "real2026": [num(sh_pesos, r, 4) for r in range(1, 13)],
    "totales": {
        "venta2024": num(sh_pesos, 13, 1),
        "real2025": num(sh_pesos, 13, 2),
        "presupuesto2026": num(sh_pesos, 13, 3),
        "real2026": num(sh_pesos, 13, 4),
    },
}

# ---------------- KILOS (cuadro completo) ----------------
kilos = {
    "meses": [txt(sh_kilos, r, 0) for r in range(2, 14)],
    "venta2024": [num(sh_kilos, r, 1) for r in range(2, 14)],
    "real2025": [num(sh_kilos, r, 2) for r in range(2, 14)],
    "presupuesto2026": [num(sh_kilos, r, 3) for r in range(2, 14)],
    "real2026": [num(sh_kilos, r, 4) for r in range(2, 14)],
    "crecimiento2026": [num(sh_kilos, r, 5) for r in range(2, 14)],
    "proyeccion2027": [num(sh_kilos, r, 6) for r in range(2, 14)],
    "totales": {
        "venta2024": num(sh_kilos, 14, 1),
        "real2025": num(sh_kilos, 14, 2),
        "presupuesto2026": num(sh_kilos, 14, 3),
        "real2026": num(sh_kilos, 14, 4),
        "proyeccion2027": num(sh_kilos, 14, 6),
    },
}

n_real = sum(1 for v in kilos["real2026"] if v is not None)
r26 = sum(v for v in kilos["real2026"] if v is not None)
r25 = sum(v for v in kilos["real2025"][:n_real] if v is not None)
b26 = sum(v for v in kilos["presupuesto2026"][:n_real] if v is not None)
r24 = sum(v for v in kilos["venta2024"][:n_real] if v is not None)
kilos["ytd"] = {
    "meses": n_real,
    "real2026": r26,
    "real2025": r25,
    "venta2024": r24,
    "presupuesto2026": b26,
    "crecimientoPct": (r26 - r25) / r25 * 100,
    "cumplimientoPct": r26 / b26 * 100,
}
pesos["ytd"] = {
    "meses": n_real,
    "real2026": sum(v for v in pesos["real2026"] if v is not None),
    "real2025": sum(v for v in pesos["real2025"][:n_real] if v is not None),
}
pesos["ytd"]["crecimientoPct"] = (
    (pesos["ytd"]["real2026"] - pesos["ytd"]["real2025"]) / pesos["ytd"]["real2025"] * 100
)

# ---------------- NICHOS ----------------
nichos = []
for r in range(1, 6):
    nombre = txt(sh_nichos, r, 0)
    if nombre:
        nichos.append({"nombre": nombre, "kilos": num(sh_nichos, r, 1)})
nichos_total = num(sh_nichos, 6, 1)

# ---------------- CANALES ----------------
COLS = {2022: 4, 2023: 7, 2024: 10, 2025: 11, 2026: 12}  # terrazas
COLS_C = {2022: 4, 2023: 7, 2024: 10, 2025: 11, 2026: 12}  # comercializadora
canales = {
    "terrazas": {str(y): [num(sh_canales, r, c) for r in range(2, 14)] for y, c in COLS.items()},
    "comercializadora": {str(y): [num(sh_canales, r, c) for r in range(20, 32)] for y, c in COLS_C.items()},
    "participacion2026": [num(sh_canales, r, 13) for r in range(20, 32)],
    "meses": [txt(sh_canales, r, 1) for r in range(20, 32)],
    "totales": {
        "terrazas": {str(y): num(sh_canales, 14, c) for y, c in COLS.items()},
        "comercializadora": {str(y): num(sh_canales, 32, c) for y, c in COLS_C.items()},
        "participacion2026": num(sh_canales, 32, 13),
    },
    "fuente": "CANALES OCTUBRE (CIERRE OCTUBRE 2026.xls)",
}

dataset = {
    "meta": {
        "titulo": "CIERRE OCTUBRE 2026",
        "periodo": "Enero – Octubre 2026",
        "fuente": "CIERRE OCTUBRE 2026.xls",
    },
    "cierre": cierre,
    "pesos": pesos,
    "kilos": kilos,
    "nichos": nichos,
    "nichosTotal": nichos_total,
    "productos": productos,
    "detalle": detalle,
    "tiposCliente": tipos,
    "canales": canales,
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

print("dataset.json OK")
print("cierre:", {k: (round(v, 4) if isinstance(v, float) else v) for k, v in cierre.items()})
print("detalle filas:", len(detalle), "| productos:", len(productos), "| tipos:", tipos)
print("pesos ytd:", {k: (round(v, 2) if isinstance(v, float) else v) for k, v in pesos["ytd"].items()})
print("kilos ytd:", {k: (round(v, 2) if isinstance(v, float) else v) for k, v in kilos["ytd"].items()})
print("nichos:", nichos, "| total:", nichos_total)
print("canales totales:", canales["totales"])
print("top3 productos:", [(p["producto"], round(p["kilos"], 1)) for p in productos[:3]])
