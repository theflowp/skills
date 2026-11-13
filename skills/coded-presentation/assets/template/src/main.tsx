import '@fontsource-variable/mona-sans/standard.css';
import '@fontsource-variable/geist-mono/wght.css';
import './styles/base.css';
import './styles/slides.css';
import './styles/presenter.css';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);
