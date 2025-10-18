import { BrowserRouter, Route, Routes } from 'react-router'
import { lazy } from 'react'
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));

const Catalogo = lazy(() => import('./views/Catalogos'));
const Asientos = lazy(() => import('./views/Asientos'));
const LibroMayor = lazy(() => import('./views/LibroMayor'));
const LibroDiario = lazy(() => import('./views/LibroDiario'));
const CierreContable = lazy(() => import('./views/CierreContable'));
const Reportes = lazy(() => import('./views/Reportes'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/home" element={<Home />}>
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="asientos" element={<Asientos />} />
          <Route path="libro-diario" element={<LibroDiario />} />
          <Route path="libro" element={<LibroMayor />} />
          <Route path="cierre" element={<CierreContable />} />
          <Route path="reportes" element={<Reportes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
