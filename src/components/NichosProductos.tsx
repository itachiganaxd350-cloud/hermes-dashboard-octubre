import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, PieChart, Pie } from "recharts";
import type { DetalleRow, Producto } from "../data/types";
import type { NichoRow } from "../data/transforms";
import { fmtKg, fmtMoney, fmtPct } from "../data/transforms";

interface Props {
  nichos: NichoRow[];
  nichosTotal: number;
  productos: Producto[];
  detalle: DetalleRow[];
  tiposCliente: string[];
}

type Vista = "nichos" | "productos";
type SortKey = "producto" | "kilos" | "valor" | "utilidad" | "margen";

const PALETA = ["#2563eb", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#6366f1", "#94a3b8"];

function agregar(rows: DetalleRow[]): Producto[] {
  const map = new Map<string, Producto>();
  for (const r of rows) {
    const p = map.get(r.producto) ?? { producto: r.producto, kilos: 0, valor: 0, utilidad: 0, margen: 0 };
    p.kilos += r.kilos ?? 0;
    p.valor += r.valor ?? 0;
    p.utilidad += r.utilidad ?? 0;
    map.set(r.producto, p);
  }
  const list = [...map.values()];
  for (const p of list) p.margen = p.valor ? (p.utilidad / p.valor) * 100 : 0;
  return list.sort((a, b) => b.kilos - a.kilos);
}

export function NichosProductos({ nichos, nichosTotal, productos, detalle, tiposCliente }: Props) {
  const [vista, setVista] = useState<Vista>("nichos");
  const [tipo, setTipo] = useState<string>("TODOS");
  const [query, setQuery] = useState("");
  const [topN, setTopN] = useState<number>(10);
  const [sortKey, setSortKey] = useState<SortKey>("kilos");
  const [sortAsc, setSortAsc] = useState(false);

  const base = useMemo(
    () => (tipo === "TODOS" ? productos : agregar(detalle.filter((d) => d.tipoCliente === tipo))),
    [tipo, productos, detalle]
  );

  const chartData = useMemo(
    () =>
      base.slice(0, topN).map((p) => ({
        producto: p.producto.length > 24 ? `${p.producto.slice(0, 23)}…` : p.producto,
        kilos: p.kilos,
      })),
    [base, topN]
  );

  const tabla = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q ? base.filter((p) => p.producto.toLowerCase().includes(q)) : [...base];
    rows.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = typeof va === "string" ? va.localeCompare(String(vb)) : Number(va) - Number(vb);
      return sortAsc ? cmp : -cmp;
    });
    return rows;
  }, [base, query, sortKey, sortAsc]);

  const clickSort = (k: SortKey) => {
    if (k === sortKey) setSortAsc((p) => !p);
    else {
      setSortKey(k);
      setSortAsc(k === "producto");
    }
  };

  const th = (label: string, k: SortKey, align: "left" | "right" = "right") => (
    <th
      onClick={() => clickSort(k)}
      className={`sortable py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider ${
        sortKey === k ? "sorted" : "text-[hsl(var(--color-muted))]"
      } ${align === "left" ? "text-left" : "text-right"}`}
      title="Clic para ordenar"
    >
      {label} {sortKey === k ? (sortAsc ? "▲" : "▼") : ""}
    </th>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Selector de vista */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="seg">
          {(
            [
              ["nichos", "Nichos de mercado"],
              ["productos", "Productos"],
            ] as [Vista, string][]
          ).map(([v, label]) => (
            <button key={v} className={`seg-btn ${vista === v ? "active" : ""}`} onClick={() => setVista(v)}>
              {label}
            </button>
          ))}
        </div>
        {vista === "nichos" && (
          <span className="text-[11px] text-[hsl(var(--color-muted))]">
            Total nichos: <span className="font-mono font-semibold">{fmtKg(nichosTotal)} kg</span>
          </span>
        )}
      </div>

      {vista === "nichos" && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={nichos} dataKey="kilos" nameKey="nombre" innerRadius={62} outerRadius={108} paddingAngle={2} strokeWidth={0}>
                {nichos.map((_, i) => (
                  <Cell key={i} fill={PALETA[i % PALETA.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: unknown) => `${fmtKg(Number(v))} kg`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-col justify-center gap-3">
            {nichos.map((n, i) => (
              <div key={n.nombre} className="flex items-center gap-3">
                <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: PALETA[i % PALETA.length] }} />
                <span className="w-32 shrink-0 text-xs font-medium">{n.nombre}</span>
                <div className="progress flex-1">
                  <span style={{ width: `${n.pct}%`, background: PALETA[i % PALETA.length] }} />
                </div>
                <span className="w-20 shrink-0 text-right font-mono text-xs tabular-nums">{fmtKg(n.kilos)}</span>
                <span className="w-14 shrink-0 text-right font-mono text-xs tabular-nums text-[hsl(var(--color-muted))]">
                  {fmtPct(n.pct)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {vista === "productos" && (
        <div className="flex flex-col gap-5">
          {/* Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {["TODOS", ...tiposCliente].map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                    tipo === t
                      ? "border-[hsl(var(--color-brand))] bg-[hsl(var(--color-brand))] text-white"
                      : "border-[hsl(var(--color-border))] text-[hsl(var(--color-muted))] hover:border-[hsl(var(--color-brand))]/50"
                  }`}
                >
                  {t === "TODOS" ? "Todos" : t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="seg">
                {[10, 20, 40].map((n) => (
                  <button key={n} className={`seg-btn ${topN === n ? "active" : ""}`} onClick={() => setTopN(n)}>
                    {n === 40 ? "Todos" : `Top ${n}`}
                  </button>
                ))}
              </div>
              <div className="w-44">
                <input className="search" placeholder="Buscar producto…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 26 + 30)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 36, top: 4, bottom: 4 }} barCategoryGap="26%">
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
              <YAxis
                type="category"
                dataKey="producto"
                tick={{ fontSize: 10.5, fill: "hsl(var(--color-text))" }}
                tickLine={false}
                axisLine={false}
                width={170}
              />
              <Tooltip
                formatter={(v: unknown) => `${fmtKg(Number(v))} kg`}
                cursor={{ fill: "hsl(var(--color-muted) / 0.06)" }}
                labelStyle={{ fontWeight: 700 }}
              />
              <Bar dataKey="kilos" name="Kilos" radius={[0, 5, 5, 0]} maxBarSize={16}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={PALETA[i % PALETA.length]} fillOpacity={i < 3 ? 1 : 0.5} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--color-border))]">
                  {th("Producto", "producto", "left")}
                  {th("Kilos", "kilos")}
                  {th("Valor neto", "valor")}
                  {th("Utilidad", "utilidad")}
                  {th("Margen", "margen")}
                </tr>
              </thead>
              <tbody>
                {tabla.map((p) => (
                  <tr key={p.producto} className="border-b border-[hsl(var(--color-border))]/50 hover:bg-[hsl(var(--color-surface))]">
                    <td className="py-1.5 pr-3 font-medium">{p.producto}</td>
                    <td className="py-1.5 pr-3 text-right font-mono tabular-nums">{fmtKg(p.kilos)}</td>
                    <td className="py-1.5 pr-3 text-right font-mono tabular-nums">{fmtMoney(p.valor)}</td>
                    <td
                      className={`py-1.5 pr-3 text-right font-mono tabular-nums ${
                        p.utilidad >= 0 ? "" : "text-[hsl(var(--color-negative))]"
                      }`}
                    >
                      {fmtMoney(p.utilidad)}
                    </td>
                    <td className="py-1.5 pr-3 text-right font-mono tabular-nums text-[hsl(var(--color-muted))]">{fmtPct(p.margen)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[hsl(var(--color-border))] font-bold">
                  <td className="py-2 pr-3">
                    TOTAL {tipo === "TODOS" ? "" : `· ${tipo}`}{" "}
                    <span className="text-xs font-normal text-[hsl(var(--color-muted))]">({tabla.length} productos)</span>
                  </td>
                  <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtKg(tabla.reduce((a, p) => a + p.kilos, 0))}</td>
                  <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtMoney(tabla.reduce((a, p) => a + p.valor, 0))}</td>
                  <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtMoney(tabla.reduce((a, p) => a + p.utilidad, 0))}</td>
                  <td className="py-2 pr-3 text-right font-mono tabular-nums text-[hsl(var(--color-muted))]">
                    {(() => {
                      const v = tabla.reduce((a, p) => a + p.valor, 0);
                      const u = tabla.reduce((a, p) => a + p.utilidad, 0);
                      return v ? fmtPct((u / v) * 100) : "—";
                    })()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
