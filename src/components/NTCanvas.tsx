import { useState } from 'react';
import type { Neurotransmitter, Receptor } from '../types';
import { useNeuroStore } from '../store';

// ─── Status Colors & Labels ───────────────────────────────────────────────────

const statusConfig = {
    agonist: { color: '#22C55E', label: 'Agonist', icon: '✦' },
    antagonist: { color: '#EF4444', label: 'Antagonist', icon: '✕' },
    upregulation: { color: '#3B82F6', label: 'Upregulation', icon: '↑' },
    downregulation: { color: '#6B7280', label: 'Downregulation', icon: '↓' },
    modulation: { color: '#EAB308', label: 'Modulation', icon: '~' },
    precursor: { color: '#A78BFA', label: 'Precursor', icon: '◆' },
};

const ntStatusColors = {
    rising: '#FACC15',
    falling: '#6B7280',
    stable: '#94A3B8',
    blocked: '#EF4444',
    enhanced: '#22C55E',
};

// ─── Receptor Detail Row ──────────────────────────────────────────────────────

function ReceptorRow({ receptor }: { receptor: Receptor }) {
    return (
        <div className="receptor-row">
            <div className="receptor-header">
                <span className="receptor-subtype">{receptor.subtype}</span>
                <span className="receptor-label">{receptor.label}</span>
            </div>
            <div className="receptor-bars">
                <div className="receptor-bar-group">
                    <span className="receptor-bar-label">Sensitivity</span>
                    <div className="receptor-bar-track">
                        <div
                            className="receptor-bar-fill sensitivity"
                            style={{ width: `${Math.min(receptor.sensitivity, 100)}%` }}
                        />
                        {receptor.sensitivity > 100 && (
                            <div
                                className="receptor-bar-fill sensitivity-boost"
                                style={{ width: `${receptor.sensitivity - 100}%`, left: '100%' }}
                            />
                        )}
                    </div>
                    <span className="receptor-bar-value">{Math.round(receptor.sensitivity)}%</span>
                </div>
                <div className="receptor-bar-group">
                    <span className="receptor-bar-label">Occupancy</span>
                    <div className="receptor-bar-track">
                        <div
                            className="receptor-bar-fill occupancy"
                            style={{ width: `${receptor.occupancy}%` }}
                        />
                    </div>
                    <span className="receptor-bar-value">{Math.round(receptor.occupancy)}%</span>
                </div>
            </div>
            {receptor.statusEffects.length > 0 && (
                <div className="receptor-effects">
                    {receptor.statusEffects.map((effect, i) => {
                        const config = statusConfig[effect.type];
                        return (
                            <span
                                key={i}
                                className="effect-badge"
                                style={{ '--effect-color': config.color } as React.CSSProperties}
                            >
                                {config.icon} {effect.source} ({Math.round(effect.magnitude)}%)
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── NT Card ──────────────────────────────────────────────────────────────────

export function NTCard({ nt }: { nt: Neurotransmitter }) {
    const viewMode = useNeuroStore(s => s.viewMode);
    const [hovered, setHovered] = useState(false);

    const statusColor = ntStatusColors[nt.status];
    const levelPercent = Math.round(nt.currentLevel);
    const hasEffects = nt.receptors.some(r => r.statusEffects.length > 0);

    return (
        <div
            className={`nt-card ${hasEffects ? 'nt-card-active' : ''}`}
            style={{ '--nt-color': nt.color, '--status-color': statusColor } as React.CSSProperties}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Header */}
            <div className="nt-card-header">
                <div className="nt-icon-wrap">
                    <span className="nt-icon">{nt.iconEmoji}</span>
                    <div className={`nt-status-ring ${nt.status}`} />
                </div>
                <div className="nt-info">
                    <h3 className="nt-name">{nt.name}</h3>
                    <span className="nt-abbrev">{nt.abbreviation}</span>
                </div>
                <div className="nt-level-badge" style={{ background: nt.color }}>
                    {levelPercent}%
                </div>
            </div>

            {/* Level Bar */}
            <div className="nt-level-bar-track">
                <div
                    className="nt-level-bar-fill"
                    style={{
                        width: `${levelPercent}%`,
                        background: `linear-gradient(90deg, ${nt.color}88, ${nt.color})`,
                    }}
                />
                <div
                    className="nt-baseline-marker"
                    style={{ left: `${nt.baselineLevel}%` }}
                    title={`Baseline: ${nt.baselineLevel}%`}
                />
            </div>

            {/* Status label */}
            <div className="nt-status-row">
                <span className="nt-status-label" style={{ color: statusColor }}>
                    {nt.status.charAt(0).toUpperCase() + nt.status.slice(1)}
                </span>
                {hasEffects && (
                    <span className="nt-effects-count">
                        {nt.receptors.reduce((sum, r) => sum + r.statusEffects.length, 0)} active effect(s)
                    </span>
                )}
            </div>

            {/* Tooltip on hover */}
            {hovered && (
                <div className="nt-tooltip">
                    <p>{nt.description}</p>
                </div>
            )}

            {/* Advanced: Receptor details */}
            {viewMode === 'advanced' && (
                <div className="nt-receptors">
                    {nt.receptors.map(r => (
                        <ReceptorRow key={r.id} receptor={r} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── NT Canvas (Grid of Cards) ────────────────────────────────────────────────

export function NTCanvas() {
    const neurotransmitters = useNeuroStore(s => s.neurotransmitters);

    return (
        <div className="nt-canvas">
            {neurotransmitters.map(nt => (
                <NTCard key={nt.id} nt={nt} />
            ))}
        </div>
    );
}
