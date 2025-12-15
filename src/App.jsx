import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { DashboardLayout } from './layouts/DashboardLayout';

// Páginas
import { HomeStats } from './pages/HomeStats';
import { Providers } from './pages/Providers';
import { Products } from './pages/Products';
import { Sales } from './pages/Sales';
import { SalesHistory } from './pages/SalesHistory'; // <--- NUEVO
import { Clients } from './pages/Clients';
import { Users } from './pages/Users'; // <--- NUEVO
import { Profile } from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<HomeStats />} />
          <Route path="pos" element={<Sales />} />
          <Route path="sales-history" element={<SalesHistory />} /> {/* NUEVA RUTA */}
          <Route path="products" element={<Products />} />
          <Route path="providers" element={<Providers />} />
          <Route path="clients" element={<Clients />} />
          <Route path="users" element={<Users />} /> {/* NUEVA RUTA */}
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;