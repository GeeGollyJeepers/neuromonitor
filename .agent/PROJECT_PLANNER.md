# NeuroMonitor Project Planner

## Vision: "Neural Weather" Dashboard
The project aims to frame complex neurochemistry through the lens of a "weather dashboard." Just as a weather app provides high-level "current conditions" and "forecasts" while allowing enthusiasts to dive into barometric pressure and satellite maps, NeuroMonitor should make neurotransmitter dynamics accessible and friendly without sacrificing scientific nuance.

### Key Analogues:
- **Current Conditions**: Baseline circadian rhythms and current receptor occupancy levels.
- **Neural Forecast**: Predicting how a specific dose will alter the "neuro-climate" over the next several hours.
- **Storms/High Pressure**: Visualizing acute stimulant or sedative effects.

---

## Future Roadmap

### 1. Unified Dose Control Update
- **Custom Input**: Allow users to type in any dose amount, not just the presets.
- **Custom Presets**: Allow users to save their own "Quick Button" dose amounts for their specific regimen.
- **Integration**: Ensure the PK engine handles these arbitrary numbers using the established `getDosePK` interpolation logic.

### 2. Substance Category & Tagging Update
- **Granular Tags**: Move away from broad categories like "Stimulant." Add functional tags (e.g., `Dopamine`, `GABA`, `Agonist`, `Upregulator`, `MAOI`).
- **Stacked Filtering**: Users should be able to filter the substance list by multiple tags (e.g., "Dopamine" AND "Agonist").
- **UI**: A tag cloud or dropdown system at the top of the substance list.

### 3. "Neural Forecast" Confirmation
- **Pre-Log Preview**: When clicking "Log Dose," show a confirmation dialog with a "forecast" report.
- **Impact visualization**: Show a simple projection of how receptors will be altered *before* the user commits the log.
- **Stop/Check**: Gives the user a chance to rethink or adjust if the predicted impact is too high.

### 4. Info Panels & Deep Dive
- **Substance Detail Views**: Clickable cards that open into a full-page or modal info panel.
- **Expanded Mechanism**: Move the longer scientific descriptions and study citations here.
- **Visuals**: Individual PK curves (Cmax, Tmax) for that substance.

### 5. Aesthetic Overhaul: Weather Theme
- **Glassmorphism**: Use sleek, transparent backgrounds reminiscent of modern weather apps.
- **Micro-animations**: Subtle drifting or pulsing effects for "active" neurotransmitter states.
- **Dynamic Icons**: Iconography that reflects the "mood" or state of the system (e.g., a "sunny" icon for high dopamine/serotonin).

---

## Done (Completed)
- [x] **Dose-Dependent PK**: Implemented `getDosePK` continuous functions for all substances.
- [x] **Reactive UI**: Substance stats (half-life, onset, etc.) update instantly when switching dose presets.
- [x] **Substance Refresh**: Magnesium removed; Modafinil upgraded to Flmodafinil.
- [x] **Core Engine**: Pharmacokinetic interpolation logic established.
