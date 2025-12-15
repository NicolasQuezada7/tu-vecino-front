import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaEdit, FaTrash, FaPlus, FaUser } from 'react-icons/fa';

export const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, []);

  const openModal = (client = null) => {
    if (client) {
      setIsEditing(true);
      setCurrentId(client.id);
      setFormData({ ...client });
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
      if (isEditing) await api.patch(`/clients/${currentId}`, formData);
      else await api.post('/clients', formData);
      
      alert('Guardado correctamente');
      setIsModalOpen(false);
      fetchClients();
    } catch (e) { alert('Error al guardar'); }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar?')) {
      await api.delete(`/clients/${id}`);
      fetchClients();
    }
  };

  return (
    <div>
      <div className="page-header-row">
        <h1 style={{color:'#1e3c72'}}>👥 Clientes</h1>
        <button className="btn-primary" onClick={()=>openModal()}><FaPlus/> Nuevo Cliente</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <table className="data-table">
          <thead><tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Acciones</th></tr></thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td>
                <td>
                  <button className="action-btn btn-edit" onClick={()=>openModal(c)}><FaEdit/></button>
                  <button className="action-btn btn-delete" onClick={()=>handleDelete(c.id)}><FaTrash/></button>
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
              <h2>{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button className="close-btn" onClick={()=>setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row"><label>Nombre</label><input value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} required/></div>
              <div className="form-row"><label>Email</label><input type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required/></div>
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