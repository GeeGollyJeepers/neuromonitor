import { useEffect } from 'react';
import { Header } from './components/Header';
import { NTCanvas } from './components/NTCanvas';
import { SubstancePanel } from './components/SubstancePanel';
import { ActiveSubstances } from './components/ActiveSubstances';
import { useNeuroStore } from './store';

function App() {
  const updateNTLevels = useNeuroStore(s => s.updateNTLevels);

  // Update NT levels every 30 seconds for real-time tracking
  useEffect(() => {
    updateNTLevels();
    const interval = setInterval(updateNTLevels, 30000);
    return () => clearInterval(interval);
  }, [updateNTLevels]);

  return (
    <div className="app">
      <Header />

      {/* Disclaimer */}
      <div className="disclaimer-bar">
        ⚕️ Educational tool only — not medical advice. Always consult healthcare professionals.
      </div>

      <main className="main-layout">
        <section className="main-content">
          <NTCanvas />
          <ActiveSubstances />
        </section>
        <aside className="sidebar">
          <SubstancePanel />
        </aside>
      </main>
    </div>
  );
}

export default App;
