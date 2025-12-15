import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaEdit, FaTrash, FaPlus, FaTruck } from 'react-icons/fa';

export const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  const fetchProviders = async () => {
    try {
      const res = await api.get('/providers');
      setProviders(res.data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProviders(); }, []);

  const openModal = (prov = null) => {
    if (prov) {
      setIsEditing(true);
      setCurrentId(prov.id);
      setFormData({ ...prov });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) await api.patch(`/providers/${currentId}`, formData);
      else await api.post('/providers', formData);
      
      alert('Guardado correctamente');
      setIsModalOpen(false);
      fetchProviders();
    } catch (e) { alert('Error al guardar'); }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar?')) {
      await api.delete(`/providers/${id}`);
      fetchProviders();
    }
  };

  return (
    <div>
      <div className="page-header-row">
        <h1 style={{color:'#1e3c72'}}>🚚 Proveedores</h1>
        <button className="btn-primary" onClick={()=>openModal()}><FaPlus/> Nuevo Proveedor</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <table className="data-table">
          <thead><tr><th>Empresa</th><th>Email</th><th>Teléfono</th><th>Acciones</th></tr></thead>
          <tbody>
            {providers.map(p => (
              <tr key={p.id}>
                <td style={{fontWeight:'bold'}}>{p.name}</td><td>{p.email}</td><td>{p.phone}</td>
                <td>
                  <button className="action-btn btn-edit" onClick={()=>openModal(p)}><FaEdit/></button>
                  <button className="action-btn btn-delete" onClick={()=>handleDelete(p.id)}><FaTrash/></button>
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
              <h2>{isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <button className="close-btn" onClick={()=>setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row"><label>Nombre Empresa</label><input value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} required/></div>
              <div className="form-row"><label>Email Contacto</label><input type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required/></div>
              <div className="form-row"><label>Teléfono</label><input value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})}/></div>
              <div className="form-row"><label>Dirección</label><input value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})}/></div>
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