import { useNeuroStore } from '../store';
import { substanceMap } from '../data/substances';
import { getEffectiveness } from '../engine/pharmacokinetics';

export function ActiveSubstances() {
    const substanceLogs = useNeuroStore(s => s.substanceLogs);
    const removeLog = useNeuroStore(s => s.removeLog);
    const now = Date.now();

    const activeLogs = substanceLogs
        .filter(l => l.expectedClearance > now)
        .sort((a, b) => b.timestamp - a.timestamp);

    if (activeLogs.length === 0) {
        return (
            <div className="active-substances">
                <h3 className="section-title">Active Substances</h3>
                <div className="empty-state">
                    <span className="empty-icon">💤</span>
                    <p>No active substances. Your neurochemistry is running on baseline circadian rhythms.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="active-substances">
            <h3 className="section-title">Active Substances</h3>
            <div className="active-list">
                {activeLogs.map(log => {
                    const substance = substanceMap.get(log.substanceId);
                    if (!substance) return null;

                    const effectiveness = getEffectiveness(log, substance, now);
                    const elapsedMin = Math.round((now - log.timestamp) / (60 * 1000));
                    const remainingMin = Math.round((log.expectedClearance - now) / (60 * 1000));
                    const remainingHrs = Math.floor(remainingMin / 60);
                    const remainingMins = remainingMin % 60;

                    return (
                        <div
                            key={log.id}
                            className="active-item"
                            style={{ '--sub-color': substance.color } as React.CSSProperties}
                        >
                            <div className="active-item-header">
                                <span className="active-item-name">{substance.name}</span>
                                <span className="active-item-dose">{log.dosage}{substance.dosageUnit}</span>
                                <button
                                    className="active-item-remove"
                                    onClick={() => removeLog(log.id)}
                                    title="Remove this log"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="active-progress-track">
                                <div
                                    className="active-progress-fill"
                                    style={{
                                        width: `${effectiveness}%`,
                                        background: `linear-gradient(90deg, ${substance.color}88, ${substance.color})`,
                                    }}
                                />
                            </div>

                            <div className="active-item-meta">
                                <span>{Math.round(effectiveness)}% effective</span>
                                <span>{elapsedMin < 60 ? `${elapsedMin}m ago` : `${Math.floor(elapsedMin / 60)}h ${elapsedMin % 60}m ago`}</span>
                                <span>Clears in {remainingHrs > 0 ? `${remainingHrs}h ` : ''}{remainingMins}m</span>
                            </div>

                            {/* Receptor targets */}
                            <div className="active-item-targets">
                                {substance.receptorInteractions.map((interaction, i) => (
                                    <span key={i} className={`target-tag target-${interaction.type}`}>
                                        {interaction.receptorId.toUpperCase()} • {interaction.type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
