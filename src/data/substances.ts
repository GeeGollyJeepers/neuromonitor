import type { Substance, DosePK } from '../types';

/**
 * Phase 1 MVP: 7 substances with dose-dependent pharmacokinetics.
 * PK data sourced from PubChem, DrugBank, Examine.com, PsychonautWiki,
 * and peer-reviewed literature. See implementation_plan.md for citations.
 *
 * getDosePK(dose) returns dose-specific PK parameters.
 * Linear interpolation (lerp) is used for continuous dose support.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Linear interpolation between two values based on normalized t (0→1, clamped) */
function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * Math.max(0, Math.min(1, t));
}

/** Round to one decimal place */
function r1(n: number): number {
    return Math.round(n * 10) / 10;
}

// ─── Substances ───────────────────────────────────────────────────────────────

export const substances: Substance[] = [
    // ── Caffeine ──────────────────────────────────────────────────────────────
    {
        id: 'caffeine',
        name: 'Caffeine',
        category: 'Stimulant',
        dosageUnit: 'mg',
        commonDoses: [50, 100, 200],
        defaultPK: { halfLife: 5, onsetTime: 15, peakTime: 45, duration: 10, toleranceRate: 5 },
        getDosePK: (dose: number): DosePK => {
            // Half-life extends at higher doses due to CYP1A2 saturation (NIH)
            // 50mg ≈ 4.5h, 200mg ≈ 5.5h, 400mg+ ≈ 6.5h
            const t = (dose - 50) / 350; // 0 at 50mg, 1 at 400mg
            const halfLife = r1(lerp(4.5, 6.5, t));
            // Onset is consistent (~15min), peak stable ~45min
            const onsetTime = 15;
            const peakTime = Math.round(lerp(40, 50, t));
            const duration = r1(halfLife * 2.2);
            const toleranceRate = 5;
            return { halfLife, onsetTime, peakTime, duration, toleranceRate };
        },
        description: 'Adenosine blocker. Most consumed psychoactive worldwide.',
        mechanism: 'Blocks A1/A2A adenosine receptors; secondary dopamine upregulation via A2A-D2 interaction.',
        color: '#92400E',
        receptorInteractions: [
            { receptorId: 'a1', ntId: 'adenosine', type: 'antagonist', magnitude: 80 },
            { receptorId: 'a2a', ntId: 'adenosine', type: 'antagonist', magnitude: 70 },
            { receptorId: 'd2', ntId: 'dopamine', type: 'modulation', magnitude: 20 },
        ],
    },

    // ── L-Theanine ────────────────────────────────────────────────────────────
    {
        id: 'l-theanine',
        name: 'L-Theanine',
        category: 'Nootropic',
        dosageUnit: 'mg',
        commonDoses: [100, 200, 400],
        defaultPK: { halfLife: 1.1, onsetTime: 30, peakTime: 50, duration: 4, toleranceRate: 1 },
        getDosePK: (dose: number): DosePK => {
            // Half-life stable ~1.1h (65min) across doses (ResearchGate)
            // Duration of noticeable effect extends: 100mg→3h, 400mg→7h
            const t = (dose - 100) / 300;
            const halfLife = 1.1;
            const onsetTime = Math.round(lerp(35, 25, t)); // faster onset at higher doses
            const peakTime = 50;
            const duration = r1(lerp(3, 7, t));
            const toleranceRate = 1;
            return { halfLife, onsetTime, peakTime, duration, toleranceRate };
        },
        description: 'Green tea amino acid. Calm focus without sedation.',
        mechanism: 'Increases GABA, serotonin, and dopamine. Promotes alpha brain waves.',
        color: '#059669',
        receptorInteractions: [
            { receptorId: 'gabaa', ntId: 'gaba', type: 'agonist', magnitude: 35 },
            { receptorId: '5ht1a', ntId: 'serotonin', type: 'modulation', magnitude: 20 },
            { receptorId: 'd1', ntId: 'dopamine', type: 'modulation', magnitude: 15 },
        ],
    },

    // ── Nicotine ──────────────────────────────────────────────────────────────
    {
        id: 'nicotine',
        name: 'Nicotine',
        category: 'Stimulant',
        dosageUnit: 'mg',
        commonDoses: [1, 2, 4],
        defaultPK: { halfLife: 2, onsetTime: 5, peakTime: 15, duration: 4, toleranceRate: 12 },
        getDosePK: (dose: number): DosePK => {
            // Elimination t½ constant ~2h across NRT strengths (NIH)
            // Onset very fast (~5min), peak ~15min, all dose-independent
            const halfLife = 2;
            const onsetTime = 5;
            const peakTime = 15;
            // Duration extends slightly with dose (more to clear)
            const t = (dose - 1) / 5;
            const duration = r1(lerp(3.5, 5, t));
            const toleranceRate = 12;
            return { halfLife, onsetTime, peakTime, duration, toleranceRate };
        },
        description: 'nAChR agonist. Rapid attention and focus enhancer.',
        mechanism: 'Activates nicotinic receptors triggering downstream dopamine and norepinephrine release.',
        color: '#DC2626',
        receptorInteractions: [
            { receptorId: 'd1', ntId: 'dopamine', type: 'agonist', magnitude: 55 },
            { receptorId: 'd2', ntId: 'dopamine', type: 'agonist', magnitude: 45 },
        ],
    },

    // ── L-Tyrosine ────────────────────────────────────────────────────────────
    {
        id: 'l-tyrosine',
        name: 'L-Tyrosine',
        category: 'Nootropic',
        dosageUnit: 'mg',
        commonDoses: [250, 500, 1000],
        defaultPK: { halfLife: 2, onsetTime: 30, peakTime: 90, duration: 5, toleranceRate: 2 },
        getDosePK: (dose: number): DosePK => {
            // Peak time delays at higher doses: 90min→120min (NIH older adult studies)
            // Half-life slight increase ~2→2.5h at 1000mg+
            const t = (dose - 250) / 750;
            const halfLife = r1(lerp(1.8, 2.5, t));
            const onsetTime = 30;
            const peakTime = Math.round(lerp(75, 120, t));
            const duration = r1(lerp(4, 6, t));
            const toleranceRate = 2;
            return { halfLife, onsetTime, peakTime, duration, toleranceRate };
        },
        description: 'Dopamine precursor amino acid. Best under stress or depletion.',
        mechanism: 'Raw material for dopamine/NE synthesis via tyrosine hydroxylase.',
        color: '#7C3AED',
        receptorInteractions: [
            { receptorId: 'd1', ntId: 'dopamine', type: 'precursor', magnitude: 40 },
            { receptorId: 'd2', ntId: 'dopamine', type: 'precursor', magnitude: 35 },
        ],
    },

    // ── Flmodafinil (CRL-40,940) ──────────────────────────────────────────────
    {
        id: 'flmodafinil',
        name: 'Flmodafinil',
        category: 'Stimulant',
        dosageUnit: 'mg',
        commonDoses: [25, 50, 100],
        defaultPK: { halfLife: 13, onsetTime: 20, peakTime: 240, duration: 16, toleranceRate: 3 },
        getDosePK: (dose: number): DosePK => {
            // Half-life 12-15h, increases slightly at higher doses
            // Onset 15-30min (faster than modafinil). Peak 3-6h.
            const t = (dose - 25) / 75;
            const halfLife = r1(lerp(12, 15, t));
            const onsetTime = Math.round(lerp(15, 25, t));
            const peakTime = Math.round(lerp(180, 300, t));
            const duration = r1(lerp(14, 18, t));
            const toleranceRate = 3;
            return { halfLife, onsetTime, peakTime, duration, toleranceRate };
        },
        description: 'Fluorinated eugeroic. Higher bioavailability than modafinil.',
        mechanism: 'Selective dopamine reuptake inhibitor (DAT). Modulates histamine and orexin systems.',
        color: '#2563EB',
        receptorInteractions: [
            { receptorId: 'd1', ntId: 'dopamine', type: 'agonist', magnitude: 50 },
            { receptorId: 'a2a', ntId: 'adenosine', type: 'antagonist', magnitude: 25 },
            { receptorId: '5ht1a', ntId: 'serotonin', type: 'modulation', magnitude: 12 },
        ],
    },

    // ── Bromantane ─────────────────────────────────────────────────────────────
    {
        id: 'bromantane',
        name: 'Bromantane',
        category: 'Nootropic',
        dosageUnit: 'mg',
        commonDoses: [25, 50, 100],
        defaultPK: { halfLife: 11, onsetTime: 90, peakTime: 180, duration: 24, toleranceRate: 1 },
        getDosePK: (dose: number): DosePK => {
            // PK largely dose-independent in 25-100mg clinical range (Wikipedia/NIH)
            // Peak 2.75-4h (faster in women). Half-life ~11h constant.
            const t = (dose - 25) / 75;
            const halfLife = 11;
            const onsetTime = 90;
            const peakTime = Math.round(lerp(165, 210, t)); // slight shift
            const duration = 24;
            const toleranceRate = 1;
            return { halfLife, onsetTime, peakTime, duration, toleranceRate };
        },
        description: 'Adamantane derivative. Upregulates dopamine synthesis enzymes.',
        mechanism: 'Increases TH and AADC gene expression for endogenous dopamine production.',
        color: '#0891B2',
        receptorInteractions: [
            { receptorId: 'd1', ntId: 'dopamine', type: 'upregulation', magnitude: 50 },
            { receptorId: 'd2', ntId: 'dopamine', type: 'upregulation', magnitude: 45 },
        ],
    },

    // ── Shilajit ──────────────────────────────────────────────────────────────
    {
        id: 'shilajit',
        name: 'Shilajit',
        category: 'Supplement',
        dosageUnit: 'mg',
        commonDoses: [250, 500],
        defaultPK: { halfLife: 7, onsetTime: 60, peakTime: 180, duration: 12, toleranceRate: 2 },
        getDosePK: (dose: number): DosePK => {
            // Fulvic acid t½ ~41h in mice (oral); modeled conservatively for humans
            // Effects build over days; acute fulvic acid onset ~60min
            const t = (dose - 250) / 250;
            const halfLife = 7;
            const onsetTime = 60;
            const peakTime = Math.round(lerp(150, 210, t));
            const duration = r1(lerp(10, 14, t));
            const toleranceRate = 2;
            return { halfLife, onsetTime, peakTime, duration, toleranceRate };
        },
        description: 'Himalayan mineral resin rich in fulvic acid and DBPs.',
        mechanism: 'MAO-B inhibition slows dopamine breakdown. Enhances mitochondrial function.',
        color: '#78350F',
        receptorInteractions: [
            { receptorId: 'd1', ntId: 'dopamine', type: 'modulation', magnitude: 30 },
            { receptorId: 'd2', ntId: 'dopamine', type: 'modulation', magnitude: 25 },
        ],
    },
];

export const substanceMap = new Map(substances.map(s => [s.id, s]));
