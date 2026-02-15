# 🧠 NeuroMonitor

NeuroMonitor is (ultimately intended to be) a sophisticated web application designed for personal neurotransmitter tracking and pharmacokinetic simulation. It allows users to visualize the theoretical impact of various substances (nootropics, supplements, etc.) on their neural biochemistry in real-time.

## ✨ Features

- **Real-Time Pharmacokinetics**: Simulates substance concentration using dose-dependent decay and half-life modeling.
- **Neurotransmitter impact**: Visualizes theoretical shifts in Dopamine, Serotonin, Acetylcholine, and GABA levels.
- **Interactive Dashboards**: Dynamic charts powered by Recharts for tracking peak concentrations and metabolic windows.
- **Educational Tooling**: Designed to help users understand metabolic timeframes and substance interactions (not medical advice).

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Deployment**: GitHub Pages

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/GeeGollyJeepers/neuromonitor.git
   cd neuromonitor
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

### Deployment

To deploy your own version to GitHub Pages:

```bash
npm run deploy
```

## ⚠️ Disclaimer

**Educational and informational purposes only.** NeuroMonitor is a simulation tool and does not provide medical advice, diagnosis, or treatment. The simulations are based on generalized pharmacokinetic data and may not reflect individual biology. Always consult with a qualified healthcare professional before starting any new supplement or substance regimen.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
