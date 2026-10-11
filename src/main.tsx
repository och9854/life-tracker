if (import.meta.env.DEV && new URLSearchParams(location.search).has('inspect')) {
  void import("react-grab");
  void import("react-scan").then(({ scan }) => scan());
}

import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';
import './weekly-review.css';

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
