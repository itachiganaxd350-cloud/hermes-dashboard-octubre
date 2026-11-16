# -*- coding: utf-8 -*-
"""Verificacion: dataset.json octubre vs celdas del .xls (5 hojas usadas)"""
import xlrd, json

XLS = r"C:\Users\ASUS\Desktop\CIERRE OCTUBRE  2026.xls"
DS = r"C:\Users\ASUS\Documents\cierre-octubre-2026\src\data\dataset.json"
ds = json.load(open(DS, encoding="utf-8"))
b = xlrd.open_workbook(XLS)
sc = b.sheet_by_name("CIERRE OCTUBRE ")
sp = b.sheet_by_name("VARIACION EN PESOS AÑO AÑO ")
sk = b.sheet_by_name("VARIACION EN KILOS AÑO AÑO")
sn = b.sheet_by_name("NICHOS DE MERCADO ")
sca = b.sheet_by_name("CANALES OCTUBRE ")

fails = []
checks = 0


def cell(sh, r, c):
    v = sh.cell_value(r, c)
    if v == "":
        return None
    try:
        f = float(v)
        return int(f) if f.is_integer() else f
    except (TypeError, ValueError):
        return str(v).strip()


def cmp(name, ex, dv):
    global checks
    checks += 1
    if isinstance(ex, (int, float)) and isinstance(dv, (int, float)):
        ok = abs(ex - dv) < 1e-6
    else:
        ok = ex == dv
    if not ok:
        fails.append(f"{name}: excel={ex!r} ds={dv!r}")


# --- cierre (bloque resumen) ---
cmp("cierre.asiCerramos", cell(sc, 147, 6), ds["cierre"]["asiCerramos"])
cmp("cierre.presupuesto1", cell(sc, 148, 6), ds["cierre"]["presupuesto1"])
cmp("cierre.cumplimiento1", cell(sc, 149, 6), ds["cierre"]["cumplimiento1"])
cmp("cierre.presupuesto2", cell(sc, 150, 6), ds["cierre"]["presupuesto2"])
cmp("cierre.cumplimiento2", cell(sc, 151, 6), ds["cierre"]["cumplimiento2"])
cmp("cierre.crecimientoAA", cell(sc, 152, 6), ds["cierre"]["crecimientoAA"])
cmp("cierre.crecimientoMM", cell(sc, 153, 6), ds["cierre"]["crecimientoMM"])
cmp("cierre.margen", cell(sc, 147, 2), ds["cierre"]["margen"])
cmp("cierre.utilidad", cell(sc, 147, 3), ds["cierre"]["utilidad"])
cmp("cierre.valorNeto", cell(sc, 147, 4), ds["cierre"]["valorNeto"])

# --- detalle 146 filas ---
for i, row in enumerate(ds["detalle"]):
    r = i + 1
    cmp(f"detalle[{i}].producto", cell(sc, r, 1), row["producto"])
    cmp(f"detalle[{i}].kilos", cell(sc, r, 6), row["kilos"])
    cmp(f"detalle[{i}].valor", cell(sc, r, 4), row["valor"])
    cmp(f"detalle[{i}].utilidad", cell(sc, r, 3), row["utilidad"])
    cmp(f"detalle[{i}].margen", cell(sc, r, 2), row["margen"])

# --- pesos ---
for i in range(12):
    for c, key in [(1, "venta2024"), (2, "real2025"), (3, "presupuesto2026"), (4, "real2026")]:
        cmp(f"pesos.{key}[{ds['pesos']['meses'][i]}]", cell(sp, i + 1, c), ds["pesos"][key][i])
for c, key in [(1, "venta2024"), (2, "real2025"), (3, "presupuesto2026"), (4, "real2026")]:
    cmp(f"pesos.totales.{key}", cell(sp, 13, c), ds["pesos"]["totales"][key])

# --- kilos ---
for i in range(12):
    for c, key in [(1, "venta2024"), (2, "real2025"), (3, "presupuesto2026"), (4, "real2026"), (5, "crecimiento2026"), (6, "proyeccion2027")]:
        cmp(f"kilos.{key}[{ds['kilos']['meses'][i]}]", cell(sk, i + 2, c), ds["kilos"][key][i])
for c, key in [(1, "venta2024"), (2, "real2025"), (3, "presupuesto2026"), (4, "real2026"), (6, "proyeccion2027")]:
    cmp(f"kilos.totales.{key}", cell(sk, 14, c), ds["kilos"]["totales"][key])

# --- nichos ---
for i, n in enumerate(ds["nichos"]):
    cmp(f"nichos[{i}].nombre", cell(sn, i + 1, 0), n["nombre"])
    cmp(f"nichos[{i}].kilos", cell(sn, i + 1, 1), n["kilos"])
cmp("nichosTotal", cell(sn, 6, 1), ds["nichosTotal"])

# --- canales ---
COLS = {2022: 4, 2023: 7, 2024: 10, 2025: 11, 2026: 12}
for key, r0 in [("terrazas", 2), ("comercializadora", 20)]:
    for y, c in COLS.items():
        for i in range(12):
            cmp(f"canales.{key}[{y}][{i}]", cell(sca, r0 + i, c), ds["canales"][key][str(y)][i])
for y, c in COLS.items():
    cmp(f"total terrazas {y}", cell(sca, 14, c), ds["canales"]["totales"]["terrazas"][str(y)])
    cmp(f"total comerc {y}", cell(sca, 32, c), ds["canales"]["totales"]["comercializadora"][str(y)])
for i in range(12):
    cmp(f"participacion[{i}]", cell(sca, 20 + i, 13), ds["canales"]["participacion2026"][i])

# --- sumas internas ---
cmp("suma kilos detalle == asiCerramos", round(ds["cierre"]["asiCerramos"], 3), round(sum(d["kilos"] for d in ds["detalle"]), 3))
cmp("suma pesos real2026 == total", ds["pesos"]["totales"]["real2026"], sum(v for v in ds["pesos"]["real2026"] if v))
cmp("suma kilos real2026 == total", ds["kilos"]["totales"]["real2026"], sum(v for v in ds["kilos"]["real2026"] if v))
cmp("suma productos kilos == detalle", round(sum(p["kilos"] for p in ds["productos"]), 3), round(sum(d["kilos"] for d in ds["detalle"]), 3))

print(f"CHECKS: {checks} | FALLOS: {len(fails)}")
print("RESULTADO:", "100% FIEL AL ARCHIVO" if not fails else "REVISAR")
for f in fails[:15]:
    print(" -", f)
print("\nResumen:", {k: (round(v, 2) if isinstance(v, float) else v) for k, v in ds["cierre"].items()})
