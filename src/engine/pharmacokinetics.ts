import type { Substance, SubstanceLog, ReceptorInteraction, DosePK } from '../types';

/**
 * Pharmacokinetic engine for substance timeline calculations.
 * Uses first-order kinetics (exponential decay) with onset ramp modeling.
 * All PK-dependent functions accept a resolved DosePK for dose-specific accuracy.
 */

// ─── Core Calculations ───────────────────────────────────────────────────────

/**
 * Calculate remaining active level via exponential decay.
 * @param dose    Initial dose amount
 * @param halfLife  Half-life in hours
 * @param elapsedHours  Time since administration
 * @returns  Remaining active amount
 */
export function calculateDecay(dose: number, halfLife: number, elapsedHours: number): number {
    if (elapsedHours < 0) return 0;
    return dose * Math.pow(0.5, elapsedHours / halfLife);
}

/**
 * Calculate the onset/absorption curve (sigmoid ramp-up to peak, then decay).
 * Models the plasma concentration curve more realistically than instant-on.
 * @returns  Effective active level at the given time (0 to dose)
 */
export function calculateActiveLevel(
    dose: number,
    pk: DosePK,
    elapsedMinutes: number,
): number {
    if (elapsedMinutes < 0) return 0;

    const onsetMin = pk.onsetTime;
    const peakMin = pk.peakTime;
    const halfLifeMin = pk.halfLife * 60;

    // Phase 1: Onset ramp (0 → peak) using sigmoid
    if (elapsedMinutes <= peakMin) {
        if (peakMin === 0) return dose;
        // Smooth ramp: use sine-based easing for natural absorption curve
        const progress = elapsedMinutes / peakMin;
        const ramp = onsetMin > 0
            ? Math.sin((Math.PI / 2) * Math.min(progress * (peakMin / onsetMin), 1))
            : progress;
        return dose * ramp;
    }

    // Phase 2: Post-peak decay
    const minutesPastPeak = elapsedMinutes - peakMin;
    return calculateDecay(dose, halfLifeMin / 60, minutesPastPeak / 60);
}

/**
 * Get the full timeline as percentage (0-100) of a substance log entry.
 * Returns current effectiveness as a fraction of original dose.
 */
export function getEffectiveness(log: SubstanceLog, substance: Substance, nowMs: number): number {
    const elapsedMs = nowMs - log.timestamp;
    const elapsedMinutes = elapsedMs / (1000 * 60);

    if (elapsedMinutes < 0) return 0;

    const pk = substance.getDosePK(log.dosage);
    const peakMin = pk.peakTime;

    // Onset ramp
    if (elapsedMinutes <= peakMin) {
        const progress = peakMin > 0 ? elapsedMinutes / peakMin : 1;
        return Math.sin((Math.PI / 2) * Math.min(progress, 1)) * 100;
    }

    // Post-peak decay
    const hoursPastPeak = (elapsedMinutes - peakMin) / 60;
    return calculateDecay(100, pk.halfLife, hoursPastPeak);
}

/**
 * Calculate receptor impact from a substance at a given moment.
 * Returns a map of receptorId → effective magnitude (0-100).
 */
export function calculateReceptorImpact(
    interactions: ReceptorInteraction[],
    effectivenessPercent: number,
): Map<string, number> {
    const impact = new Map<string, number>();
    for (const interaction of interactions) {
        const effectiveMagnitude = (interaction.magnitude * effectivenessPercent) / 100;
        const current = impact.get(interaction.receptorId) ?? 0;
        impact.set(interaction.receptorId, Math.min(current + effectiveMagnitude, 100));
    }
    return impact;
}

/**
 * Calculate expected clearance time (when less than 5% remains).
 * ~4.3 half-lives to reach <5%.
 */
export function calculateClearanceTime(substance: Substance, dose: number): number {
    const pk = substance.getDosePK(dose);
    return pk.halfLife * 4.3 * 60 * 60 * 1000; // in ms
}

/**
 * Generate timeline data points for charting.
 */
export function generateTimeline(
    log: SubstanceLog,
    substance: Substance,
    intervalMinutes: number = 15,
): { time: number; level: number }[] {
    const points: { time: number; level: number }[] = [];
    const pk = substance.getDosePK(log.dosage);
    const totalMinutes = pk.duration * 60;

    for (let m = 0; m <= totalMinutes; m += intervalMinutes) {
        const timeMs = log.timestamp + m * 60 * 1000;
        const level = getEffectiveness(log, substance, timeMs);
        points.push({ time: timeMs, level });
    }

    return points;
}

/**
 * Simple tolerance estimation based on recent usage.
 * Returns a tolerance factor (0-100, where 100 = no tolerance).
 */
export function calculateTolerance(
    logs: SubstanceLog[],
    substance: Substance,
    nowMs: number,
): number {
    // Look at last 7 days of usage
    const sevenDaysAgo = nowMs - 7 * 24 * 60 * 60 * 1000;
    const recentLogs = logs
        .filter(l => l.substanceId === substance.id && l.timestamp > sevenDaysAgo)
        .sort((a, b) => a.timestamp - b.timestamp);

    if (recentLogs.length === 0) return 100;

    // Count consecutive days of use
    const daySet = new Set<string>();
    for (const log of recentLogs) {
        const d = new Date(log.timestamp);
        daySet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }

    const consecutiveDays = daySet.size;
    // Use the tolerance rate from the most recent dose
    const lastDose = recentLogs[recentLogs.length - 1].dosage;
    const pk = substance.getDosePK(lastDose);
    const toleranceLoss = consecutiveDays * pk.toleranceRate;

    return Math.max(100 - toleranceLoss, 10); // floor at 10%
}
