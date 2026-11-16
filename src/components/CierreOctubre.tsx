import { Target, Package, TrendingUp, Wallet } from "lucide-react";
import type { CierreOct } from "../data/types";
import type { CumplimientoRow } from "../data/transforms";
import { fmtKg, fmtMoney, fmtPct, fmtSignedPct } from "../data/transforms";

interface Props {
  cierre: CierreOct;
  cumplimientos: CumplimientoRow[];
}

export function CierreOctubre({ cierre, cumplimientos }: Props) {
  const maxVal = Math.max(cierre.asiCerramos, cierre.presupuesto1, cierre.presupuesto2);
  const bars = [
    { nombre: "Así cerramos", valor: cierre.asiCerramos, color: "#2563eb" },
    { nombre: "Presupuesto 1", valor: cierre.presupuesto1, color: "#10b981" },
    { nombre: "Presupuesto 2", valor: cierre.presupuesto2, color: "#f59e0b" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Cifra principal */}
      <div className="flex flex-col justify-center gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-2))] p-5">
        <div className="flex items-center gap-2 text-[hsl(var(--color-muted))] text-[11px] font-semibold uppercase tracking-wider">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2563eb1f] text-[#2563eb]">
            <Package size={13} strokeWidth={2.2} />
          </span>
          Así cerramos · Octubre 2026
        </div>
        <div className="kpi-big">
          {fmtKg(cierre.asiCerramos)}{" "}
          <span className="text-base font-semibold text-[hsl(var(--color-muted))]">kg</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              cierre.crecimientoMM >= 0 ? "text-[hsl(var(--color-positive))]" : "text-[hsl(var(--color-negative))]"
            }`}
            style={{
              background:
                cierre.crecimientoMM >= 0 ? "hsl(var(--color-positive) / 0.12)" : "hsl(var(--color-negative) / 0.12)",
            }}
          >
            <TrendingUp size={12} /> M/M {fmtSignedPct(cierre.crecimientoMM, 2)}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              cierre.crecimientoAA >= 0 ? "text-[hsl(var(--color-positive))]" : "text-[hsl(var(--color-negative))]"
            }`}
            style={{
              background:
                cierre.crecimientoAA >= 0 ? "hsl(var(--color-positive) / 0.12)" : "hsl(var(--color-negative) / 0.12)",
            }}
          >
            <TrendingUp size={12} /> A/A {fmtSignedPct(cierre.crecimientoAA, 2)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8b5cf61f] px-2.5 py-1 text-[11px] font-bold text-[#8b5cf6]">
            <Wallet size={12} /> Margen {fmtPct(cierre.margen, 2)}
          </span>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <div className="text-[hsl(var(--color-muted))]">Valor neto local</div>
            <div className="font-mono text-sm font-semibold tabular-nums">{fmtMoney(cierre.valorNeto)}</div>
          </div>
          <div>
            <div className="text-[hsl(var(--color-muted))]">Utilidad</div>
            <div className="font-mono text-sm font-semibold tabular-nums">{fmtMoney(cierre.utilidad)}</div>
          </div>
        </div>
      </div>

      {/* Comparativo + cumplimientos */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-2))] p-5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-muted))]">
            Cierre vs presupuestos (kg)
          </h4>
          {bars.map((b) => (
            <div key={b.nombre} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-xs font-medium">{b.nombre}</span>
              <div className="progress flex-1" title={`${b.nombre}: ${fmtKg(b.valor)} kg`}>
                <span style={{ width: `${(b.valor / maxVal) * 100}%`, background: b.color }} />
              </div>
              <span className="w-24 shrink-0 text-right font-mono text-xs tabular-nums">{fmtKg(b.valor)}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cumplimientos.map((cm) => {
            const ok = cm.cumplimiento >= 100;
            return (
              <div key={cm.nombre} className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-2))] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-muted))]">
                    <Target size={12} /> {cm.nombre}
                  </span>
                  <span
                    className="font-mono text-sm font-bold tabular-nums"
                    style={{ color: ok ? "hsl(var(--color-positive))" : "hsl(var(--color-negative))" }}
                  >
                    {fmtPct(cm.cumplimiento, 2)}
                  </span>
                </div>
                <div className="progress" title={`Meta: ${fmtKg(cm.presupuesto)} kg`}>
                  <span style={{ width: `${Math.min(cm.cumplimiento, 100)}%`, background: cm.color }} />
                </div>
                <p className="mt-2 text-[11px] text-[hsl(var(--color-muted))]">
                  Meta {fmtKg(cm.presupuesto)} kg ·{" "}
                  {ok ? `superada por ${fmtKg(cierre.asiCerramos - cm.presupuesto)} kg` : `${fmtKg(cm.presupuesto - cierre.asiCerramos)} kg por debajo`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
