import type { Dataset, Nicho, Producto } from "./types";
import type { Kpi } from "../components/KpiCard";

/* ---------- formateadores ---------- */
const nf0 = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtInt = (n: number | null | undefined) => (n == null ? "—" : nf0.format(n));
export const fmtKg = (n: number | null | undefined) => (n == null ? "—" : nf1.format(n));
export const fmtMoney = (n: number | null | undefined) => (n == null ? "—" : `$ ${nf0.format(n)}`);
export const fmtPct = (n: number | null | undefined, dec: 1 | 2 = 1) =>
  n == null ? "—" : `${dec === 2 ? nf2.format(n) : nf1.format(n)}%`;

export const fmtSignedPct = (n: number | null | undefined, dec: 1 | 2 = 1) => {
  if (n == null) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${dec === 2 ? nf2.format(n) : nf1.format(n)}%`;
};

export const fmtAxisMoney = (v: number) => {
  const a = Math.abs(v);
  if (a >= 1e9) return `${(v / 1e9).toFixed(1)}MM`;
  if (a >= 1e6) return `${(v / 1e6).toFixed(0)}M`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(0)}k`;
  return `${v}`;
};
export const fmtAxisKg = (v: number) => {
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(0)}k`;
  return `${v}`;
};

/* ---------- series ---------- */
export interface MesSerie {
  mes: string;
  mesCorto: string;
  venta2024: number | null;
  real2025: number | null;
  presupuesto2026: number | null;
  real2026: number | null;
}

export interface KilosSerie extends MesSerie {
  crecimiento2026: number | null;
  proyeccion2027: number | null;
}

export interface CrecimientoRow {
  mes: string;
  crecimiento: number | null;
}

export interface ProyeccionRow {
  mes: string;
  real2026: number | null;
  proyeccion2027: number | null;
}

export interface CumplimientoRow {
  nombre: string;
  presupuesto: number;
  cumplimiento: number;
  color: string;
}

export interface NichoRow {
  nombre: string;
  kilos: number;
  pct: number;
}

export interface CanalMesRow {
  mes: string;
  terrazas2026: number | null;
  comercial2026: number | null;
  terrazas2025: number | null;
  comercial2025: number | null;
  pct2026: number | null;
}

export interface CanalAnualRow {
  year: number;
  terrazas: number;
  comercializadora: number;
  total: number;
}

export interface DashboardData {
  kpis: Kpi[];
  pesosSeries: MesSerie[];
  kilosSeries: KilosSerie[];
  crecimiento: CrecimientoRow[];
  proyeccion: ProyeccionRow[];
  cumplimientos: CumplimientoRow[];
  nichos: NichoRow[];
  productos: Producto[];
  canalMeses: CanalMesRow[];
  canalAnual: CanalAnualRow[];
  canalResumen: {
    terrazas2026: number;
    comercial2026: number;
    participacion2026: number;
    terrazas2025: number;
    comercial2025: number;
  };
}

export function buildDashboard(d: Dataset): DashboardData {
  const pesosSeries: MesSerie[] = d.pesos.meses.map((mes, i) => ({
    mes,
    mesCorto: mes.slice(0, 3),
    venta2024: d.pesos.venta2024[i] ?? null,
    real2025: d.pesos.real2025[i] ?? null,
    presupuesto2026: d.pesos.presupuesto2026[i] ?? null,
    real2026: d.pesos.real2026[i] ?? null,
  }));

  const kilosSeries: KilosSerie[] = d.kilos.meses.map((mes, i) => ({
    mes,
    mesCorto: mes.slice(0, 3),
    venta2024: d.kilos.venta2024[i] ?? null,
    real2025: d.kilos.real2025[i] ?? null,
    presupuesto2026: d.kilos.presupuesto2026[i] ?? null,
    real2026: d.kilos.real2026[i] ?? null,
    crecimiento2026: d.kilos.crecimiento2026[i] ?? null,
    proyeccion2027: d.kilos.proyeccion2027[i] ?? null,
  }));

  const crecimiento: CrecimientoRow[] = kilosSeries
    .filter((s) => s.real2026 != null)
    .map((s) => ({ mes: s.mesCorto, crecimiento: s.crecimiento2026 }));

  const proyeccion: ProyeccionRow[] = kilosSeries
    .filter((s) => s.real2026 != null)
    .map((s) => ({ mes: s.mesCorto, real2026: s.real2026, proyeccion2027: s.proyeccion2027 }));

  const cumplimientos: CumplimientoRow[] = [
    { nombre: "Presupuesto 1", presupuesto: d.cierre.presupuesto1, cumplimiento: d.cierre.cumplimiento1, color: "#10b981" },
    { nombre: "Presupuesto 2", presupuesto: d.cierre.presupuesto2, cumplimiento: d.cierre.cumplimiento2, color: "#f59e0b" },
  ];

  const nichos: NichoRow[] = d.nichos.map((n: Nicho) => ({
    nombre: n.nombre,
    kilos: n.kilos,
    pct: d.nichosTotal ? (n.kilos / d.nichosTotal) * 100 : 0,
  }));

  const canalMeses: CanalMesRow[] = d.canales.meses.map((mes, i) => ({
    mes: mes.length > 3 ? mes.slice(0, 3) : mes,
    terrazas2026: d.canales.terrazas["2026"][i] ?? null,
    comercial2026: d.canales.comercializadora["2026"][i] ?? null,
    terrazas2025: d.canales.terrazas["2025"][i] ?? null,
    comercial2025: d.canales.comercializadora["2025"][i] ?? null,
    pct2026: d.canales.participacion2026[i] ?? null,
  }));

  const canalAnual: CanalAnualRow[] = [2022, 2023, 2024, 2025, 2026].map((y) => {
    const t = d.canales.totales.terrazas[String(y)] ?? 0;
    const c = d.canales.totales.comercializadora[String(y)] ?? 0;
    return { year: y, terrazas: t, comercializadora: c, total: t + c };
  });

  const terrazas2026 = d.canales.totales.terrazas["2026"] ?? 0;
  const comercial2026 = d.canales.totales.comercializadora["2026"] ?? 0;
  const canalResumen = {
    terrazas2026,
    comercial2026,
    // la celda total de participación viene vacía en el archivo: se calcula con el mismo criterio (comerc ÷ terrazas)
    participacion2026:
      d.canales.totales.participacion2026 ?? (terrazas2026 ? (comercial2026 / terrazas2026) * 100 : 0),
    terrazas2025: d.canales.totales.terrazas["2025"] ?? 0,
    comercial2025: d.canales.totales.comercializadora["2025"] ?? 0,
  };

  const c = d.cierre;
  const kpis: Kpi[] = [
    {
      label: "Así cerramos",
      value: fmtKg(c.asiCerramos),
      detail: "Octubre 2026 · kilos",
      icon: "package",
      positive: true,
      accent: "#2563eb",
      raw: { n: c.asiCerramos, fmt: "kg", suffix: " kg" },
    },
    {
      label: "Cumplimiento Ppto 1",
      value: fmtPct(c.cumplimiento1, 2),
      detail: `Meta ${fmtKg(c.presupuesto1)} kg`,
      icon: "target",
      positive: c.cumplimiento1 >= 100,
      accent: "#10b981",
      raw: { n: c.cumplimiento1, fmt: "pct2" },
    },
    {
      label: "Cumplimiento Ppto 2",
      value: fmtPct(c.cumplimiento2, 2),
      detail: `Meta ${fmtKg(c.presupuesto2)} kg`,
      icon: "target",
      positive: c.cumplimiento2 >= 100,
      accent: "#f59e0b",
      raw: { n: c.cumplimiento2, fmt: "pct2" },
    },
    {
      label: "Crecimiento A/A",
      value: fmtSignedPct(c.crecimientoAA, 2),
      detail: "vs octubre 2025",
      icon: "trending",
      positive: c.crecimientoAA >= 0,
      accent: "#f43f5e",
      raw: { n: c.crecimientoAA, fmt: "pct2" },
    },
    {
      label: "Crecimiento M/M",
      value: fmtSignedPct(c.crecimientoMM, 2),
      detail: "vs septiembre 2026",
      icon: "trending",
      positive: c.crecimientoMM >= 0,
      accent: "#06b6d4",
      raw: { n: c.crecimientoMM, fmt: "pct2" },
    },
    {
      label: "Valor neto local",
      value: fmtMoney(c.valorNeto),
      detail: `Utilidad ${fmtMoney(c.utilidad)}`,
      icon: "scale",
      positive: true,
      accent: "#8b5cf6",
      raw: { n: c.valorNeto, fmt: "money" },
    },
  ];

  return {
    kpis,
    pesosSeries,
    kilosSeries,
    crecimiento,
    proyeccion,
    cumplimientos,
    nichos,
    productos: d.productos,
    canalMeses,
    canalAnual,
    canalResumen,
  };
}
