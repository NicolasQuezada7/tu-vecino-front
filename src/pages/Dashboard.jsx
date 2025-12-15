import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  FaHome, FaBoxOpen, FaUserTie, FaUsers, FaShoppingCart, 
  FaUserCircle, FaSignOutAlt, FaHistory, FaUserShield 
} from 'react-icons/fa';
import './DashboardLayout.css';
import logoImg from '../assets/logo.png'; 

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. LECTURA DE USUARIO Y ROLES
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isAdmin = user.roles && Array.isArray(user.roles) && user.roles.includes('admin');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Aseguramos que se borre el user
    navigate('/');
  };

  // 2. MENÚ DINÁMICO SEGÚN ROL
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
      {/* --- Sidebar Izquierdo --- */}
      <aside className="sidebar">
        <div className="sidebar-header">
           <h2 className="sidebar-title">MENÚ</h2> {/* Clase del h2 alineada al CSS */}
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((item, index) => {
            if (item.type === 'divider') {
              // Usamos la clase 'nav-divider' que tienes definida
              return <div key={index} className="nav-divider">{item.label}</div>;
            }
            // Aseguramos que el path sea el inicio para el link principal /dashboard
            // La lógica de activación es correcta
            const isActive = item.path === '/dashboard' 
              ? location.pathname === item.path 
              : location.pathname.includes(item.path);

            return (
              <Link 
                key={item.path} 
                to={item.path} 
                // Usamos la clase 'nav-link' que tienes definida
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {/* Usamos la clase 'icon' que tienes definida */}
                <span className="icon">{item.icon}</span> 
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer para Cerrar Sesión */}
        <div className="sidebar-footer">
          {/* Usamos la clase 'logout-btn-sidebar' que tienes definida */}
          <button onClick={handleLogout} className="logout-btn-sidebar">
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- Área de Contenido (Derecha) --- */}
      <div className="content-wrapper">
        
        {/* BARRA SUPERIOR (Top Navbar) */}
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

        {/* El contenido principal, que tendrá el scroll */}
        <main className="main-content"> 
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};