import { useState, useEffect } from 'react';
import { useNeuroStore } from '../store';

export function Header() {
    const [time, setTime] = useState(new Date());
    const viewMode = useNeuroStore(s => s.viewMode);
    const setViewMode = useNeuroStore(s => s.setViewMode);
    const sleepSchedule = useNeuroStore(s => s.sleepSchedule);
    const setSleepSchedule = useNeuroStore(s => s.setSleepSchedule);
    const substanceLogs = useNeuroStore(s => s.substanceLogs);
    const clearLogs = useNeuroStore(s => s.clearLogs);

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const activeCount = substanceLogs.filter(l => l.expectedClearance > Date.now()).length;

    return (
        <header className="app-header">
            <div className="header-left">
                <div className="logo-group">
                    <span className="logo-icon">🧠</span>
                    <div>
                        <h1 className="app-title">NeuroMonitor</h1>
                        <p className="app-subtitle">Neurotransmitter Dynamics Tracker</p>
                    </div>
                </div>
            </div>

            <div className="header-center">
                <div className="clock">
                    <span className="clock-time">
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="clock-date">
                        {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                </div>
                {activeCount > 0 && (
                    <span className="active-count-badge">{activeCount} active</span>
                )}
            </div>

            <div className="header-right">
                <div className="sleep-inputs">
                    <label className="sleep-label">
                        <span>Wake</span>
                        <input
                            type="time"
                            className="time-input"
                            value={sleepSchedule.wakeTime}
                            onChange={e => setSleepSchedule({ ...sleepSchedule, wakeTime: e.target.value })}
                        />
                    </label>
                    <label className="sleep-label">
                        <span>Sleep</span>
                        <input
                            type="time"
                            className="time-input"
                            value={sleepSchedule.sleepTime}
                            onChange={e => setSleepSchedule({ ...sleepSchedule, sleepTime: e.target.value })}
                        />
                    </label>
                </div>

                <div className="header-actions">
                    <button
                        className={`view-toggle ${viewMode === 'advanced' ? 'view-active' : ''}`}
                        onClick={() => setViewMode(viewMode === 'simple' ? 'advanced' : 'simple')}
                        title={viewMode === 'simple' ? 'Switch to Advanced View' : 'Switch to Simple View'}
                    >
                        {viewMode === 'simple' ? '🔬' : '👁️'} {viewMode === 'simple' ? 'Advanced' : 'Simple'}
                    </button>

                    {substanceLogs.length > 0 && (
                        <button
                            className="clear-btn"
                            onClick={() => { if (confirm('Clear all substance logs?')) clearLogs(); }}
                            title="Clear all logs"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
