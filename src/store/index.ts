import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    Neurotransmitter,
    SubstanceLog,
    SleepSchedule,
    StatusEffect,
} from '../types';
import { defaultNeurotransmitters } from '../data/neurotransmitters';
import { substanceMap } from '../data/substances';
import {
    getEffectiveness,
    calculateReceptorImpact,
    calculateClearanceTime,
} from '../engine/pharmacokinetics';

// ─── Store Interface ──────────────────────────────────────────────────────────

interface NeuroState {
    neurotransmitters: Neurotransmitter[];
    substanceLogs: SubstanceLog[];
    sleepSchedule: SleepSchedule;
    viewMode: 'simple' | 'advanced';
    selectedSubstanceId: string | null;

    // Actions
    logSubstance: (substanceId: string, dosage: number) => void;
    removeLog: (logId: string) => void;
    clearLogs: () => void;
    setSleepSchedule: (schedule: SleepSchedule) => void;
    setViewMode: (mode: 'simple' | 'advanced') => void;
    setSelectedSubstance: (id: string | null) => void;
    updateNTLevels: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getCurrentHour(): number {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNeuroStore = create<NeuroState>()(
    persist(
        (set, get) => ({
            neurotransmitters: defaultNeurotransmitters,
            substanceLogs: [],
            sleepSchedule: { wakeTime: '07:00', sleepTime: '23:00' },
            viewMode: 'simple',
            selectedSubstanceId: null,

            logSubstance: (substanceId: string, dosage: number) => {
                const substance = substanceMap.get(substanceId);
                if (!substance) return;

                const now = Date.now();
                const clearanceMs = calculateClearanceTime(substance, dosage);

                const newLog: SubstanceLog = {
                    id: generateId(),
                    substanceId,
                    dosage,
                    timestamp: now,
                    expectedClearance: now + clearanceMs,
                };

                set(state => ({
                    substanceLogs: [...state.substanceLogs, newLog],
                }));

                // Immediately update NT levels
                get().updateNTLevels();
            },

            removeLog: (logId: string) => {
                set(state => ({
                    substanceLogs: state.substanceLogs.filter(l => l.id !== logId),
                }));
                get().updateNTLevels();
            },

            clearLogs: () => {
                set({ substanceLogs: [] });
                get().updateNTLevels();
            },

            setSleepSchedule: (schedule: SleepSchedule) => {
                set({ sleepSchedule: schedule });
                get().updateNTLevels();
            },

            setViewMode: (mode: 'simple' | 'advanced') => set({ viewMode: mode }),

            setSelectedSubstance: (id: string | null) => set({ selectedSubstanceId: id }),

            updateNTLevels: () => {
                const { substanceLogs } = get();
                const now = Date.now();
                const hour = getCurrentHour();

                // Start from fresh baseline NTs
                const updated = defaultNeurotransmitters.map(baseNT => {
                    const nt: Neurotransmitter = {
                        ...baseNT,
                        currentLevel: baseNT.circadianRhythm.getLevel(hour),
                        receptors: baseNT.receptors.map(r => ({
                            ...r,
                            occupancy: baseNT.circadianRhythm.getLevel(hour) * (r.occupancy / baseNT.baselineLevel),
                            sensitivity: 100,
                            statusEffects: [],
                        })),
                        status: 'stable',
                    };

                    return nt;
                });

                // Apply active substance effects
                const activeLogs = substanceLogs.filter(l => l.expectedClearance > now);

                for (const log of activeLogs) {
                    const substance = substanceMap.get(log.substanceId);
                    if (!substance) continue;

                    const effectiveness = getEffectiveness(log, substance, now);
                    if (effectiveness < 1) continue;

                    const impacts = calculateReceptorImpact(substance.receptorInteractions, effectiveness);

                    for (const nt of updated) {
                        for (const receptor of nt.receptors) {
                            const impact = impacts.get(receptor.id);
                            if (impact === undefined) continue;

                            const interaction = substance.receptorInteractions
                                .find(i => i.receptorId === receptor.id);
                            if (!interaction) continue;

                            const effect: StatusEffect = {
                                type: interaction.type,
                                source: substance.name,
                                magnitude: impact,
                                startTime: log.timestamp,
                            };

                            receptor.statusEffects.push(effect);

                            // Modify NT levels based on interaction type
                            switch (interaction.type) {
                                case 'agonist':
                                case 'precursor':
                                    nt.currentLevel = Math.min(nt.currentLevel + impact * 0.3, 100);
                                    nt.status = 'enhanced';
                                    break;
                                case 'antagonist':
                                    nt.currentLevel = Math.max(nt.currentLevel - impact * 0.3, 0);
                                    nt.status = 'blocked';
                                    break;
                                case 'upregulation':
                                    receptor.sensitivity = Math.min(receptor.sensitivity + impact * 0.2, 150);
                                    nt.status = 'enhanced';
                                    break;
                                case 'downregulation':
                                    receptor.sensitivity = Math.max(receptor.sensitivity - impact * 0.2, 20);
                                    nt.status = 'falling';
                                    break;
                                case 'modulation':
                                    nt.currentLevel = Math.min(nt.currentLevel + impact * 0.15, 100);
                                    if (nt.status === 'stable') nt.status = 'enhanced';
                                    break;
                            }
                        }
                    }
                }

                set({ neurotransmitters: updated });
            },
        }),
        {
            name: 'neuromonitor-storage',
            partialize: (state) => ({
                substanceLogs: state.substanceLogs,
                sleepSchedule: state.sleepSchedule,
                viewMode: state.viewMode,
            }),
        },
    ),
);
