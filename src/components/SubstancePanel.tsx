import { useState } from 'react';
import { useNeuroStore } from '../store';
import { substances, substanceMap } from '../data/substances';
import { getEffectiveness, calculateTolerance } from '../engine/pharmacokinetics';

// ─── Substance Card ───────────────────────────────────────────────────────────

function SubstanceCard({ substanceId }: { substanceId: string }) {
    const substance = substanceMap.get(substanceId)!;
    const logSubstance = useNeuroStore(s => s.logSubstance);
    const allLogs = useNeuroStore(s => s.substanceLogs);
    const [dose, setDose] = useState(substance.commonDoses[0]);
    const [showConfirm, setShowConfirm] = useState(false);

    const now = Date.now();
    const tolerance = calculateTolerance(allLogs, substance, now);
    const activeLogs = allLogs.filter(
        l => l.substanceId === substanceId && l.expectedClearance > now,
    );
    const isActive = activeLogs.length > 0;

    // Dose-dependent PK values — updates reactively when dose changes
    const pk = substance.getDosePK(dose);

    const handleLog = () => {
        if (!showConfirm) {
            setShowConfirm(true);
            return;
        }
        logSubstance(substanceId, dose);
        setShowConfirm(false);
    };

    return (
        <div className={`substance-card ${isActive ? 'substance-active' : ''}`} style={{ '--sub-color': substance.color } as React.CSSProperties}>
            <div className="substance-header">
                <div>
                    <h4 className="substance-name">{substance.name}</h4>
                    <span className="substance-category">{substance.category}</span>
                </div>
                {isActive && <span className="substance-active-badge">Active</span>}
            </div>

            <p className="substance-mechanism">{substance.description}</p>

            <div className="substance-stats">
                <div className="substance-stat">
                    <span className="stat-label">Half-life</span>
                    <span className="stat-value" key={`hl-${pk.halfLife}`}>{pk.halfLife}h</span>
                </div>
                <div className="substance-stat">
                    <span className="stat-label">Onset</span>
                    <span className="stat-value" key={`on-${pk.onsetTime}`}>{pk.onsetTime}m</span>
                </div>
                <div className="substance-stat">
                    <span className="stat-label">Peak</span>
                    <span className="stat-value" key={`pk-${pk.peakTime}`}>{pk.peakTime}m</span>
                </div>
                <div className="substance-stat">
                    <span className="stat-label">Tolerance</span>
                    <span className={`stat-value ${tolerance < 70 ? 'stat-warn' : ''}`} key={`tol-${tolerance}`}>{Math.round(tolerance)}%</span>
                </div>
            </div>

            {/* Active substance timeline */}
            {activeLogs.map(log => {
                const eff = getEffectiveness(log, substance, now);
                const elapsed = Math.round((now - log.timestamp) / (1000 * 60));
                return (
                    <div key={log.id} className="substance-active-info">
                        <div className="active-bar-track">
                            <div className="active-bar-fill" style={{ width: `${eff}%`, background: substance.color }} />
                        </div>
                        <span className="active-bar-label">{Math.round(eff)}% • {elapsed}m ago • {log.dosage}{substance.dosageUnit}</span>
                    </div>
                );
            })}

            {/* Dose + Log controls */}
            <div className="substance-controls">
                <div className="dose-selector">
                    {substance.commonDoses.map(d => (
                        <button
                            key={d}
                            className={`dose-btn ${dose === d ? 'dose-selected' : ''}`}
                            onClick={() => setDose(d)}
                        >
                            {d}{substance.dosageUnit}
                        </button>
                    ))}
                </div>

                {showConfirm ? (
                    <div className="confirm-row">
                        <button className="log-btn confirm" onClick={handleLog}>
                            ✓ Confirm {dose}{substance.dosageUnit}
                        </button>
                        <button className="log-btn cancel" onClick={() => setShowConfirm(false)}>
                            ✕
                        </button>
                    </div>
                ) : (
                    <button className="log-btn" onClick={handleLog}>
                        Log Dose
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Substance Panel ──────────────────────────────────────────────────────────

export function SubstancePanel() {
    const [filter, setFilter] = useState<string>('All');
    const categories = ['All', ...new Set(substances.map(s => s.category))];

    const filtered = filter === 'All'
        ? substances
        : substances.filter(s => s.category === filter);

    return (
        <div className="substance-panel">
            <h2 className="panel-title">Substances</h2>

            <div className="category-filters">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`filter-btn ${filter === cat ? 'filter-active' : ''}`}
                        onClick={() => setFilter(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="substance-list">
                {filtered.map(s => (
                    <SubstanceCard key={s.id} substanceId={s.id} />
                ))}
            </div>
        </div>
    );
}
