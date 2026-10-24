import type { Panel, Substrate } from './panels.ts';

export const PAINT_TYPES = ['solid', 'metallic', 'pearl', 'matte'] as const;
export type PaintType = (typeof PAINT_TYPES)[number];

export const CONDITIONS = ['factory', 'unknown'] as const;
/** factory = paint is known to be original (new car, documented history). */
export type Condition = (typeof CONDITIONS)[number];

/** One measured car, exactly as stored in data/measurements/**.yaml. All values in µm. */
export interface MeasurementRecord {
  schema: 1;
  /** Synthetic example data. Never mixed into real statistics. */
  demo?: boolean;
  vehicle: {
    make: string;
    model: string;
    generation?: string;
    year: number;
    paint_type?: PaintType;
    color?: string;
    paint_code?: string;
    market?: string;
  };
  condition: Condition;
  repaired_panels?: Panel[];
  substrate?: Partial<Record<Panel, Substrate>>;
  gauge?: { brand?: string; model?: string };
  measured_on?: string;
  contributor?: string;
  notes?: string;
  readings: Partial<Record<Panel, number[]>>;
}

export interface Summary {
  n: number;
  min: number;
  p10: number;
  median: number;
  p90: number;
  max: number;
}

/** Aggregated reference values for one make / model / generation. */
export interface ModelGroup {
  id: string;
  make: string;
  makeName: string;
  model: string;
  modelSlug: string;
  generation?: string;
  years: [number, number];
  vehicles: number;
  /** true when the group only contains synthetic example records. */
  demo: boolean;
  overall: Summary;
  panels: Partial<Record<Panel, Summary>>;
}

export interface Db {
  schema: 1;
  generated: string;
  records: number;
  realRecords: number;
  makes: { slug: string; name: string }[];
  groups: ModelGroup[];
}
