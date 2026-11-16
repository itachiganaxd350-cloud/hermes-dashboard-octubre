export interface CierreOct {
  asiCerramos: number;
  presupuesto1: number;
  cumplimiento1: number;
  presupuesto2: number;
  cumplimiento2: number;
  crecimientoAA: number;
  crecimientoMM: number;
  margen: number;
  utilidad: number;
  valorNeto: number;
}

export interface TotalesPesos {
  venta2024: number;
  real2025: number;
  presupuesto2026: number;
  real2026: number;
}

export interface PesosData {
  meses: string[];
  venta2024: (number | null)[];
  real2025: (number | null)[];
  presupuesto2026: (number | null)[];
  real2026: (number | null)[];
  totales: TotalesPesos;
  ytd: { meses: number; real2026: number; real2025: number; crecimientoPct: number };
}

export interface TotalesKilos {
  venta2024: number;
  real2025: number;
  presupuesto2026: number;
  real2026: number;
  proyeccion2027: number;
}

export interface KilosData {
  meses: string[];
  venta2024: (number | null)[];
  real2025: (number | null)[];
  presupuesto2026: (number | null)[];
  real2026: (number | null)[];
  crecimiento2026: (number | null)[];
  proyeccion2027: (number | null)[];
  totales: TotalesKilos;
  ytd: {
    meses: number;
    real2026: number;
    real2025: number;
    venta2024: number;
    presupuesto2026: number;
    crecimientoPct: number;
    cumplimientoPct: number;
  };
}

export interface Nicho {
  nombre: string;
  kilos: number;
}

export interface Producto {
  producto: string;
  kilos: number;
  valor: number;
  utilidad: number;
  margen: number;
}

export interface DetalleRow {
  codigo: string;
  producto: string;
  tipoCliente: string;
  margen: number | null;
  utilidad: number | null;
  valor: number | null;
  kilos: number | null;
}

export interface CanalesData {
  terrazas: Record<string, (number | null)[]>;
  comercializadora: Record<string, (number | null)[]>;
  participacion2026: (number | null)[];
  meses: string[];
  totales: {
    terrazas: Record<string, number>;
    comercializadora: Record<string, number>;
    participacion2026: number | null;
  };
  fuente: string;
}

export interface Dataset {
  meta: { titulo: string; periodo: string; fuente: string };
  cierre: CierreOct;
  pesos: PesosData;
  kilos: KilosData;
  nichos: Nicho[];
  nichosTotal: number;
  productos: Producto[];
  detalle: DetalleRow[];
  tiposCliente: string[];
  canales: CanalesData;
}
