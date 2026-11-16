# CIERRE OCTUBRE 2026 — Dashboard

Dashboard interactivo construido a partir de **`CIERRE OCTUBRE  2026.xls`** (escritorio).

🔗 **En vivo:** https://itachiganaxd-cloud.github.io/hermes-dashboard-octubre/ *(se actualiza al desplegar)*

## 📑 Alcance por hoja

| Hoja del archivo | Uso | Sección |
|---|---|---|
| `CIERRE OCTUBRE ` | Bloque **«Así cerramos»** + presupuestos/cumplimientos/crecimientos + detalle producto × tipo de cliente (146 líneas) | Cierre Octubre · Nichos y Productos |
| `VARIACION EN PESOS AÑO AÑO ` | Mes → **Real 2026 en pesos** (sin cumplimiento/variación/proyección) | Variación en Pesos |
| `VARIACION EN KILOS AÑO AÑO` | Cuadro completo: Mes → **Proyección 2027 kilos** | Variación en Kilos |
| `NICHOS DE MERCADO ` | Kilos por tipo de cliente | Nichos y Productos |
| `CANALES OCTUBRE ` | Terrazas y Comercializadora 2022–2026 + participación | Canales |
| ~~`CIERRE SEPTIEMBRE `~~ | **Ignorada** (ya existe el dashboard de septiembre) | — |
| ~~`CIERRE SEPTIEMBRE CIUDADES`~~ | **Ignorada** (ya existe el dashboard de septiembre) | — |

## ✅ Fidelidad de datos

`src/data/dataset.json` se genera leyendo el `.xls` directamente con `scripts/build_dataset.py` (sin transcripción manual).
Verificación independiente: **1.026 checks contra las celdas del archivo · 0 diferencias** (`scripts/verify.py`), incluyendo:

- Las 146 líneas de detalle (producto, kilo, valor, utilidad, margen)
- Meses y totales de pesos y kilos
- Nichos y totales
- Canales 2022–2026 + participación

## 🔎 Interactividad

- Tema claro / oscuro · navegación por secciones
- KPIs con animación de conteo
- Variación en **Pesos** y **Kilos**: conmutador Barras / Líneas
- **Nichos y Productos**: conmutador de vista, filtros por tipo de cliente, Top 10/20/Todos, buscador y tabla ordenable (kilos, valor, utilidad, margen)
- **Canales**: conmutador Mensual / Comparativo anual / Participación + detalle anual colapsable

## 📝 Notas de auditoría (del archivo)

- **Nichos**: la suma de la hoja da 83.605 kg; el bloque «Así cerramos» del cierre muestra 83.664,48 kg. La diferencia (59,48 kg) viene del origen; el dashboard muestra cada cifra tal cual.
- **Participación 2026 (Canales)**: la celda del TOTAL viene vacía en el archivo; el dashboard la calcula como Comercializadora ÷ Terrazas (mismo criterio de las filas mensuales) y así se indica en el pie de la tabla.
- `CRECIMIENTO A A` = −2,50% y `CRECIMIENTO M M` = +17,75%, tal como figuran en el cierre.
