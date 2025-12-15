import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaIdCard, FaEnvelope } from 'react-icons/fa';

export const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Leemos el usuario del localStorage (lo guardamos al hacer login)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
      
      <FaUserCircle style={{ fontSize: '6rem', color: '#2a5298', marginBottom: '20px' }} />
      
      <h1 style={{ color: '#333', marginBottom: '5px' }}>{user.fullName}</h1>
      <span style={{ background: user.roles.includes('admin') ? '#e3f2fd' : '#f3f3f3', color: user.roles.includes('admin') ? '#1565c0' : '#333', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
        {user.roles.includes('admin') ? 'Administrador' : 'Vendedor'}
      </span>

      <div style={{ marginTop: '40px', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
          <FaEnvelope style={{ fontSize: '1.5rem', color: '#666', marginRight: '15px' }} />
          <div>
            <small style={{ color: '#888' }}>Correo Electrónico</small>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user.email}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
          <FaIdCard style={{ fontSize: '1.5rem', color: '#666', marginRight: '15px' }} />
          <div>
            <small style={{ color: '#888' }}>ID de Usuario</small>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>#{user.id}</div>
          </div>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        style={{ marginTop: '20px', background: '#dc3545', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}
      >
        <FaSignOutAlt style={{ marginRight: '10px' }} /> Cerrar Sesión
      </button>

    </div>
  );
};