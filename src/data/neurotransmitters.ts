import type { Neurotransmitter } from '../types';

/**
 * Phase 1 MVP: 4 primary neurotransmitter systems
 * Circadian rhythms are simplified models based on published research.
 */

export const defaultNeurotransmitters: Neurotransmitter[] = [
    {
        id: 'adenosine',
        name: 'Adenosine',
        abbreviation: 'ADO',
        description: 'Sleep pressure molecule. Accumulates during wakefulness, cleared during sleep.',
        baselineLevel: 20,
        currentLevel: 20,
        status: 'rising',
        color: '#8B5CF6',   // violet
        iconEmoji: '😴',
        receptors: [
            {
                id: 'a1',
                subtype: 'A1',
                label: 'A1 (Sleep Pressure)',
                sensitivity: 100,
                occupancy: 20,
                statusEffects: [],
            },
            {
                id: 'a2a',
                subtype: 'A2A',
                label: 'A2A (Alertness)',
                sensitivity: 100,
                occupancy: 20,
                statusEffects: [],
            },
        ],
        circadianRhythm: {
            // Adenosine accumulates linearly during wake hours (~5%/hr from wake)
            getLevel: (hour: number) => {
                // Assume wake at 7, sleep at 23
                if (hour >= 23 || hour < 7) return 10; // cleared during sleep
                const wakeHours = hour - 7;
                return Math.min(10 + wakeHours * 5.6, 100);
            },
        },
    },
    {
        id: 'dopamine',
        name: 'Dopamine',
        abbreviation: 'DA',
        description: 'Motivation, reward, and pleasure. Drives goal-directed behavior.',
        baselineLevel: 60,
        currentLevel: 60,
        status: 'stable',
        color: '#F59E0B',   // amber
        iconEmoji: '⚡',
        receptors: [
            {
                id: 'd1',
                subtype: 'D1',
                label: 'D1 (Motivation)',
                sensitivity: 100,
                occupancy: 50,
                statusEffects: [],
            },
            {
                id: 'd2',
                subtype: 'D2',
                label: 'D2 (Reward)',
                sensitivity: 100,
                occupancy: 50,
                statusEffects: [],
            },
        ],
        circadianRhythm: {
            // Dopamine peaks in late morning, dips in afternoon
            getLevel: (hour: number) => {
                if (hour >= 23 || hour < 7) return 40;
                if (hour >= 7 && hour < 10) return 40 + ((hour - 7) / 3) * 30; // morning rise
                if (hour >= 10 && hour < 14) return 70;                         // plateau
                if (hour >= 14 && hour < 18) return 70 - ((hour - 14) / 4) * 20; // afternoon dip
                return 50 - ((hour - 18) / 5) * 10;                             // evening decline
            },
        },
    },
    {
        id: 'serotonin',
        name: 'Serotonin',
        abbreviation: '5-HT',
        description: 'Mood regulation, wellbeing, and social behavior. Light-dependent.',
        baselineLevel: 55,
        currentLevel: 55,
        status: 'stable',
        color: '#06B6D4',   // cyan
        iconEmoji: '🌊',
        receptors: [
            {
                id: '5ht1a',
                subtype: '5-HT1A',
                label: '5-HT1A (Mood)',
                sensitivity: 100,
                occupancy: 50,
                statusEffects: [],
            },
            {
                id: '5ht2a',
                subtype: '5-HT2A',
                label: '5-HT2A (Perception)',
                sensitivity: 100,
                occupancy: 50,
                statusEffects: [],
            },
        ],
        circadianRhythm: {
            // Serotonin tracks daylight: rises with sun, falls at night
            getLevel: (hour: number) => {
                if (hour >= 22 || hour < 6) return 35;
                if (hour >= 6 && hour < 12) return 35 + ((hour - 6) / 6) * 35;  // morning rise
                if (hour >= 12 && hour < 16) return 70;                          // midday peak
                return 70 - ((hour - 16) / 6) * 35;                              // evening decline
            },
        },
    },
    {
        id: 'gaba',
        name: 'GABA',
        abbreviation: 'GABA',
        description: 'Primary inhibitory neurotransmitter. Promotes calm, reduces anxiety.',
        baselineLevel: 50,
        currentLevel: 50,
        status: 'stable',
        color: '#10B981',   // emerald
        iconEmoji: '🧘',
        receptors: [
            {
                id: 'gabaa',
                subtype: 'GABA-A',
                label: 'GABA-A (Fast Inhibition)',
                sensitivity: 100,
                occupancy: 50,
                statusEffects: [],
            },
            {
                id: 'gabab',
                subtype: 'GABA-B',
                label: 'GABA-B (Slow Inhibition)',
                sensitivity: 100,
                occupancy: 50,
                statusEffects: [],
            },
        ],
        circadianRhythm: {
            // GABA rises in evening (promotes sleep), lower during active day
            getLevel: (hour: number) => {
                if (hour >= 22 || hour < 6) return 75;                           // high during sleep
                if (hour >= 6 && hour < 10) return 75 - ((hour - 6) / 4) * 30;  // morning decline
                if (hour >= 10 && hour < 18) return 45;                          // daytime baseline
                return 45 + ((hour - 18) / 4) * 30;                              // evening rise
            },
        },
    },
];
