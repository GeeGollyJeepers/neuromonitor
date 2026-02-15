// ─── Core Types ───────────────────────────────────────────────────────────────

export type StatusEffectType =
    | 'agonist'
    | 'antagonist'
    | 'upregulation'
    | 'downregulation'
    | 'modulation'
    | 'precursor';

export type SubstanceCategory =
    | 'Stimulant'
    | 'Nootropic'
    | 'Depressant'
    | 'Supplement'
    | 'Psychedelic';

export type NTStatus = 'rising' | 'falling' | 'stable' | 'blocked' | 'enhanced';

// ─── Receptor ─────────────────────────────────────────────────────────────────

export interface Receptor {
    id: string;
    subtype: string;          // e.g. "A1", "D2", "5-HT2A"
    label: string;            // human-readable label
    sensitivity: number;      // 0-100 (100 = baseline)
    occupancy: number;        // 0-100
    statusEffects: StatusEffect[];
}

export interface StatusEffect {
    type: StatusEffectType;
    source: string;           // substance name
    magnitude: number;        // 0-100
    startTime: number;        // unix ms
}

// ─── Receptor Interaction ─────────────────────────────────────────────────────

export interface ReceptorInteraction {
    receptorId: string;       // matches Receptor.id
    ntId: string;             // which neurotransmitter system
    type: StatusEffectType;
    magnitude: number;        // 0-100 strength of effect
}

// ─── Circadian Pattern ────────────────────────────────────────────────────────

export interface CircadianPattern {
    /** Returns baseline level (0-100) for a given hour-of-day (0-23.99) */
    getLevel: (hourOfDay: number) => number;
}

// ─── Neurotransmitter ─────────────────────────────────────────────────────────

export interface Neurotransmitter {
    id: string;
    name: string;
    abbreviation: string;
    description: string;
    baselineLevel: number;    // 0-100
    currentLevel: number;     // 0-100
    status: NTStatus;
    receptors: Receptor[];
    circadianRhythm: CircadianPattern;
    color: string;            // hex
    iconEmoji: string;
}

// ─── Dose-Dependent Pharmacokinetics ──────────────────────────────────────────

export interface DosePK {
    halfLife: number;         // hours
    onsetTime: number;        // minutes
    peakTime: number;         // minutes
    duration: number;         // total duration in hours
    toleranceRate: number;    // % efficacy loss per consecutive day
}

// ─── Substance ────────────────────────────────────────────────────────────────

export interface Substance {
    id: string;
    name: string;
    category: SubstanceCategory;
    dosageUnit: string;       // "mg", "g", "ml"
    commonDoses: number[];    // e.g. [50, 100, 200]
    defaultPK: DosePK;       // baseline PK values (fallback / reference dose)
    getDosePK: (dose: number) => DosePK;  // dose-specific PK calculation
    receptorInteractions: ReceptorInteraction[];
    description: string;
    mechanism: string;
    color: string;            // hex for UI
}

// ─── Substance Log ────────────────────────────────────────────────────────────

export interface SubstanceLog {
    id: string;
    substanceId: string;
    dosage: number;
    timestamp: number;        // unix ms
    expectedClearance: number; // unix ms
}

// ─── Sleep Schedule ───────────────────────────────────────────────────────────

export interface SleepSchedule {
    wakeTime: string;         // "HH:MM" format
    sleepTime: string;        // "HH:MM" format
}

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
    neurotransmitters: Neurotransmitter[];
    substanceLogs: SubstanceLog[];
    sleepSchedule: SleepSchedule;
    viewMode: 'simple' | 'advanced';
    selectedSubstanceId: string | null;
}
