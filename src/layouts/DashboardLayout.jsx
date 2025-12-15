// ... (Tus imports al inicio) ...
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  FaHome, FaBoxOpen, FaUserTie, FaUsers, FaShoppingCart, 
  FaUserCircle, FaSignOutAlt, FaHistory, FaUserShield, FaCashRegister, FaLock, FaUnlock 
} from 'react-icons/fa'; // Importamos iconos de caja
import api from '../api/axios'; // Importamos axios para chequear la caja
import { CashModal } from '../components/CashModal'; // Importamos el modal de caja

import './DashboardLayout.css';
import logoImg from '../assets/logo.png'; 

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- NUEVOS ESTADOS DE CAJA ---
  const [cashStatus, setCashStatus] = useState({ isOpen: false }); 
  const [showCashModal, setShowCashModal] = useState(false); 
  const [cashModalMode, setCashModalMode] = useState('open'); 
  // ---

  // 1. LECTURA DE USUARIO Y ROLES
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isAdmin = user.roles && Array.isArray(user.roles) && user.roles.includes('admin');

  // --- LÓGICA DE CAJA (NUEVA) ---
  const checkCashStatus = async () => {
    try {
        const { data } = await api.get('/cash/status');
        setCashStatus(data); 
    } catch (error) {
        console.error("Error consultando caja desde Layout:", error);
    }
  };

  useEffect(() => { checkCashStatus(); }, []);

  const handleCashClick = () => {
    setCashModalMode(cashStatus.isOpen ? 'close' : 'open');
    setShowCashModal(true);
  };

  const handleCashSuccess = () => {
    setShowCashModal(false);
    checkCashStatus(); // ¡Fundamental!
  };
  // --- FIN LÓGICA DE CAJA ---

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    navigate('/');
  };

  // 2. MENÚ DINÁMICO SEGÚN ROL (código que me enviaste antes)
  // ... (Tu menuItems y filteredMenuItems se mantienen iguales) ...
  const menuItems = [
    { type: 'link', path: '/dashboard', label: 'Resumen', icon: <FaHome />, roles: ['admin'] },
    
    // ZONA VENTAS (Para todos)
    { type: 'divider', label: 'VENTAS' },
    { type: 'link', path: '/dashboard/pos', label: 'Punto de Venta', icon: <FaShoppingCart />, roles: ['admin', 'vendedor'] },
    
    // ZONA GESTIÓN (Solo Admin)
    { type: 'divider', label: 'GESTIÓN', roles: ['admin'] },
    { type: 'link', path: '/dashboard/products', label: 'Productos', icon: <FaBoxOpen />, roles: ['admin'] },
    { type: 'link', path: '/dashboard/providers', label: 'Proveedores', icon: <FaUserTie />, roles: ['admin'] },
    { type: 'link', path: '/dashboard/clients', label: 'Clientes', icon: <FaUsers />, roles: ['admin'] },
    
    // ZONA ADMINISTRACIÓN (Solo Admin)
    { type: 'divider', label: 'ADMINISTRACIÓN', roles: ['admin'] },
    { type: 'link', path: '/dashboard/sales-history', label: 'Historial', icon: <FaHistory />, roles: ['admin'] },
    { type: 'link', path: '/dashboard/users', label: 'Usuarios', icon: <FaUserShield />, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || (isAdmin && item.roles.includes('admin')) || (!isAdmin && item.roles.includes('vendedor'))
  );


  return (
    <div className="dashboard-container">
      {/* --- MODAL DE CAJA (Ahora vive en el Layout) --- */}
      {showCashModal && (
        <CashModal 
          mode={cashModalMode}
          user={user} 
          onClose={() => setShowCashModal(false)}
          onSuccess={handleCashSuccess}
        />
      )}

      {/* --- Sidebar Izquierdo --- */}
      <aside className="sidebar">
        {/* ... (Tu sidebar-header y sidebar-nav se mantienen iguales) ... */}
        

        <nav className="sidebar-nav">
            {filteredMenuItems.map((item, index) => {
                if (item.type === 'divider') {
                    return <div key={index} className="nav-divider">{item.label}</div>;
                }
                const isActive = item.path === '/dashboard' 
                    ? location.pathname === item.path 
                    : location.pathname.includes(item.path);

                return (
                    <Link 
                        key={item.path} 
                        to={item.path} 
                        className={`nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="icon">{item.icon}</span> 
                        {item.label}
                    </Link>
                );
            })}
        </nav>

        {/* 🔥 NUEVO BOTÓN DE CAJA EN EL SIDEBAR 🔥 */}
        <div className="cash-control-area">
             <div style={{ textAlign: 'center', marginBottom: '5px', fontSize: '0.85rem', color: cashStatus.isOpen ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
               Caja: {cashStatus.isOpen ? '🟢 ABIERTA' : '🔴 CERRADA'}
             </div>
             <button 
                onClick={handleCashClick}
                className={cashStatus.isOpen ? 'btn-close-cash-sidebar' : 'btn-open-cash-sidebar'}
             >
                {cashStatus.isOpen ? (
                    <><FaLock /> Cerrar Caja</>
                ) : (
                    <><FaUnlock /> Abrir Caja</>
                )}
             </button>
        </div>


        {/* Footer para Cerrar Sesión */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn-sidebar">
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- Área de Contenido (Derecha) --- */}
      <div className="content-wrapper">
        {/* ... (Tu top-navbar y main-content se mantienen iguales) ... */}
        <header className="top-navbar">
             <div className="brand-area">
                <img src={logoImg} alt="Tu Vecino" className="top-logo" />
             </div>
             
             <div className="user-area">
                <div className="profile-pill">
                    <FaUserCircle className="profile-icon"/>
                    <div style={{display:'flex', flexDirection:'column', lineHeight:'1.2'}}>
                        <span className="profile-name">{user.fullName || 'Usuario'}</span>
                        <span className="profile-role badge">{isAdmin ? 'Administrador' : 'Vendedor'}</span>
                    </div>
                </div>
             </div>
         </header>

        <main className="main-content"> 
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}