import './index.css';

import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import Loading from './components/Loading' // ajusta la ruta según dónde lo pongas
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<Loading />}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>

    </Suspense>
  </StrictMode>
)
