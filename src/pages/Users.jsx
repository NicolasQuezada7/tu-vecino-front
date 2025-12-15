import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaEdit, FaTrash, FaPlus, FaUserShield, FaUserTie } from 'react-icons/fa';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', roles: 'user' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users'); 
      setUsers(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setCurrentId(user.id);
      const mainRole = user.roles && user.roles.includes('admin') ? 'admin' : 'user';
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        password: '',
        roles: mainRole
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({ fullName: '', email: '', password: '', roles: 'user' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        roles: [formData.roles],
      };
      if (!currentId || formData.password) payload.password = formData.password;

      if (currentId) await api.patch(`/users/${currentId}`, payload);
      else await api.post('/auth/register', payload);
      
      alert("Guardado correctamente");
      setIsModalOpen(false);
      fetchUsers();
    } catch (e) { alert("Error al guardar"); }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar?')) {
      await api.delete(`/users/${id}`);
      fetchUsers();
    }
  };

  return (
    <div>
      <div className="page-header-row">
        <h1 style={{color: '#1e3c72'}}>🔑 Gestión de Usuarios</h1>
        <button className="btn-primary" onClick={() => openModal()}><FaPlus /> Nuevo Usuario</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <table className="data-table">
          <thead><tr><th>Nombre</th><th>Email</th><th>Roles</th><th>Acciones</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{fontWeight: 'bold'}}>{u.fullName}</td>
                <td>{u.email}</td>
                <td>
                  {u.roles && u.roles.some(r => r === 'admin')
                    ? <span className="badge" style={{background:'#e3f2fd', color:'#1565c0'}}>Admin</span>
                    : <span className="badge" style={{background:'#f3f3f3', color:'#333'}}>Vendedor</span>
                  }
                </td>
                <td>
                  <button className="action-btn btn-edit" onClick={() => openModal(u)}><FaEdit/></button>
                  <button className="action-btn btn-delete" onClick={()=>handleDelete(u.id)}><FaTrash/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={()=>setIsModalOpen(false)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="close-btn" onClick={()=>setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row"><label>Nombre Completo</label><input value={formData.fullName} onChange={e=>setFormData({...formData, fullName:e.target.value})} required/></div>
              <div className="form-row"><label>Email</label><input type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required/></div>
              <div className="form-row"><label>{isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</label><input type="password" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} required={!isEditing}/></div>
              <div className="form-row">
                <label>Rol</label>
                <select value={formData.roles} onChange={e=>setFormData({...formData, roles:e.target.value})}>
                  <option value="user">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={()=>setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};